import { useGoogleAI } from "@/hooks/useGoogleAI";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { TTheme } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  Vibration,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import Icon from "./Icon";
import { Text } from "./Themed";
import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { iconSize } from "@/constants/size";

type VerseExplanationProps = {
  theme: TTheme;
  fontSize: number;
};

const DEFAULT_HEIGHT = 1200;
const EXTRA_HEIGHT_TO_ADJUST = 150;
export const mock = `📖 **Versículo y Referencia:**

"En el principio creó Dios los cielos y la tierra." (Génesis 1:1 RVR1960)


🔍 **Análisis Lingüístico y Exegético:**

* **En el principio (בְּרֵאשִׁית - *Bereshit*):** Esta palabra hebrea, que da título al libro de Génesis, significa literalmente "en el comienzo" o "en la cabeza".  No implica un comienzo en el tiempo en el sentido de un punto específico, sino un comienzo absoluto y primordial.  La preposición בְּ ( *bet* ) indica una relación de tiempo o lugar, situando la creación en el punto inicial de todo lo existente.

* **Creó (בָרָא - *bara*):** Este verbo hebreo es significativo.  No es el verbo común para "hacer" o "formar" (*asah*), sino un verbo que implica creación *ex nihilo*, es decir, creación de la nada.  Implica un acto de poder divino único y trascendente, diferente a cualquier proceso de formación o transformación de materia preexistente.

* **Dios (אֱלֹהִים - *Elohim*):**  Este término hebreo es un sustantivo plural que se usa para referirse a la deidad.  Aunque gramaticalmente plural, se usa con un verbo singular en este versículo, reflejando la unicidad de Dios a pesar de la pluralidad inherente a su naturaleza (un tema que se explora en otros pasajes bíblicos).

* **Los cielos (הַשָּׁמַיִם - *hashamayim*):** Se refiere a los cielos, incluyendo el firmamento y todo lo que está más allá.

* **Y la tierra (וְהָאָרֶץ - *vehaaretz*):** Se refiere a la tierra, incluyendo todo lo que contiene.  La conjunción וְ (*ve*) indica una unión inseparable entre los cielos y la tierra, ambos creados por Dios en este acto primordial.


📚 **Referencias Bíblicas Relacionadas:**

* **Salmo 33:6:** "Por la palabra de Jehová fueron hechos los cielos, y todo el ejército de ellos por el aliento de su boca."  Este versículo enfatiza la creación por medio de la palabra de Dios, mostrando el poder creativo inherente a su habla.

* **Hebreos 11:3:** "Por la fe entendemos haber sido constituido el universo por la palabra de Dios, de modo que lo que se ve fue hecho de lo que no se veía."  Este pasaje conecta la creación con la fe, destacando la naturaleza invisible de la fuente de la creación y la dependencia de la fe para comprenderla.

* **Isaías 45:18:** "Porque así dijo Jehová, que creó los cielos; él es Dios, el que formó la tierra y la hizo, él la estableció; no la creó para estar desierta, sino la formó para ser habitada: Yo soy Jehová, y no hay otro."  Este versículo reafirma la creación de los cielos y la tierra por Jehová, enfatizando su unicidad y propósito en la creación.

* **Apocalipsis 4:11:** "Señor nuestro, Dios nuestro, digno eres de recibir la gloria y la honra y el poder; porque tú creaste todas las cosas, y por tu voluntad existen y fueron creadas."  Este pasaje, desde el final de la Biblia, reafirma la creación de todas las cosas por Dios y su soberanía sobre ellas.


🧠 **Conclusión Exegética:**

Génesis 1:1 declara la creación *ex nihilo* de los cielos y la tierra por Dios en un acto primordial.  El versículo establece el fundamento teológico de la creación, atribuyendo la existencia de todo lo que es a un acto único y trascendente de Dios, utilizando un lenguaje que enfatiza su poder y soberanía.  Este acto inicial es fundamental para la comprensión de la narrativa bíblica completa, estableciendo el contexto para la creación del hombre y la relación entre Dios y su creación.  La creación no es un proceso gradual o evolutivo, sino un acto de voluntad divina que da origen a todo lo existente.`;

const VerseExplanationContent: React.FC<VerseExplanationProps> = ({
  theme,
  fontSize,
}) => {
  const verse = bibleState$.verseToExplain.get();
  const { explanation, loading, error, fetchExplanation } = useGoogleAI();
  //   const explanation = mock;
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [retryCount, setRetryCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const webViewRef = React.useRef<WebView>(null);

  const htmlResponse = useMemo(() => {
    return `
    <!DOCTYPE html>
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
                background: transparent;
                padding: 0;
                border-radius: 0;
                box-shadow: none;
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
                padding: 15px 20px;
                border-radius: 0;
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
            ${
              explanation
                ?.replace(/\n\n/g, "</p><p>")
                .replace(/\n/g, "<br/>")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.*?)\*/g, "<em>$1</em>")
                .replace(/^(.+)$/gm, "<p>$1</p>") || ""
            }
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
  }, [explanation]);

  useEffect(() => {
    if (verse.text) {
      fetchExplanation(verse);
      // Fade in animation
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
    }
  }, [verse, retryCount]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(explanation || "");
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
      const { uri } = await Print.printToFileAsync({
        html: htmlResponse,
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

  const styles = getStyles(theme, fontSize);

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
      {/* Header with Actions */}
      <View style={styles.header}>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionItem, copySuccess && styles.successButton]}
            onPress={handleCopy}
            disabled={copySuccess}
          >
            <Icon
              name={copySuccess ? "CircleCheck" : "Copy"}
              size={iconSize}
              color={copySuccess ? "#10b981" : theme.colors.notification}
            />
            <Text
              style={[
                styles.actionItemText,
                { color: copySuccess ? "#10b981" : theme.colors.text },
              ]}
            >
              {copySuccess ? "¡Copiado!" : "Copiar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionItem, isGeneratingPDF && styles.loadingButton]}
            onPress={generatePDF}
            disabled={isGeneratingPDF}
          >
            <Icon
              name={isGeneratingPDF ? "Loader" : "Share"}
              size={iconSize}
              color={theme.colors.notification}
            />
            <Text style={styles.actionItemText}>
              {isGeneratingPDF ? "Generando..." : "Compartir PDF"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.webviewWrapper}>
        {loading && <LoadingComponent theme={theme} fontSize={fontSize} />}
        {error && (
          <ErrorComponent
            theme={theme}
            fontSize={fontSize}
            error={error}
            onRetry={handleRetry}
          />
        )}
        {!loading && !error && (
          <WebView
            ref={webViewRef}
            style={{ flex: 1, backgroundColor: "transparent" }}
            source={{ html: htmlResponse }}
            onMessage={(event) => {
              console.log("event", event.nativeEvent.data);
              const isNumber = !isNaN(+event.nativeEvent.data);
              if (isNumber) {
                setHeight(+event.nativeEvent.data || DEFAULT_HEIGHT);
              }
            }}
            scrollEnabled
          />
        )}
      </View>
    </Animated.View>
  );
};

// Loading Component
const LoadingComponent: React.FC<{
  theme: TTheme;
  fontSize: number;
}> = ({ theme, fontSize }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={getLoadingStyles(theme).container}>
      <ActivityIndicator size="large" color={theme.colors.notification} />
      <Text
        style={[getLoadingStyles(theme).text, { fontSize: fontSize * 0.9 }]}
      >
        Analizando el versículo{dots}
      </Text>
      <Text
        style={[getLoadingStyles(theme).subText, { fontSize: fontSize * 0.8 }]}
      >
        Esto puede tomar unos segundos
      </Text>
    </View>
  );
};

// Error Component
const ErrorComponent: React.FC<{
  theme: TTheme;
  fontSize: number;
  error: string;
  onRetry: () => void;
}> = ({ theme, fontSize, error, onRetry }) => {
  return (
    <View style={getErrorStyles(theme).container}>
      <Text style={getErrorStyles(theme).icon}>⚠️</Text>
      <Text style={[getErrorStyles(theme).title, { fontSize: fontSize * 1.1 }]}>
        Error al obtener explicación
      </Text>
      <Text
        style={[getErrorStyles(theme).message, { fontSize: fontSize * 0.9 }]}
      >
        {error}
      </Text>
      <TouchableOpacity
        style={getErrorStyles(theme).retryButton}
        onPress={onRetry}
      >
        <Text
          style={[
            getErrorStyles(theme).retryText,
            { fontSize: fontSize * 0.9 },
          ]}
        >
          🔄 Intentar de nuevo
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme: TTheme, fontSize: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
      width: "100%",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "90%",
      backgroundColor: "transparent",
    },
    actionContainer: {
      flexDirection: "row",
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "space-between",
    },
    actionItem: {
      alignItems: "center",
      marginHorizontal: 4,
      paddingVertical: 2,
      paddingHorizontal: 4,
      paddingLeft: 10,
    },
    successButton: {
      backgroundColor: "#10b981" + "20",
    },
    loadingButton: {
      opacity: 0.7,
    },
    actionItemText: {
      fontSize: 12,
      color: theme.colors.text,
      textAlign: "center",
      fontWeight: "bold",
    },
    subHeader: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      width: "90%",
      paddingVertical: 5,
      backgroundColor: "transparent",
    },
    subTitle: {
      justifyContent: "space-between",
      textTransform: "capitalize",
      fontSize: 20,
      textAlign: "center",
      paddingVertical: 5,
      textDecorationLine: "underline",
      color: theme.colors.text,
      fontWeight: "bold",
    },
    webviewWrapper: {
      width: "100%",
      height: "100%",
      backgroundColor: "transparent",
    },
  });

const getLoadingStyles = (theme: TTheme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },
    text: {
      marginTop: 16,
      color: theme.colors.text,
      fontWeight: "500",
    },
    subText: {
      marginTop: 8,
      color: theme.colors.text,
      opacity: 0.6,
      textAlign: "center",
    },
  });

const getErrorStyles = (theme: TTheme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 32,
    },
    icon: {
      fontSize: 48,
      marginBottom: 16,
    },
    title: {
      fontWeight: "600",
      color: "#FF6B6B",
      marginBottom: 12,
      textAlign: "center",
    },
    message: {
      color: theme.colors.text,
      opacity: 0.7,
      textAlign: "center",
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    retryButton: {
      backgroundColor: theme.colors.notification,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryText: {
      color: "white",
      fontWeight: "600",
    },
  });

export default VerseExplanationContent;
