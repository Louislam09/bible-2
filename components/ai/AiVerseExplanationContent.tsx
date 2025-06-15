import AiErrorAlert from "@/components/ai/AiErrorAlert";
import AiTextScannerAnimation from "@/components/ai/AiTextScannerAnimation";
import { aiHtmlTemplate, aiHtmlTemplatePrint } from "@/constants/HtmlTemplate";
import { iconSize } from "@/constants/size";
import { useGoogleAI } from "@/hooks/useGoogleAI";
import { bibleState$ } from "@/state/bibleState";
import { Screens, TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  View
} from "react-native";
import { WebView } from "react-native-webview";
import Icon from "../Icon";
import { Text } from "../Themed";

type VerseExplanationProps = {
  theme: TTheme;
  fontSize: number;
  navigation: any;
};

const DEFAULT_HEIGHT = 1200;
const EXTRA_HEIGHT_TO_ADJUST = 150;

const AiVerseExplanationContent: React.FC<VerseExplanationProps> = ({
  theme,
  fontSize,
  navigation,
}) => {
  const verse = use$(() => bibleState$.verseToExplain.get());
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
    return aiHtmlTemplate(explanation, theme.colors, fontSize, false);
  }, [explanation, fontSize]);

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

  const handleConfigAi = () => {
    navigation.navigate(Screens.AISetup);
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
        html: aiHtmlTemplatePrint(explanation),
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
        {loading && <AiTextScannerAnimation verse={verse.text} theme={theme} fontSize={fontSize} />}
        {error && (
          <AiErrorAlert
            theme={theme}
            fontSize={fontSize}
            error={error}
            onConfigAi={handleConfigAi}
          />
        )}
        {!loading && !error && (
          <WebView
            ref={webViewRef}
            style={{ flex: 1, backgroundColor: "transparent" }}
            source={{ html: htmlResponse }}
            onMessage={(event) => {
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


const getStyles = (theme: TTheme, fontSize: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark
        ? theme.colors.background + 99
        : theme.colors.background,
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

export default AiVerseExplanationContent;
