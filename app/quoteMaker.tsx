import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import ThemeSelectorBottomSheet from "@/components/quote/ThemeSelectorBottomSheet";
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
import { TTheme } from "@/types";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ImageBackground } from "expo-image";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Share, StyleSheet, TouchableOpacity } from "react-native";
import ViewShot from "react-native-view-shot";
import WebView from "react-native-webview";

const QuoteMaker: React.FC = () => {
  const router = useRouter();
  const viewShotRef = useRef<ViewShot>(null);
  const { theme } = useMyTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const themeSelectorRef = useRef<BottomSheetModal>(null);
  const [selectedTheme, setSelectedTheme] = useState<
    TQuoteDataItem | undefined
  >();
  const [selectedVerse, setSelectedVerse] = useState<
    | {
        text: string;
        reference: string;
      }
    | undefined
  >();
  const [watermarkClass, setWatermarkClass] = useState("none");
  // Initialize with random verse and theme
  useEffect(() => {
    const randomVerse =
      FAMOUS_VERSES[Math.floor(Math.random() * FAMOUS_VERSES.length)];
    setSelectedVerse({
      text: "Porque la palabra de Dios es viva y eficaz, y más cortante que toda espada de dos filos; y penetra hasta partir el alma y el espíritu, las coyunturas y los tuétanos, y discierne los pensamientos y las intenciones del corazón.",
      reference: "Hebreos 4:12",
    });

    // Get all themes from all sections
    const allThemes = QUOTES_DATA.flatMap((section) => section.items);
    const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)];
    setSelectedTheme(randomTheme);
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

  const { captureAndShare } = useViewShot({
    fileName: "quote",
    quality: 1,
    format: "png",
    viewShotRef,
  });

  const handleShare = async () => {
    setWatermarkClass("");
    await captureAndShare();
    setWatermarkClass("none");
  };
  // console.log(selectedTheme);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          // ...singleScreenHeader(screenOptions),
        }}
      />
      {/* header */}
      <View style={styles.header}>
        <Icon
          onPress={() => router.back()}
          name="ChevronLeft"
          size={headerIconSize}
          color="#FFFFFF"
        />
        <Icon
          onPress={handleShare}
          name="Share2"
          size={headerIconSize}
          color="#FFFFFF"
        />
      </View>
      <ViewShot
        ref={viewShotRef}
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
                key={selectedTheme.id}
                originWhitelist={["*"]}
                style={{
                  flex: 1,
                  minWidth: "100%",
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: "red",
                }}
                source={{
                  html: quoteTemplatesMaker(selectedTheme)
                    .replace(/{{ref}}/g, selectedVerse.reference)
                    .replace(/{{text}}/g, selectedVerse.text)
                    .replace(/{{watermarkClass}}/g, watermarkClass),
                }}
                scrollEnabled={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                onError={(syntheticEvent) => {
                  const { nativeEvent = {} } = syntheticEvent;
                  console.warn("WebView error: ", nativeEvent);
                }}
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
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Icon name="Share" size={24} color="#FFFFFF" />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => themeSelectorRef.current?.present()}
          style={styles.galleryButton}
        >
          <Icon name="Palette" size={24} color="#FFFFFF" />
          <Text style={styles.shareText}>Temas</Text>
        </TouchableOpacity>
      </View>

      <ThemeSelectorBottomSheet
        bottomSheetRef={themeSelectorRef}
        selectedTheme={selectedTheme}
        onThemeSelect={handleThemeSelect}
        onClose={handleCloseThemeSelector}
      />
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
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
      //   backgroundColor: "red",
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
  });

export default QuoteMaker;
