import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Stack, useNavigation, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/Themed";
import Icon from "@/components/Icon";
import MyRichEditor from "@/components/RichTextEditor";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { TNote, TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import { bibleState$ } from "@/state/bibleState";
import { useNoteService } from "@/services/noteService";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import * as Crypto from "expo-crypto";
import { quoteTemplates } from "@/constants/quoteTemplates";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { QuoteCard } from "@/components/quote/QuoteCard";
import { QuoteNavigationDots } from "@/components/quote/QuoteNavigationDots";
import { CustomQuoteMode } from "@/components/quote/CustomQuoteMode";
import { useQuoteCardStack } from "@/hooks/useQuoteCardStack";

const COLORS = [
  "#2EC4F1", // blue
  "#4FC3F7", // light blue
  "#64B5F6", // sky blue
  "#81C784", // green
  "#AED581", // light green
  "#DCE775", // yellow green
  "#FFF176", // yellow
  "#FFB300", // orange
  "#FF7043", // deep orange
  "#D84315", // burnt orange
  "#8E24AA", // purple
  "#6A1B9A", // deep purple
  "#3949AB", // indigo
  "#1E88E5", // blue
  "#00897B", // teal
  "#43A047", // green
  "#388E3C", // dark green
  "#C62828", // red
  "#AD1457", // pink
  "#F06292", // light pink
  "#607D8B", // blue grey
];

type FontType = {
  readonly label: "Aa";
  readonly fontFamily: "System" | "serif" | "sans-serif" | "monospace";
  readonly fontWeight: "400" | "700";
};

const FONTS: readonly FontType[] = [
  { label: "Aa", fontFamily: "System", fontWeight: "400" },
  { label: "Aa", fontFamily: "serif", fontWeight: "400" },
  { label: "Aa", fontFamily: "sans-serif", fontWeight: "700" },
  { label: "Aa", fontFamily: "monospace", fontWeight: "400" },
  { label: "Aa", fontFamily: "System", fontWeight: "700" },
] as const;

type QuoteProps = {};

const Quote: React.FC<QuoteProps> = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { printToFile } = usePrintAndShare();
  const { createNote } = useNoteService();
  const [quoteText, setQuoteText] = useState("");
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedFont, setSelectedFont] = useState<FontType>(FONTS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState(quoteTemplates[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [reference, setReference] = useState("");
  const webViewRef = useRef<WebView>(null);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const {
    pan,
    rotate,
    currentCardScale,
    currentCardOpacity,
    panResponder,
    renderCardRange,
    screenWidth,
  } = useQuoteCardStack({
    currentIndex: currentTemplateIndex,
    totalTemplates: quoteTemplates.length,
    onIndexChange: setCurrentTemplateIndex,
  });
  console.log(renderCardRange);
  const scrollViewRef = useRef<ScrollView>(null);
  const titleOpacity = useRef(new Animated.Value(1)).current;
  const subTitleOpacity = useRef(new Animated.Value(1)).current;
  const titleTranslateY = useRef(new Animated.Value(0)).current;
  const subTitleTranslateY = useRef(new Animated.Value(0)).current;

  const selectedVerse = use$(() => bibleState$.selectedVerseForNote.get());
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params?.text && typeof params.text === "string") {
      setQuoteText(params.text);
    } else if (selectedVerse) {
      setQuoteText(selectedVerse);
    }
    if (params?.reference && typeof params.reference === "string") {
      setReference(params.reference);
    } else {
      setReference("");
    }
  }, [params, selectedVerse]);

  useEffect(() => {
    if (!customMode && selectedTemplate) {
      setSelectedColor(COLORS[0]);
      setSelectedFont(FONTS[0]);
      if (params?.text && typeof params.text === "string") {
        setQuoteText(params.text);
      } else {
        setQuoteText(selectedVerse || "");
      }
      if (params?.reference && typeof params.reference === "string") {
        setReference(params.reference);
      } else {
        setReference("");
      }
    }
  }, [selectedTemplate, customMode, params, selectedVerse]);

  useEffect(() => {
    if (!customMode) {
      setSelectedTemplate(quoteTemplates[currentTemplateIndex]);
    }
    if (scrollViewRef.current) {
      const dotWidth = 8 + 8;
      const centerOffset = screenWidth / 2 - dotWidth / 2;
      const scrollToX = currentTemplateIndex * dotWidth - centerOffset;
      const maxScrollX = (quoteTemplates.length + 1) * dotWidth - screenWidth;
      const limitedScrollToX = Math.max(0, Math.min(maxScrollX, scrollToX));

      scrollViewRef.current.scrollTo({ x: limitedScrollToX, animated: true });
    }
  }, [currentTemplateIndex, customMode, screenWidth]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(subTitleOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslateY, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(subTitleTranslateY, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!customMode) {
        setSelectedTemplate(quoteTemplates[currentTemplateIndex]);
      }
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 150,
          delay: 50,
          useNativeDriver: true,
        }),
        Animated.timing(subTitleOpacity, {
          toValue: 1,
          duration: 150,
          delay: 50,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 150,
          delay: 50,
          useNativeDriver: true,
        }),
        Animated.timing(subTitleTranslateY, {
          toValue: 0,
          duration: 150,
          delay: 50,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [currentTemplateIndex, customMode, screenWidth]);

  const captureScreenshot = () => {
    const script = `
      (function() {
        try {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          const html = document.documentElement;
          
          canvas.width = html.scrollWidth;
          canvas.height = html.scrollHeight;
          
          // Create a temporary div to render the content
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.top = '-9999px';
          tempDiv.innerHTML = html.innerHTML;
          document.body.appendChild(tempDiv);
          
          // Use html2canvas-like approach
          const data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + canvas.width + '" height="' + canvas.height + '">' +
            '<foreignObject width="100%" height="100%">' +
            '<div xmlns="http://www.w3.org/1999/xhtml" style="background-color: ${
              customMode ? selectedColor : "transparent"
            }">' +
            tempDiv.innerHTML +
            '</div>' +
            '</foreignObject>' +
            '</svg>';
          
          const img = new Image();
          img.onload = function() {
            context.drawImage(img, 0, 0);
            const base64 = canvas.toDataURL('image/png');
            window.ReactNativeWebView.postMessage(base64);
            document.body.removeChild(tempDiv);
          };
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
        } catch (error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ error: error.message }));
        }
      })();
      true;
    `;

    webViewRef.current?.injectJavaScript(script);
  };

  const handleWebViewMessage = async (event: any) => {
    try {
      console.log(
        "Received message from WebView:",
        event.nativeEvent.data.substring(0, 100) + "..."
      );

      const data = event.nativeEvent.data;

      // Check if it's an error message
      if (data.startsWith("{")) {
        const errorData = JSON.parse(data);
        if (errorData.error) {
          throw new Error(errorData.error as string);
        }
      }

      // Check if it's a base64 image
      if (data.startsWith("data:image/png;base64,")) {
        const imageData = data.replace("data:image/png;base64,", "");
        const fileUri = FileSystem.documentDirectory + "quote-screenshot.png";

        console.log("Saving screenshot to:", fileUri);

        await FileSystem.writeAsStringAsync(fileUri, imageData, {
          encoding: FileSystem.EncodingType.Base64,
        });

        console.log("Screenshot saved successfully");
        setScreenshotUri(fileUri);

        if (await Sharing.isAvailableAsync()) {
          console.log("Sharing screenshot...");
          await Sharing.shareAsync(fileUri, {
            mimeType: "image/png",
            dialogTitle: "Share Quote",
            UTI: "public.png",
          });
          console.log("Share dialog opened");
        } else {
          console.log("Sharing not available");
          Alert.alert("Error", "Sharing is not available on this device");
        }
      }
    } catch (error: any) {
      console.error("Error handling screenshot:", error);
      Alert.alert(
        "Error",
        "Failed to capture screenshot: " + (error?.message || "Unknown error")
      );
    }
  };

  const handleShare = async () => {
    if (!quoteText.trim()) {
      Alert.alert("Error", "Please enter a quote before sharing");
      return;
    }
    setIsLoading(true);
    try {
      console.log("Starting share process...");

      if (customMode) {
        console.log("Custom mode detected, updating WebView content...");
        const verseText = getVerseTextRaw(quoteText);
        const verseRef = reference;
        const html = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;width:100vw;background:${selectedColor};flex-direction:column;"><span style=\"color:#fff;font-size:2.5em;font-family:${selectedFont.fontFamily};font-weight:${selectedFont.fontWeight};\">${verseText}</span><span style=\"color:#fff;font-size:1.2em;margin-top:2em;opacity:0.8;\">${verseRef}</span></div>`;

        // Wait a bit for the content to render
        await new Promise((resolve) => setTimeout(resolve, 100));
        webViewRef.current?.injectJavaScript(
          `document.body.innerHTML = \`${html}\`; true;`
        );

        // Wait a bit more for the content to be fully rendered
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      console.log("Capturing screenshot...");
      captureScreenshot();
    } catch (error: any) {
      console.error("Error in handleShare:", error);
      Alert.alert(
        "Error",
        "Failed to share quote: " + (error?.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDotPress = (index: number) => {
    if (index < quoteTemplates.length) {
      setCurrentTemplateIndex(index);
      setCustomMode(false);
    } else {
      setCustomMode(true);
    }
  };

  const screenOptions: any = useMemo(() => {
    return {
      theme,
      title: "Create Quote",
      titleIcon: "Quote",
      headerRightProps: {
        headerRightIconColor: theme.colors.text,
        RightComponent: () => (
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={handleShare}
              disabled={isLoading}
              style={styles.headerButton}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.text} />
              ) : (
                <Icon name="Share2" size={24} color={theme.colors.text} />
              )}
            </TouchableOpacity>
          </View>
        ),
      },
    };
  }, [theme.colors, handleShare, isLoading]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Stack.Screen options={singleScreenHeader(screenOptions)} />
        <View style={styles.headerContent}>
          <Animated.Text
            style={[
              styles.mainTitle,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            {customMode
              ? "Custom"
              : quoteTemplates[currentTemplateIndex]?.name || "Loading..."}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.subTitle,
              {
                opacity: subTitleOpacity,
                transform: [{ translateY: subTitleTranslateY }],
              },
            ]}
          >
            {customMode
              ? "Create your own style"
              : quoteTemplates[currentTemplateIndex]?.description ||
                "Select a template"}
          </Animated.Text>
        </View>
        {customMode ? (
          <CustomQuoteMode
            selectedColor={selectedColor}
            selectedFont={selectedFont}
            quoteText={quoteText}
            reference={reference}
            onColorSelect={(color) => {
              setSelectedColor(color);
              setCustomMode(true);
            }}
            onFontSelect={(font) => {
              setSelectedFont(font);
              setCustomMode(true);
            }}
            onQuoteTextChange={setQuoteText}
            onReferenceChange={setReference}
            colors={COLORS}
            fonts={FONTS}
          />
        ) : (
          <View style={styles.templateContent}>
            {renderCardRange.map((index) => {
              const template = quoteTemplates[index];
              const isCurrent = index === currentTemplateIndex;
              const distance = Math.abs(index - currentTemplateIndex);

              return (
                <QuoteCard
                  key={template.id.toString()}
                  template={{
                    id: template.id.toString(),
                    template: template.template,
                  }}
                  index={index}
                  isCurrent={isCurrent}
                  distance={distance}
                  currentTemplateIndex={currentTemplateIndex}
                  pan={pan}
                  rotate={rotate}
                  currentCardScale={currentCardScale}
                  currentCardOpacity={currentCardOpacity}
                  screenWidth={screenWidth}
                  panResponder={panResponder}
                  reference={reference}
                  quoteText={quoteText}
                  onWebViewMessage={handleWebViewMessage}
                />
              );
            })}
          </View>
        )}
        <QuoteNavigationDots
          currentIndex={currentTemplateIndex}
          totalTemplates={quoteTemplates.length}
          customMode={customMode}
          onDotPress={handleDotPress}
          scrollViewRef={scrollViewRef}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      paddingTop: 20,
    },
    headerContent: {
      alignItems: "center",
      marginBottom: 20,
    },
    mainTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    subTitle: {
      fontSize: 16,
      color: colors.text + "99",
      textAlign: "center",
      marginHorizontal: 20,
      marginTop: 5,
    },
    templateContent: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    headerButtons: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    headerButton: {
      padding: 8,
    },
  });

export default Quote;
