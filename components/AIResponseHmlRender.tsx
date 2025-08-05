import { useTheme } from "@/context/ThemeContext";
import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import Icon from "./Icon";
import { Text } from "./Themed";

interface AIResponseProps {
  response: string;
}

const DEFAULT_HEIGHT = 1200;
const EXTRA_HEIGHT_TO_ADJUST = 150;

export default function AIResponseHmlRender({ response }: AIResponseProps) {
  const { theme } = useTheme();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const webViewRef = React.useRef<WebView>(null);

  const htmlResponse = useMemo(() => {
    return `<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Explicación Bíblica - IA</title>
                    <style>
                        body {
                            font-family: 'Georgia', 'Times New Roman', serif;
                            padding: 30px;
                            line-height: 1.8;
                            color: ${theme.colors.text};
                            max-width: 100%;
                            margin: 0 auto;
                            background: transparent;
                            -webkit-user-select: none;
                            -moz-user-select: none;
                            -ms-user-select: none;
                            user-select: none;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 40px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid ${theme.colors.border};
                        }
                        .title {
                            font-size: 24px;
                            font-weight: bold;
                            color: ${theme.colors.text};
                            margin-bottom: 10px;
                        }
                        .subtitle {
                            font-size: 14px;
                            color: ${theme.colors.text};
                            font-style: italic;
                        }
                        .content {
                            background: ${theme.colors.card};
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                            width: 100%;
                            box-sizing: border-box;
                        }
                        h1, h2, h3 {
                            color: ${theme.colors.text};
                            margin-top: 30px;
                            margin-bottom: 15px;
                        }
                        p {
                            margin-bottom: 15px;
                            text-align: justify;
                        }
                        strong {
                            color: ${theme.colors.notification};
                        }
                        em {
                            color: ${theme.colors.text};
                        }
                        blockquote {
                            border-left: 4px solid ${theme.colors.notification};
                            padding-left: 20px;
                            margin: 20px 0;
                            font-style: italic;
                            background: ${theme.colors.card};
                            padding: 15px 20px;
                            border-radius: 0 5px 5px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid ${theme.colors.border};
                            font-size: 12px;
                            color: ${theme.colors.text};
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">📖 Explicación Bíblica</div>
                        <div class="subtitle">Generado por Inteligencia Artificial • ${new Date().toLocaleDateString(
                          "es-ES"
                        )}</div>
                    </div>
                    <div class="content">
                        ${response
                          .replace(/\n\n/g, "</p><p>")
                          .replace(/\n/g, "<br/>")
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\*(.*?)\*/g, "<em>$1</em>")
                          .replace(/^(.+)$/gm, "<p>$1</p>")}
                    </div>
                    <div class="footer">
                        Esta explicación fue generada por IA y puede contener interpretaciones subjetivas.<br/>
                        Siempre consulte con líderes espirituales calificados para un estudio más profundo.
                    </div>
                    <script>
                        window.ReactNativeWebView.postMessage(document.body.scrollHeight);
                    </script>
                </body>
                </html>
            `;
  }, [response]);

  useEffect(() => {
    // Animate content entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [response]);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(response);
      setCopySuccess(true);
      Vibration.vibrate(50); // Haptic feedback
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error("Error copying text:", error);
      Alert.alert("Error", "No se pudo copiar el texto");
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const htmlContent = htmlResponse;
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Compartir Explicación Bíblica",
      });
    } catch (error) {
      console.error("Error generating/sharing PDF:", error);
      Alert.alert("Error", "No se pudo generar el PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const wordCount = response.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  const styles = getStyles(theme);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          height: height + EXTRA_HEIGHT_TO_ADJUST,
        },
      ]}
    >
      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Icon name="Clock" size={16} color={theme.colors.text + "80"} />
          <Text style={styles.statText}>{readingTime} min lectura</Text>
        </View>
        <View style={styles.stat}>
          <Icon name="FileText" size={16} color={theme.colors.text + "80"} />
          <Text style={styles.statText}>{wordCount} palabras</Text>
        </View>
      </View>

      {/* Enhanced Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.toolbarButton, copySuccess && styles.successButton]}
          onPress={handleCopy}
          disabled={copySuccess}
        >
          <View style={styles.buttonContent}>
            <Icon
              name={copySuccess ? "CircleCheck" : "Copy"}
              size={20}
              color={copySuccess ? "#10b981" : theme.colors.text}
            />
            <Text
              style={[
                styles.toolbarButtonText,
                { color: copySuccess ? "#10b981" : theme.colors.text },
              ]}
            >
              {copySuccess ? "¡Copiado!" : "Copiar"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolbarButton,
            isGeneratingPDF && styles.loadingButton,
          ]}
          onPress={generatePDF}
          disabled={isGeneratingPDF}
        >
          <View style={styles.buttonContent}>
            {isGeneratingPDF ? (
              <Animated.View style={{ transform: [{ rotate: "45deg" }] }}>
                <Icon name="Loader" size={20} color={theme.colors.text} />
              </Animated.View>
            ) : (
              <Icon name="Share" size={20} color={theme.colors.text} />
            )}
            <Text
              style={[styles.toolbarButtonText, { color: theme.colors.text }]}
            >
              {isGeneratingPDF ? "Generando..." : "Compartir PDF"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content Card */}
      <View style={styles.webviewWrapper}>
        <WebView
          ref={webViewRef}
          style={{ backgroundColor: "transparent" }}
          source={{ html: htmlResponse }}
          onMessage={(event) => {
            const isNumber = !isNaN(+event.nativeEvent.data);
            if (isNumber) {
              setHeight(+event.nativeEvent.data || DEFAULT_HEIGHT);
            }
          }}
          scrollEnabled
        />
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.disclaimerContainer}>
          <Icon name="Info" size={16} color={theme.colors.text + "60"} />
          <Text style={styles.disclaimerText}>
            Esta respuesta fue generada por IA. Siempre consulte fuentes
            adicionales para un estudio más completo.
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    webviewWrapper: {
      width: "100%",
      padding: 0,
      height: "100%",
      backgroundColor: "transparent",
    },
    statsBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginBottom: 8,
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card + "60",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statText: {
      marginLeft: 6,
      fontSize: 12,
      color: theme.colors.text + "80",
      fontWeight: "500",
    },
    toolbar: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 12,
    },
    toolbarButton: {
      flex: 1,
      backgroundColor: theme.colors.card + "80",
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.colors.border + "40",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    successButton: {
      backgroundColor: "#10b981" + "20",
      borderColor: "#10b981" + "40",
    },
    loadingButton: {
      opacity: 0.7,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    toolbarButtonText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: "600",
    },
    cardFooter: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + "30",
      padding: 16,
      backgroundColor: "transparent",
    },
    disclaimerContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: theme.colors.background + "60",
      padding: 12,
      borderRadius: 8,
    },
    disclaimerText: {
      flex: 1,
      marginLeft: 8,
      fontSize: 12,
      color: theme.colors.text + "70",
      lineHeight: 18,
      fontStyle: "italic",
    },
  });
