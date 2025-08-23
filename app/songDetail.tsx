import {
  singleScreenHeader,
  SingleScreenHeaderProps,
} from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import hymnSong from "@/constants/hymnSong";
import AlegreSongs from "@/constants/songs";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import useParams from "@/hooks/useParams";
import { TSongItem, TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const SongDetailPage = () => {
  const { songId, isAlegres } = useParams();
  const { theme } = useMyTheme();
  const Songs = isAlegres ? AlegreSongs : hymnSong;
  const song = Songs.find((item) => +item.id === songId) as TSongItem;
  const songFontSize = use$(() => storedData$.songFontSize.get());
  const styles = getStyles(theme);

  const { title, chorus, stanzas } = song;
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const hasChorus = !!song?.chorus;
  const [isChorus, setIsChorus] = useState(false);

  const increaseFont = () => {
    const value = Math.min(40, Math.max(21, (songFontSize as any) + 2));
    storedData$.songFontSize.set(value);
  };

  const decreaseFont = () => {
    const value = Math.max(26, (songFontSize as any) - 2);
    storedData$.songFontSize.set(value);
  };

  useEffect(() => {
    if (currentVerseIndex > 0) {
      animateTransition();
    }
  }, [currentVerseIndex]);

  const animateTransition = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
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

  const verse = useMemo(() => {
    return stanzas[currentVerseIndex];
  }, [currentVerseIndex, stanzas]);

  const verseText = useMemo(() => {
    return verse.replace(/^\(\d+\)\s*/, "");
  }, [verse]);

  const screenOptions = useMemo(() => {
    return {
      theme,
      title: "Himno",
      titleIcon: "Music2",
      headerRightProps: {
        headerRightIcon: "AArrowDown",
        headerRightIconColor: theme.colors.text,
        onPress: () => console.log(),
        disabled: false,
        style: { opacity: 1 },
        RightComponent: () => (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={increaseFont}>
              <Icon name="AArrowUp" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={decreaseFont}>
              <Icon name="AArrowDown" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        ),
      },
    } as SingleScreenHeaderProps;
  }, [theme, songFontSize, song]);

  return (
    <>
      <Stack.Screen options={{ ...singleScreenHeader(screenOptions) }} />
      <LinearGradient
        colors={["#2c3e50", "#34495e", "#3498db"]}
        style={styles.container}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.hymnNumberContainer}>
            <LinearGradient
              colors={["#e74c3c", "#c0392b"]}
              style={styles.hymnNumberGradient}
            >
              {/* <Text style={styles.hymnNumber}>{title.toUpperCase()}</Text> */}
            </LinearGradient>
          </View>

          <Text style={styles.title}>{title.split("-")[1]}</Text>

          {isChorus && hasChorus ? (
            <Text style={styles.chorusLabel}>— CORO —</Text>
          ) : (
            <Text style={styles.chorusLabel}>
              — ESTRÓFA {currentVerseIndex + 1} —
            </Text>
          )}
        </View>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.contentScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {isChorus && hasChorus ? (
              <Fragment>
                {chorus?.split("\n").map((line, i) => (
                  <Text
                    style={[
                      styles.verseText,
                      { fontSize: songFontSize, lineHeight: songFontSize + 4 },
                    ]}
                    key={`chorus-${i}`}
                  >
                    {line.trim()}
                  </Text>
                ))}
              </Fragment>
            ) : (
              <Fragment>
                {verseText.split("\n").map((line, i) => (
                  <Text
                    style={[
                      styles.verseText,
                      { fontSize: songFontSize, lineHeight: songFontSize + 4 },
                    ]}
                    key={`verse-${i}`}
                  >
                    {line.trim()}
                  </Text>
                ))}
              </Fragment>
            )}
          </ScrollView>
        </Animated.View>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              onPress={goToPrevVerse}
              style={[
                styles.navButton,
                styles.prevButton,
                currentVerseIndex === 0 &&
                  !isChorus &&
                  styles.navButtonDisabled,
              ]}
              disabled={currentVerseIndex === 0 && !isChorus}
            >
              <Text
                style={[
                  styles.navButtonText,
                  currentVerseIndex === 0 &&
                    !isChorus &&
                    styles.navButtonTextDisabled,
                ]}
              >
                Anterior
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goToNextVerse}
              style={[
                styles.navButton,
                styles.nextButton,
                currentVerseIndex === stanzas.length - 1 &&
                  isChorus &&
                  styles.navButtonDisabled,
              ]}
              disabled={currentVerseIndex === stanzas.length - 1 && isChorus}
            >
              <Text
                style={[
                  styles.navButtonText,
                  currentVerseIndex === stanzas.length - 1 &&
                    isChorus &&
                    styles.navButtonTextDisabled,
                ]}
              >
                Siguiente
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    headerActions: {
      display: "flex",
      flexDirection: "row",
      gap: 30,
      backgroundColor: "transparent",
    },
    container: {
      flex: 1,
    },
    titleSection: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 20,
      alignItems: "center",
      backgroundColor: "transparent",
    },
    hymnNumberContainer: {
      marginBottom: 20,
      backgroundColor: "transparent",
    },
    hymnNumberGradient: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 50,
      shadowColor: "#e74c3c",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 8,
    },
    hymnNumber: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "600",
      letterSpacing: 0.5,
      textAlign: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "300",
      color: "#ecf0f1",
      textAlign: "center",
      marginBottom: 15,
      letterSpacing: 2,
    },
    subTitle: {
      fontSize: 16,
      color: "rgba(236, 240, 241, 0.8)",
      fontWeight: "300",
      textAlign: "center",
    },
    divider: {
      height: 1,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      width: "100%",
      marginTop: 20,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 30,
      paddingBottom: 10,
      backgroundColor: "transparent",
    },
    contentScrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      alignItems: "center",
    },
    verseText: {
      color: "#ecf0f1",
      fontWeight: "300",
      letterSpacing: 0.5,
      maxWidth: 800,
      width: "100%",
      marginBottom: 1,
    },
    chorusLabel: {
      color: "#e74c3c",
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 10,
      textAlign: "center",
      letterSpacing: 2,
    },
    navigationContainer: {
      paddingHorizontal: 30,
      paddingBottom: 30,
      backgroundColor: "transparent",
    },
    topDivider: {
      height: 1,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      width: "100%",
      marginBottom: 30,
    },
    navigationButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: "transparent",
    },
    navButton: {
      paddingVertical: 18,
      paddingHorizontal: 40,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: "#3498db",
      backgroundColor: "rgba(236, 240, 241, 0.1)",
      minWidth: 120,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    prevButton: {
      backgroundColor: "#3498db",
      borderColor: "#3498db",
    },
    nextButton: {
      backgroundColor: "#3498db",
      borderColor: "#3498db",
    },
    navButtonDisabled: {
      opacity: 0.7,
      shadowOpacity: 0,
      elevation: 0,
    },
    navButtonText: {
      color: "#ecf0f1",
      fontSize: 16,
      fontWeight: "500",
      textAlign: "center",
    },
    navButtonTextDisabled: {
      color: "rgba(255, 255, 255, 0.5)",
    },
  });

export default SongDetailPage;
