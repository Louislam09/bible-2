import { PressableScale } from "@/components/animations/pressable-scale";
import Icon from "@/components/Icon";
import BackgroundImageSelectorBottomSheet from "@/components/quote/BackgroundImageSelectorBottomSheet";
import FontSelectorBottomSheet from "@/components/quote/FontSelectorBottomSheet";
import ThemeSelectorBottomSheet from "@/components/quote/ThemeSelectorBottomSheet";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import {
  FAMOUS_VERSES,
  QUOTES_DATA,
  TQuoteDataItem,
} from "@/constants/quotesData";
import { quoteTemplatesMaker } from "@/constants/quoteTemplates";
import { headerIconSize } from "@/constants/size";
import { useMyTheme } from "@/context/ThemeContext";
import { useViewShot } from "@/hooks/useViewShot";
import { bibleState$ } from "@/state/bibleState";
import { TTheme } from "@/types";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import { ImageBackground } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import ViewShot from "react-native-view-shot";
import WebView from "react-native-webview";

type TSelectedVerse = {
  text: string;
  reference: string;
};

const QuoteMaker: React.FC = () => {
  const router = useRouter();
  const viewShotRef = useRef<ViewShot>(null);
  const { theme } = useMyTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const themeSelectorRef = useRef<BottomSheetModal>(null);
  const fontSelectorRef = useRef<BottomSheetModal>(null);
  const backgroundImageSelectorRef = useRef<BottomSheetModal>(null);
  const [selectedTheme, setSelectedTheme] = useState<
    TQuoteDataItem | undefined
  >();
  const [selectedVerse, setSelectedVerse] = useState<
    TSelectedVerse | undefined
  >();
  const [watermarkClass, setWatermarkClass] = useState("none");
  const [highlightShareButton, setHighlightShareButton] = useState(false); // for music mode
  const mySelectedVerse = use$(() => bibleState$.selectedVerseForNote.get());
  const params = useLocalSearchParams();
  const [actionLoading, setActionLoading] = useState({
    save: false,
    share: false,
  });

  const allThemes = useMemo(() => {
    return QUOTES_DATA.flatMap((section) => section.items);
  }, []);

  const randomVerse = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * FAMOUS_VERSES.length);
    return FAMOUS_VERSES[randomIndex];
  }, []);

  useEffect(() => {
    // Get all themes from all sections
    const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)];
    setSelectedTheme(randomTheme);
  }, []);

  // Initialize with random verse and theme
  useEffect(() => {
    console.log('params', params);
    if (params?.themeId && typeof params.themeId === "string") {
      const theme = QUOTES_DATA.flatMap((section) => section.items).find(
        (item) => item.id === params.themeId
      );
      setSelectedTheme(theme);
    } else {
      const allThemes = QUOTES_DATA.flatMap((section) => section.items);
      const randomTheme =
        allThemes[Math.floor(Math.random() * allThemes.length)];
      setSelectedTheme(randomTheme);
    }

    setSelectedVerse({
      text: typeof params?.text === "string" ? params.text : randomVerse.text,
      reference:
        typeof params?.reference === "string"
          ? params.reference
          : randomVerse.reference,
    });
    if (params?.isMusic === "true") {
      // highlight the share button
      setHighlightShareButton(true);
    }
  }, []);

  const screenOptions: any = useMemo(() => {
    return {
      theme,
      title: "Bible Verses",
      titleIcon: "Image",
      backgroundColor: "transparent",
      headerRightProps: {
        headerRightIconColor: theme.colors.text,
        RightComponent: () => (
          <TouchableOpacity
            onPress={() => themeSelectorRef.current?.present()}
            style={styles.galleryButton}
          >
            <Icon name="Palette" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ),
      },
    };
  }, [theme.colors]);

  const handleThemeSelect = (themeItem: TQuoteDataItem) => {
    setSelectedTheme(themeItem);
  };

  const handleCloseThemeSelector = () => {
    themeSelectorRef.current?.dismiss();
  };

  const { captureAndShare, captureAndSaveToGallery } = useViewShot({
    fileName: "quote",
    quality: 1,
    format: "png",
    viewShotRef,
  });

  const handleShare = async () => {
    if (actionLoading.share) return;
    setActionLoading({ ...actionLoading, share: true });
    setWatermarkClass("");
    await captureAndShare();
    setWatermarkClass("none");
    setActionLoading({ ...actionLoading, share: false });
  };

  const handleSave = async () => {
    if (actionLoading.save) return;
    setActionLoading({ ...actionLoading, save: true });
    setWatermarkClass("");
    await captureAndSaveToGallery(selectedVerse?.reference || "");
    setWatermarkClass("none");
    setActionLoading({ ...actionLoading, save: false });
  };

  const handleFontSelect = (chosenTheme: TQuoteDataItem) => {
    setSelectedTheme((prev: TQuoteDataItem | undefined) => {
      if (!prev) return chosenTheme;
      return {
        ...chosenTheme,
        backgroundImageUrl: prev.backgroundImageUrl,
      };
    });
  };

  const handleBackgroundImageSelect = (backgroundImageUrl: string) => {
    setSelectedTheme((prev: TQuoteDataItem | undefined) => {
      if (!prev) return prev;
      return {
        ...prev,
        backgroundImageUrl: backgroundImageUrl,
      };
    });
  };

  const handleTextAlignSelect = () => {
    const alignOptions = ["center", "left", "right", "justify"];
    const currentAlign = selectedTheme?.textAlign || "center";
    const nextAlign =
      alignOptions[
      (alignOptions.indexOf(currentAlign) + 1) % alignOptions.length
      ];
    setSelectedTheme((prev: any) => {
      return {
        ...prev,
        textAlign: nextAlign,
      };
    });
  };

  const handleMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === "textAlignSelect") {
      handleTextAlignSelect();
    }
  };

  return (
    <ScreenWithAnimation
      iconColor="#CDAA7D"
      duration={800}
      icon="Image"
      title="Cita Imagen"
    >
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <PressableScale onPress={() => router.push("/(dashboard)")}>
            <Icon name="ChevronLeft" size={headerIconSize} color="#FFFFFF" />
          </PressableScale>

          <PressableScale disabled={actionLoading.share} onPress={handleShare}>
            {actionLoading.share ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="Share2" size={headerIconSize} color="#FFFFFF" />
            )}
          </PressableScale>
        </View>
        <ViewShot
          ref={viewShotRef}
          options={{
            format: "jpg",
            quality: 1,
            result: "tmpfile",
            fileName: selectedVerse?.reference || "",
          }}
          style={{
            flex: 1,
            width: "100%",
            backgroundColor: "transparent",
          }}
        >
          {selectedTheme && selectedVerse ? (
            <ImageBackground
              source={{
                uri: selectedTheme.backgroundImageUrl,
              }}
              style={styles.backgroundImage}
              contentFit="cover"
            >
              <View style={styles.overlay} />

              <View style={styles.verseContainer}>
                <WebView
                  ref={null}
                  // key={selectedTheme.id}
                  originWhitelist={["*"]}
                  style={{
                    flex: 1,
                    minWidth: "100%",
                    backgroundColor: "transparent",
                  }}
                  source={{
                    html: quoteTemplatesMaker(selectedTheme)
                      .replace(/{{ref}}/g, selectedVerse.reference)
                      .replace(/{{text}}/g, selectedVerse.text)
                      .replace(/{{watermarkClass}}/g, watermarkClass),
                  }}
                  scrollEnabled={false}
                  onMessage={handleMessage}
                  renderLoading={() => <View
                    style={{
                      backgroundColor: "transparent",
                      flex: 1,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 1000,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  />}
                  {...createOptimizedWebViewProps({}, "static")}
                />
              </View>
            </ImageBackground>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}
        </ViewShot>

        <View style={styles.footer}>
          <PressableScale
            disabled={actionLoading.save}
            onPress={handleSave}
            style={styles.shareButton}
          >
            {actionLoading.save ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="Save" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.shareText}>Guardar</Text>
          </PressableScale>
          <PressableScale
            onPress={() => backgroundImageSelectorRef.current?.present()}
            style={[
              styles.customFontButton,
              highlightShareButton && styles.highlightedShareButton,
            ]}
          >
            <Icon name="Image" size={24} color="#FFFFFF" />
            <Text style={styles.shareText}>Fondo</Text>
          </PressableScale>
          <PressableScale
            onPress={() => fontSelectorRef.current?.present()}
            style={[
              styles.customFontButton,
              highlightShareButton && styles.highlightedShareButton,
            ]}
          >
            <Icon name="Type" size={24} color="#FFFFFF" />
            <Text style={styles.shareText}>Fuentes</Text>
          </PressableScale>
          <PressableScale
            onPress={() => themeSelectorRef.current?.present()}
            style={styles.galleryButton}
          >
            <Icon name="Palette" size={24} color="#FFFFFF" />
            <Text style={styles.shareText}>Temas</Text>
          </PressableScale>
        </View>

        <FontSelectorBottomSheet
          bottomSheetRef={fontSelectorRef}
          selectedTheme={selectedTheme}
          onThemeSelect={handleFontSelect}
          onClose={() => fontSelectorRef.current?.dismiss()}
        />

        <ThemeSelectorBottomSheet
          bottomSheetRef={themeSelectorRef}
          selectedTheme={selectedTheme}
          onThemeSelect={handleThemeSelect}
          onClose={handleCloseThemeSelector}
        />

        <BackgroundImageSelectorBottomSheet
          bottomSheetRef={backgroundImageSelectorRef}
          selectedTheme={selectedTheme}
          onBackgroundImageSelect={handleBackgroundImageSelect}
          onClose={() => backgroundImageSelectorRef.current?.dismiss()}
        />
      </View>
    </ScreenWithAnimation>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    fontCarousel: {
      position: "absolute",
      bottom: 100,
      left: 0,
      right: 0,
      zIndex: 1000,
      flexDirection: "row",
      paddingHorizontal: 20,
      backgroundColor: "transparent",
    },
    fontCarouselItemContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.342)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 50,
      width: 60,
      height: 60,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    fontCarouselItem: {
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "500",
      textTransform: "uppercase",
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    backgroundImage: {
      flex: 1,
      width: "100%",
      height: "100%",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      // backgroundColor: "transparent",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: "transparent",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    headerTextContainer: {
      marginLeft: 12,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
      marginBottom: 2,
    },
    headerSubtitle: {
      fontSize: 12,
      fontWeight: "500",
      color: "#FFFFFF",
      opacity: 0.8,
    },
    galleryButtonHeader: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    galleryTextHeader: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "500",
      marginLeft: 6,
    },
    verseContainer: {
      zIndex: 101,
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
      backgroundColor: "transparent",
    },
    verseText: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      lineHeight: 32,
      marginBottom: 20,
    },
    verseReference: {
      fontSize: 16,
      fontWeight: "400",
      textAlign: "center",
      opacity: 0.9,
    },
    footer: {
      position: "absolute",
      flexDirection: "row",
      justifyContent: "space-around",
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: "center",
      paddingBottom: 40,
      backgroundColor: "transparent",
    },
    shareButton: {
      alignItems: "center",
    },
    customFontButton: {
      alignItems: "center",
    },
    shareText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "500",
      marginTop: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 18,
      color: colors.text,
    },
    galleryButton: {
      alignItems: "center",
    },
    galleryText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "500",
      marginLeft: 6,
    },
    highlightedShareButton: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
  });

export default QuoteMaker;
