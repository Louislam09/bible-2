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
import { useHaptics } from "@/hooks/useHaptics";
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
  const { impact } = useHaptics();
  const Songs = isAlegres ? AlegreSongs : hymnSong;
  const song = Songs.find((item) => +item.id === songId) as TSongItem;
  const songFontSize = use$(() => storedData$.songFontSize.get());
  const styles = getStyles(theme);

  const { title, chorus, stanzas } = song;
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Add animated values for background decorations
  const decorationAnimations = useRef<Animated.Value[]>([]).current;

  // Add animated values for button interactions
  const prevButtonAnim = useRef(new Animated.Value(1)).current;
  const nextButtonAnim = useRef(new Animated.Value(1)).current;
  const increaseFontAnim = useRef(new Animated.Value(1)).current;
  const decreaseFontAnim = useRef(new Animated.Value(1)).current;

  const hasChorus = !!song?.chorus;
  const [isChorus, setIsChorus] = useState(false);

  const increaseFont = async () => {
    impact.light();
    const value = Math.min(40, Math.max(21, (songFontSize as any) + 2));
    storedData$.songFontSize.set(value);

    // Animate button press
    Animated.sequence([
      Animated.timing(increaseFontAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(increaseFontAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const decreaseFont = async () => {
    impact.light();
    const value = Math.max(26, (songFontSize as any) - 2);
    storedData$.songFontSize.set(value);

    // Animate button press
    Animated.sequence([
      Animated.timing(decreaseFontAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(decreaseFontAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
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

  const goToNextVerse = async () => {
    impact.medium();
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });

    // Animate button press
    Animated.sequence([
      Animated.timing(nextButtonAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(nextButtonAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    if (!isChorus && hasChorus) {
      setIsChorus(true);
      return;
    }

    if (currentVerseIndex < stanzas.length - 1) {
      setCurrentVerseIndex((prev) => prev + 1);
      setIsChorus(false);
    }
  };

  const goToPrevVerse = async () => {
    impact.medium();
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });

    // Animate button press
    Animated.sequence([
      Animated.timing(prevButtonAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(prevButtonAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

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
      backgroundColor: "#2c3e50",
      titleTextColor: "#ecf0f1",
      headerLeftIconColor: "#ecf0f1",
      headerRightProps: {
        headerRightIcon: "AArrowDown",
        headerRightIconColor: theme.colors.text,
        onPress: () => console.log(),
        disabled: false,
        style: { opacity: 1 },
        RightComponent: () => (
          <View style={styles.headerActions}>
            <Animated.View style={{ transform: [{ scale: increaseFontAnim }] }}>
              <TouchableOpacity onPress={increaseFont}>
                <Icon
                  name="AArrowUp"
                  size={24}
                  color={theme.colors.notification}
                />
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: decreaseFontAnim }] }}>
              <TouchableOpacity onPress={decreaseFont}>
                <Icon
                  name="AArrowDown"
                  size={24}
                  color={theme.colors.notification}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        ),
      },
    } as SingleScreenHeaderProps;
  }, [theme, songFontSize, song]);

  const backgroundDecorations = useMemo(() => {
    // make color more neutral 5 and no red
    const colors = ["#ffffff60"];
    const sizes = [60, 50, 40, 30];
    const icons = ["Music", "Music2", "Music3", "Music4", "Guitar", "Piano"];
    const numberOfIcons = 7;

    const getRandomIcon = () => {
      return icons[Math.floor(Math.random() * icons.length)];
    };

    const getRandomColor = () => {
      return colors[Math.floor(Math.random() * colors.length)];
    };
    const getRandomSize = () => {
      return sizes[Math.floor(Math.random() * sizes.length)];
    };
    const getRandomPos = () => {
      const max = 90;
      const min = 10;
      // pos should be within the bottom and right of the screen in percentage
      const bottom = Math.max(Math.random() * max, min);
      const right = Math.max(Math.random() * max, min);
      return {
        bottom: `${bottom}%`,
        right: `${right}%`,
      };
    };

    const decorations = Array.from({ length: numberOfIcons }, () => ({
      name: getRandomIcon(),
      size: getRandomSize(),
      color: getRandomColor(),
      pos: getRandomPos(),
    }));

    // Initialize animation values for each decoration
    decorationAnimations.length = 0;
    decorations.forEach(() => {
      decorationAnimations.push(new Animated.Value(0));
    });

    return decorations;
  }, [currentVerseIndex]);

  // Add floating animation effect
  useEffect(() => {
    const animations = decorationAnimations.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000 + index * 500, // Stagger the animations
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000 + index * 500,
            useNativeDriver: true,
          }),
        ])
      );
    });

    // Start all animations
    Animated.parallel(animations).start();

    return () => {
      // Clean up animations
      animations.forEach((anim) => anim.stop());
    };
  }, [backgroundDecorations]);

  const titleInfo = useMemo(() => {
    return {
      hymnNumber: title.split("-")[0],
      hymnTitle: title.split("-")[1],
    };
  }, [title]);

  return (
    <>
      <Stack.Screen options={{ ...singleScreenHeader(screenOptions) }} />
      <LinearGradient
        colors={["#2c3e50", "#34495e", theme.colors.notification]}
        // colors={["#2c3e50", "#34495e", "#3498db"]}
        style={styles.container}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.hymnNumberContainer}>
            <LinearGradient
              colors={["#e74c3c", "#c0392b"]}
              style={styles.hymnNumberGradient}
            >
              <Text style={styles.hymnNumber}>{titleInfo.hymnNumber.trim()}</Text>
            </LinearGradient>
          </View>

          <Text style={styles.title}>{titleInfo.hymnTitle}</Text>

          {isChorus && hasChorus ? (
            <Text style={styles.chorusLabel}>— CORO —</Text>
          ) : (
            <Text style={styles.chorusLabel}>
              — ESTRÓFA {currentVerseIndex + 1} de {stanzas.length} —
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

        {backgroundDecorations.map((item, index) => (
          <Animated.View
            key={index}
            style={[
              styles.backgroundDecoration,
              {
                bottom: item.pos.bottom as any,
                right: item.pos.right as any,
                transform: [
                  {
                    translateY:
                      decorationAnimations[index]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -15], // Gentle floating up and down
                      }) || 0,
                  },
                  {
                    scale:
                      decorationAnimations[index]?.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.05, 1], // Subtle scale effect
                      }) || 1,
                  },
                ],
                opacity:
                  decorationAnimations[index]?.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.6, 0.8, 0.6], // Gentle opacity change
                  }) || 0.6,
              },
            ]}
          >
            <Icon
              name={item.name as any}
              size={item.size}
              color={item.color}
              style={styles.backgroundIcon}
            />
          </Animated.View>
        ))}

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <View style={styles.navigationButtons}>
            <Animated.View style={{ transform: [{ scale: prevButtonAnim }] }}>
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
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: nextButtonAnim }] }}>
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
            </Animated.View>
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
      position: "relative",
    },
    titleSection: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 20,
      alignItems: "center",
      backgroundColor: "transparent",
      zIndex: 1,
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
      zIndex: 1,
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
    backgroundDecoration: {
      position: "absolute",
      bottom: 104,
      right: 40,
      zIndex: 0,
      backgroundColor: "transparent",
    },
    backgroundIcon: {
      transform: [{ rotate: "15deg" }],
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
      // backgroundColor: "#3498db",
      // borderColor: "#3498db",
      backgroundColor: colors.notification,
      borderColor: colors.notification,
    },
    nextButton: {
      backgroundColor: colors.notification,
      borderColor: colors.notification,
      // backgroundColor: "#3498db",
      // borderColor: "#3498db",
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
