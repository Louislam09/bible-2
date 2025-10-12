import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import { Text, View } from "@/components/Themed";
import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import {
  TQuoteDataItem,
  FAMOUS_VERSES,
  QUOTES_DATA,
} from "@/constants/quotesData";
import { Stack } from "expo-router";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, Alert, Share } from "react-native";
import { ImageBackground } from "expo-image";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import ThemeSelectorBottomSheet from "@/components/quote/ThemeSelectorBottomSheet";
import Icon from "@/components/Icon";

const QuoteMaker: React.FC = () => {
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

  // Initialize with random verse and theme
  useEffect(() => {
    const randomVerse =
      FAMOUS_VERSES[Math.floor(Math.random() * FAMOUS_VERSES.length)];
    setSelectedVerse(randomVerse);

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
  }, [theme.colors, styles.galleryButton, styles.galleryText]);

  const handleThemeSelect = (themeItem: TQuoteDataItem) => {
    setSelectedTheme(themeItem);
  };

  const handleCloseThemeSelector = () => {
    themeSelectorRef.current?.dismiss();
  };

  const handleShare = async () => {
    if (selectedVerse && selectedTheme) {
      try {
        await Share.share({
          message: `${selectedVerse.text}\n\n${selectedVerse.reference}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={singleScreenHeader(screenOptions)} />

      {selectedTheme && selectedVerse ? (
        <ImageBackground
          source={{
            // uri: "https://firebasestorage.googleapis.com/v0/b/bible-web-fae69.appspot.com/o/web_backgrounds%2Fpeople_community__image_8_1000x1000.jpg?alt=media",
            // uri: "https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            uri: selectedTheme.backgroundImageUrl,
          }}
          style={styles.backgroundImage}
          contentFit="cover"
        >
          <View style={styles.overlay} />

          <View style={styles.verseContainer}>
            <Text
              style={[
                styles.verseText,
                {
                  color: selectedTheme.textColor,
                  fontFamily: selectedTheme.font.name,
                },
              ]}
            >
              {selectedVerse.text}
            </Text>
            <Text
              style={[
                styles.verseReference,
                { color: selectedTheme.textColor },
              ]}
            >
              {selectedVerse.reference}
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Icon name="Share" size={24} color="#FFFFFF" />
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
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
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
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
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    galleryText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "500",
      marginLeft: 6,
    },
  });

export default QuoteMaker;
