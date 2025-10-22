import { StoryList } from "@/components/animations/story-list/components/story-list";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import { CustomQuoteMode } from "@/components/quote/CustomQuoteMode";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text } from "@/components/Themed";
import { FAMOUS_VERSES } from "@/constants/quotesData";
import { quoteTemplates } from "@/constants/quoteTemplates";
import { useMyTheme } from "@/context/ThemeContext";
import { useViewShot } from "@/hooks/useViewShot";
import { bibleState$ } from "@/state/bibleState";
import { TTheme } from "@/types";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";
import { WebView } from "react-native-webview";

const COLORS = [
  "#2EC4F1", // blue
  "#0288D1", // darker light blue (replaced #4FC3F7)
  "#1976D2", // darker sky blue (replaced #64B5F6)
  "#81C784", // green (already good)
  "#689F38", // darker light green (replaced #AED581)
  "#AFB42B", // darker yellow green (replaced #DCE775)
  "#FBC02D", // darker yellow (replaced #FFF176)
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
  "#C2185B", // darker light pink (replaced #F06292)
  "#455A64", // darker blue grey (replaced #607D8B)
];

type FontType = {
  readonly label: "Aa";
  readonly fontFamily:
    | "System"
    | "serif"
    | "sans-serif"
    | "monospace"
    | "cursive"
    | "fantasy"
    | "emoji";
  readonly fontWeight: "400" | "700";
};

const FONTS: readonly FontType[] = [
  { label: "Aa", fontFamily: "System", fontWeight: "400" },
  { label: "Aa", fontFamily: "serif", fontWeight: "400" },
  { label: "Aa", fontFamily: "sans-serif", fontWeight: "700" },
  { label: "Aa", fontFamily: "monospace", fontWeight: "400" },
  { label: "Aa", fontFamily: "System", fontWeight: "700" },
  { label: "Aa", fontFamily: "cursive", fontWeight: "400" },
  { label: "Aa", fontFamily: "fantasy", fontWeight: "400" },
  { label: "Aa", fontFamily: "emoji", fontWeight: "400" },
] as const;

type QuoteProps = {};

const Quote: React.FC<QuoteProps> = () => {
  const { theme } = useMyTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [quoteInfo, setQuoteInfo] = useState({
    text: "",
    reference: "",
    color: COLORS[0],
    font: FONTS[0],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);

  const viewShotRef = useRef<ViewShot>(null);

  const selectedVerse = use$(() => bibleState$.selectedVerseForNote.get());
  const params = useLocalSearchParams();

  // Extract specific param values to avoid infinite loop from params object reference changes
  const paramText =
    params?.text && typeof params.text === "string" ? params.text : null;
  const paramReference =
    params?.reference && typeof params.reference === "string"
      ? params.reference
      : null;

  const randomVerse = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * FAMOUS_VERSES.length);
    return FAMOUS_VERSES[randomIndex];
  }, []);

  const { captureAndShare } = useViewShot({
    fileName: "quote",
    quality: 1,
    format: "png",
    viewShotRef,
  });

  useEffect(() => {
    if (!customMode) {
      const text = paramText || selectedVerse || randomVerse.text;
      const reference = paramReference || randomVerse.reference;

      setQuoteInfo({
        text,
        reference,
        color: COLORS[0],
        font: FONTS[0],
      });
    }
  }, [customMode, paramText, paramReference, selectedVerse, randomVerse]);

  const handleShare = async () => {
    if (!quoteInfo.text.trim()) {
      Alert.alert("Error", "Por favor, ingrese una cita antes de compartir");
      return;
    }
    setIsLoading(true);
    try {
      if (customMode) {
        const verseText = getVerseTextRaw(quoteInfo.text);
        const verseRef = quoteInfo.reference;
        const html = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;width:100vw;background:${quoteInfo.color};flex-direction:column;"><span style=\"color:#fff;font-size:2.5em;font-family:${quoteInfo.font.fontFamily};font-weight:${quoteInfo.font.fontWeight};\">${verseText}</span><span style=\"color:#fff;font-size:1.2em;margin-top:2em;opacity:0.8;\">${verseRef}</span></div>`;

        // Wait a bit for the content to render
        await new Promise((resolve) => setTimeout(resolve, 100));
        webViewRef.current?.injectJavaScript(
          `document.body.innerHTML = \`${html}\`; true;`
        );

        // Wait a bit more for the content to be fully rendered
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        // In template mode, make sure we're capturing from the current card
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      await captureAndShare();
    } catch (error: any) {
      console.error("Error in handleShare:", error);
      Alert.alert(
        "Error",
        "No se pudo compartir la cita: " +
          (error?.message || "Error desconocido")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const screenOptions: any = useMemo(() => {
    return {
      theme,
      title: "Crear cita",
      titleIcon: "Quote",
      headerRightProps: {
        headerRightIconColor: theme.colors.text,
        RightComponent: () => (
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => setCustomMode(!customMode)}
              style={styles.headerButton}
            >
              <Icon
                name={customMode ? "GalleryHorizontal" : "Brush"}
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
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
  }, [theme.colors, handleShare, isLoading, setCustomMode]);

  const { width, height } = useWindowDimensions();

  const storyItemDimensions = useMemo(() => {
    return {
      width: width * 0.8,
      height: width + 150,
    };
  }, [width]);

  return (
    <>
      <Stack.Screen options={singleScreenHeader(screenOptions)} />
      <ScreenWithAnimation
        iconColor="#CDAA7D"
        duration={800}
        icon="Quote"
        title="Crear cita"
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.container}>
            {customMode ? (
              <CustomQuoteMode
                selectedColor={quoteInfo.color}
                selectedFont={quoteInfo.font}
                quoteText={quoteInfo.text}
                reference={quoteInfo.reference}
                onColorSelect={(color) => {
                  setQuoteInfo({ ...quoteInfo, color });
                  setCustomMode(true);
                }}
                onFontSelect={(font) => {
                  setQuoteInfo({ ...quoteInfo, font });
                  setCustomMode(true);
                }}
                onQuoteTextChange={(text) =>
                  setQuoteInfo({ ...quoteInfo, text })
                }
                onReferenceChange={(reference) =>
                  setQuoteInfo({ ...quoteInfo, reference })
                }
                colors={COLORS}
                fonts={FONTS}
                viewShotRef={viewShotRef}
              />
            ) : (
              <View
                style={{
                  position: "relative",
                  flex: 1,
                  width: "100%",
                  paddingLeft: width * 0.1,
                  paddingTop: width * 0.2 - 10,
                }}
              >
                <StoryList
                  stories={quoteTemplates}
                  pagingEnabled={true} // set to true to enable paging
                  storyItemDimensions={storyItemDimensions}
                  setActiveIndex={setCurrentTemplateIndex}
                  visibleItems={4} // number of items visible at a time
                  gap={25} // gap between items
                  renderItem={(template, index) => {
                    const isCurrent = index === currentTemplateIndex;
                    return (
                      <View
                        style={{
                          width: storyItemDimensions.width,
                          height: storyItemDimensions.height,
                          backgroundColor: "transparent",
                          // borderWidth: isCurrent ? 1 : 0,
                          // borderColor: isCurrent ? "red" : "transparent",
                        }}
                      >
                        <ViewShot
                          ref={isCurrent ? viewShotRef : null}
                          options={{
                            format: "png",
                            quality: 1,
                            result: "tmpfile",
                          }}
                          style={{
                            flex: 1,
                            width: "100%",
                            backgroundColor: "transparent",
                          }}
                        >
                          <WebView
                            ref={isCurrent ? webViewRef : null}
                            key={template.id}
                            originWhitelist={["*"]}
                            containerStyle={{
                              width: "100%",
                              height: "100%",
                              borderRadius: 20,
                            }}
                            source={{
                              html: template.template
                                .replace(/{{ref}}/g, quoteInfo.reference)
                                .replace(
                                  /{{text}}/g,
                                  getVerseTextRaw(quoteInfo.text)
                                ),
                            }}
                            scrollEnabled={false}
                            onError={(syntheticEvent) => {
                              const { nativeEvent = {} } = syntheticEvent;
                              console.warn("WebView error: ", nativeEvent);
                            }}
                            {...createOptimizedWebViewProps({}, "static")}
                          />
                        </ViewShot>
                      </View>
                    );
                  }}
                />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </ScreenWithAnimation>
    </>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      paddingTop: 20,
      justifyContent: "center",
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
      gap: 12,
      marginRight: 8,
    },
    headerButton: {
      padding: 8,
      borderRadius: 8,
    },
  });

export default Quote;
