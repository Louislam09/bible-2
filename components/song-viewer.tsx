import { storedData$, useStorage } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { TSongItem, TTheme } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "./Themed";

type SongViewer = {
  song: TSongItem;
};

const SongViewer = ({ song }: SongViewer) => {
  const { title, chorus, stanzas } = song;
  const scrollViewRef = useRef<ScrollView>(null);

  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const hasChorus = !!song?.chorus;
  const [isChorus, setIsChorus] = useState(false);
  const songFontSize = storedData$.songFontSize.get();

  useEffect(() => {
    animateTransition();
  }, [currentVerseIndex]);

  const animateTransition = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const goToNextVerse = () => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });

    if (!isChorus && hasChorus) {
      setIsChorus(true);
      return;
    }

    if (currentVerseIndex < stanzas.length - 1) {
      setCurrentVerseIndex((prev) => prev + 1);
      setIsChorus(false);
    }
  };

  const goToPrevVerse = () => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });

    if (isChorus) {
      setIsChorus(false);
      return;
    }

    if (currentVerseIndex > 0) {
      setCurrentVerseIndex((prev) => prev - 1);
      if (hasChorus) setIsChorus(true);
    }
  };

  const renderContent = () => {
    const verse = stanzas[currentVerseIndex];
    const verseText = verse.replace(/^\(\d+\)\s*/, "");

    return (
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView ref={scrollViewRef} style={styles.contentGradient}>
          {isChorus && hasChorus ? (
            <Fragment>
              <Text style={styles.chorusLabel}>CORO</Text>
              <Text
                onPress={() => { }}
                style={[styles.verseText, { fontSize: songFontSize }]}
              >
                {chorus?.split("\n").map((line, i) => (
                  <Text onPress={() => { }} key={`chorus-${i}`}>
                    {line}
                    {i < chorus.split("\n").length - 1 ? "\n" : ""}
                  </Text>
                ))}
              </Text>
            </Fragment>
          ) : (
            <Text
              onPress={() => { }}
              style={[styles.verseText, { fontSize: songFontSize }]}
            >
              {verseText.split("\n").map((line, i) => (
                <Text onPress={() => { }} key={`verse-${i}`}>
                  {line}
                  {i < verseText.split("\n").length - 1 ? "\n" : ""}
                </Text>
              ))}
            </Text>
          )}
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.songContainer}>
        {/* Title Section */}
        <LinearGradient
          colors={[theme.colors.notification, theme.colors.background]}
          style={styles.titleGradient}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.verseNumber}>
            Estrofa {currentVerseIndex + 1} of {stanzas.length}
          </Text>
        </LinearGradient>

        {/* Main Content */}
        {renderContent()}

        {/* Navigation */}
        <LinearGradient
          colors={[theme.colors.background, theme.colors.background]}
          style={styles.navigationContainer}
        >
          <TouchableOpacity
            onPress={goToPrevVerse}
            style={[styles.navButton, styles.prevButton]}
            disabled={currentVerseIndex === 0 && !isChorus}
          >
            <Text
              style={[
                styles.navButtonText,
                currentVerseIndex === 0 &&
                !isChorus &&
                styles.navButtonDisabled,
                { color: theme.colors.text.includes("FFF") ? "#000" : "#fff" },
              ]}
            >
              Anterior
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goToNextVerse}
            style={[styles.navButton, styles.nextButton]}
            disabled={currentVerseIndex === stanzas.length - 1 && isChorus}
          >
            <Text
              style={[
                styles.navButtonText,
                currentVerseIndex === stanzas.length - 1 &&
                isChorus &&
                styles.navButtonDisabled,
              ]}
            >
              Siguiente
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    songContainer: {
      flex: 1,
    },
    titleGradient: {
      padding: 20,
      alignItems: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#ffffff",
      textAlign: "center",
      textShadowColor: "rgba(0, 0, 0, 0.2)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
      marginBottom: 10,
    },
    fontControls: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: 8,
      padding: 4,
    },
    fontButton: {
      padding: 8,
      borderRadius: 4,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      marginHorizontal: 8,
    },
    fontButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "bold",
    },
    fontSizeText: {
      color: "#ffffff",
      fontSize: 16,
      marginHorizontal: 8,
    },
    contentContainer: {
      overflow: "hidden",
      flex: 1,
    },
    contentGradient: {
      padding: 16,
      height: "100%",
    },
    verseNumber: {
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.notification,
      fontSize: 14,
    },
    verseText: {
      // lineHeight: 28,
      color: "#495057",
      marginBottom: 24,
    },
    chorusAfterVerse: {
      // marginTop: 16,
      // paddingTop: 16,
    },
    chorusLabel: {
      fontWeight: "bold",
      color: colors.notification,
      fontSize: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    chorusText: {
      lineHeight: 28,
      fontStyle: "italic",
      color: "#495057",
      textAlign: "center",
    },
    navigationContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 16,
      backgroundColor: colors.background,
    },
    navButton: {
      padding: 12,
      borderRadius: 8,
      width: "45%",
    },
    prevButton: {
      backgroundColor: colors.text,
    },
    nextButton: {
      backgroundColor: colors.notification,
    },
    navButtonText: {
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 16,
      color: "#FFF",
    },
    navButtonDisabled: {
      opacity: 0.4,
      color: colors.background,
    },
  });

export default SongViewer;
