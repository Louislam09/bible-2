import AiErrorAlert from "@/components/ai/AiErrorAlert";
import AiTextScannerAnimation from "@/components/ai/AiTextScannerAnimation";
import { aiHtmlTemplate, aiHtmlTemplatePrint } from "@/constants/HtmlTemplate";
import { iconSize } from "@/constants/size";
import { useNoteService } from "@/services/noteService";
import { bibleState$ } from "@/state/bibleState";
import { Screens, TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Vibration,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import Icon, { IconProps } from "../Icon";
import { Text } from "../Themed";
import { useAlert } from "@/context/AlertContext";

type VerseExplanationProps = {
  theme: TTheme;
  fontSize: number;
  navigation: any;
  aiResponse: AIResponse;
};

interface AIResponse {
  explanation: string;
  loading: boolean;
  error: string | null;
  fetchExplanation: (verse: {
    text: string;
    reference: string;
  }) => Promise<void>;
}

const DEFAULT_HEIGHT = 1200;
const EXTRA_HEIGHT_TO_ADJUST = 150;

type HeaderAction = {
  iconName: IconProps["name"];
  description: string;
  onAction: () => void;
  disabled?: boolean;
};

function extractTitleFromResponse(response: string): string | null {
  const titleMatch = response.match(/🔖\s*\*\*(.+?)\*\*/);
  return titleMatch ? titleMatch[1].trim() : null;
}

const AiVerseExplanationContent: React.FC<VerseExplanationProps> = ({
  theme,
  fontSize,
  navigation,
  aiResponse,
}) => {
  const verse = use$(() => bibleState$.verseToExplain.get());
  const { explanation, loading, error } = aiResponse;
  //   const explanation = mock;
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const webViewRef = React.useRef<WebView>(null);
  const { createNote } = useNoteService();
  const { alertError } = useAlert();
  const htmlResponse = useMemo(() => {
    return aiHtmlTemplate(explanation, theme.colors, fontSize, false);
  }, [explanation, fontSize]);

  useEffect(() => {
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
  }, []);

  const handleConfigAi = () => {
    navigation.navigate(Screens.AISetup);
  };

  const handleSaveNote = async () => {
    const titleFromExplanation = extractTitleFromResponse(explanation);
    await createNote({
      title: titleFromExplanation || "Explicación Bíblica",
      note_text: htmlResponse,
    });
    setIsNoteSaved(true);
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(explanation || "");
      setCopySuccess(true);
      Vibration.vibrate(50); // Haptic feedback
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error("Error copying text:", error);
      alertError("Error", "No se pudo copiar el texto");
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
      alertError("Error", "No se pudo generar el PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const styles = getStyles(theme, fontSize);

  const headerActions: HeaderAction[] = useMemo(
    () => [
      {
        iconName: loading ? "Loader" : isNoteSaved ? "Check" : "NotebookPen",
        description: loading
          ? "Generando..."
          : isNoteSaved
            ? "¡Nota guardada!"
            : "Guardar nota",
        onAction: () => handleSaveNote(),
        disabled: loading || isNoteSaved,
      },
      {
        iconName: copySuccess ? "CircleCheck" : "Copy",
        description: copySuccess ? "¡Copiado!" : "Copiar",
        onAction: () => handleCopy(),
      },
      {
        iconName: isGeneratingPDF ? "Loader" : "Share2",
        description: isGeneratingPDF ? "Generando..." : "Compartir PDF",
        onAction: () => generatePDF(),
      },
    ],
    [loading, isGeneratingPDF, copySuccess, isNoteSaved]
  );

  const RenderItem = ({ item }: { item: HeaderAction }) => {
    return (
      <Animated.View style={[styles.actionItem]}>
        <Pressable
          android_ripple={{
            color: item.disabled
              ? theme.colors.background + 50
              : theme.colors.background,
            foreground: true,
            radius: 10,
          }}
          style={{
            opacity: item.disabled ? 0.5 : 1,
          }}
          onPress={item.onAction}
          disabled={item.disabled}
        >
          <Icon
            name={item.iconName}
            size={iconSize}
            color={theme.colors.notification}
          />
        </Pressable>
        <Text style={styles.actionItemText}>{item.description}</Text>
      </Animated.View>
    );
  };

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
      <View style={styles.header}>
        <View style={styles.actionContainer}>
          {headerActions.map((item, index) => (
            <RenderItem key={index} item={item} />
          ))}
        </View>
      </View>

      <View style={styles.webviewWrapper}>
        {loading && (
          <AiTextScannerAnimation
            verse={verse.text}
            theme={theme}
            fontSize={fontSize}
            style={{
              alignItems: "flex-start",
              justifyContent: "flex-start",
            }}
          />
        )}
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
            {...createOptimizedWebViewProps({}, "dynamic")}
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
