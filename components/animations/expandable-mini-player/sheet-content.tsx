import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import Icon from "@/components/Icon";
import ThemeSelectorBottomSheet from "@/components/quote/ThemeSelectorBottomSheet";
import { QUOTES_DATA, TQuoteDataItem } from "@/constants/quotesData";
import { quoteMusicTemplatesMaker } from "@/constants/quoteTemplates";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import useAudioPlayer, { audioState$ } from "@/hooks/useAudioPlayer";
import useBibleReader from "@/hooks/useBibleReading";
import useChangeBookOrChapter from "@/hooks/useChangeBookOrChapter";
import { bibleState$ } from "@/state/bibleState";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNetInfo } from "@react-native-community/netinfo";
import { ImageBackground } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import WebView from "react-native-webview";

type SheetContentProps = {
  progress: SharedValue<number>;
  timeProgress: string;
};

const EasingsUtils = {
  inOut: Easing.bezier(0.25, 0.1, 0.25, 1),
};

const ImageHeight = 44;
const ExpandedImageHeight = ImageHeight * 3;
const MiniPlayerHeight = 64;

const BaseOffset = (MiniPlayerHeight - ImageHeight) / 2;

export const AudioPlayerSheetContent = ({ progress }: SheetContentProps) => {
  const { theme } = useMyTheme();
  const { isConnected } = useNetInfo();

  // Theme selector state
  const [selectedTheme, setSelectedTheme] = useState<
    TQuoteDataItem | undefined
  >();
  const themeSelectorRef = useRef<BottomSheetModal>(null);

  const bibleQuery = bibleState$.bibleQuery.get();
  const reference = `${bibleQuery.book} ${bibleQuery.chapter}`;

  const currentVoiceIdentifier = storedData$.currentVoiceIdentifier.get();
  const currentVoiceRate = storedData$.currentVoiceRate.get() || 1;

  const { nextChapter, previousChapter } = useChangeBookOrChapter({
    book: bibleQuery.book,
    chapter: bibleQuery.chapter,
  });

  const {
    verseIndex,
    startReading,
    stopReading,
    isSpeaking,
    reading: isReading,
    ended,
    reset,
    currentVerseText,
    verseList,
  } = useBibleReader({
    currentChapterVerses: bibleState$.bibleData.topVerses.get() as any,
    currentVoiceIdentifier,
    voiceRate: currentVoiceRate,
  });

  const {
    isDownloading,
    isPlaying: isPlayingAudio,
    playAudio,
    seekTo,
    duration,
    position,
  } = useAudioPlayer({
    book: bibleQuery.book,
    chapterNumber: +bibleQuery.chapter,
    nextChapter: () => {
      nextChapter();
    },
  });

  const PLAYER_STATE = useMemo(() => {
    const state = {
      READING: {
        IS_PLAYING: isReading,
        PLAY_ACTION: isSpeaking ? stopReading : startReading,
        IS_DOWNLOADING: false,
        DURATION: 0,
        POSITION: 0,
      },
      AUDIO: {
        IS_PLAYING: isPlayingAudio,
        PLAY_ACTION: playAudio,
        IS_DOWNLOADING: isDownloading,
        DURATION: duration,
        POSITION: position,
      },
    };

    return isConnected ? state.AUDIO : state.READING;
  }, [
    isConnected,
    isSpeaking,
    isReading,
    startReading,
    stopReading,
    isPlayingAudio,
    playAudio,
    isDownloading,
    duration,
    position,
  ]);

  const handlePlay = useCallback(() => {
    if (isSpeaking) {
      stopReading();
      return;
    }

    startReading();
  }, [isSpeaking, stopReading, startReading]);

  const handlePrevious = useCallback(() => {
    previousChapter();
  }, [previousChapter]);

  const handleNext = useCallback(() => {
    nextChapter();
  }, [nextChapter]);

  const handleSound = () => {
    // Handle sound settings
  };

  const handleShare = () => {
    router.push({
      pathname: "/quoteMaker",
      params: {
        text: currentVerseText,
        reference: `${reference}:1`,
        themeId: selectedTheme?.id || "",
        isMusic: "true",
      },
    });
  };

  const handleTheming = () => {
    themeSelectorRef.current?.present();
  };

  const handleThemeSelect = useCallback((theme: TQuoteDataItem) => {
    setSelectedTheme(theme);
  }, []);

  const handleThemeClose = useCallback(() => {
    themeSelectorRef.current?.dismiss();
  }, []);

  useEffect(() => {
    const allThemes = QUOTES_DATA.flatMap((section) => section.items);
    const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)];
    setSelectedTheme(randomTheme);
  }, []);

  // Generate HTML content for verse display using selected theme
  const verseHtmlContent = useMemo(() => {
    if (!selectedTheme || !currentVerseText) {
      return "";
    }

    const verseReference = `${reference}:${verseIndex + 1}`;

    return quoteMusicTemplatesMaker(selectedTheme)
      .replace(/{{ref}}/g, verseReference)
      .replace(/{{text}}/g, currentVerseText)
      .replace(/{{verseLineClass}}/g, "none")
      .replace(/{{watermarkClass}}/g, "none");
  }, [selectedTheme, currentVerseText, reference, verseIndex, verseList]);

  const handleDropdown = () => {
    progress.value = withTiming(0, {
      duration: 350,
      easing: EasingsUtils.inOut,
    });
  };

  const closeModal = () => {
    if (PLAYER_STATE.IS_PLAYING) {
      PLAYER_STATE.PLAY_ACTION();
    }
    audioState$.toggleIsPlayerOpened();
  };

  const handleClose = () => {
    progress.value = withTiming(
      0,
      {
        duration: 550,
        easing: EasingsUtils.inOut,
      },
      (finished) => {
        if (finished) {
          runOnJS(closeModal)();
        }
      }
    );
  };
  const rImageStyle = useAnimatedStyle(() => {
    const imageSize = interpolate(
      progress.value,
      [0, 1],
      [ImageHeight, ExpandedImageHeight]
    );
    return {
      height: imageSize,
      width: imageSize,
      borderRadius: interpolate(progress.value, [0, 1], [8, 24]),
      overflow: "hidden",
    };
  }, []);

  const rContentStyle = useAnimatedStyle(() => {
    return {
      marginTop: interpolate(
        progress.value,
        [0, 1],
        [BaseOffset, BaseOffset + 120]
      ),
      marginLeft: interpolate(progress.value, [0, 1], [BaseOffset, 24]),
      opacity: interpolate(progress.value, [0, 0.3, 1], [1, 1, 0]),
    };
  });

  const rTitleStyle = useAnimatedStyle(() => {
    return {
      fontSize: interpolate(progress.value, [0, 1], [14, 28]),
    };
  });

  const rSubtitleStyle = useAnimatedStyle(() => {
    return {
      fontSize: interpolate(progress.value, [0, 1], [12, 24]),
    };
  });

  const rLabelsContainerStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      top: 0,
      left: interpolate(progress.value, [0, 1], [ImageHeight + 10, 0]),
      opacity: interpolate(progress.value, [0, 0.3, 1], [1, 1, 0]),
      marginTop: interpolate(
        progress.value,
        [0, 1],
        [5, ExpandedImageHeight + 24]
      ),
    };
  });

  const rCloseButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 0.3, 1], [0, 0, 1]),
      transform: [
        {
          scale: interpolate(progress.value, [0, 0.3, 1], [0.8, 0.8, 1]),
        },
      ],
    };
  });

  const rPlayButtonStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      top: 0,
      right: 20,
      opacity: interpolate(progress.value, [0, 0.3, 1], [1, 0, 0]),
    };
  });

  // Expanded content container
  const rExpandedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 0.3, 1], [0, 0, 1]),
      transform: [
        {
          translateY: interpolate(progress.value, [0, 0.3, 1], [50, 50, 0]),
        },
      ],
    };
  });

  // Header bar styles
  const rHeaderBarStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]),
      transform: [
        {
          translateY: interpolate(progress.value, [0, 0.5, 1], [20, 20, 0]),
        },
      ],
    };
  });

  // Verse display styles
  const rVerseContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 0.6, 1], [0, 0, 1]),
      transform: [
        {
          translateY: interpolate(progress.value, [0, 0.6, 1], [30, 30, 0]),
        },
      ],
    };
  });

  // Playback controls styles
  const rPlaybackControlsStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 0.7, 1], [0, 0, 1]),
      transform: [
        {
          translateY: interpolate(progress.value, [0, 0.7, 1], [40, 40, 0]),
        },
      ],
    };
  });

  // Feature buttons styles
  const rFeatureButtonsStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 0.8, 1], [0, 0, 1]),
      transform: [
        {
          translateY: interpolate(progress.value, [0, 0.8, 1], [50, 50, 0]),
        },
      ],
    };
  });

  const playButtonGesture = Gesture.Tap().onTouchesUp(() => {
    // This prevents the sheet tap gesture from firing
  });

  const rOverlayStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ["rgba(0, 0, 0, 0.7)", "rgba(0, 0, 0, 0.3)"]
      ),
    };
  });

  const formatTime = (timeInMilliseconds: number): string => {
    const totalSeconds = Math.floor(timeInMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSeekBackward = useCallback(() => {
    if (PLAYER_STATE.DURATION <= 0) return;

    const newPosition = Math.max(0, PLAYER_STATE.POSITION - 10000); // 10 seconds back
    seekTo(newPosition);
  }, [PLAYER_STATE.DURATION, PLAYER_STATE.POSITION, seekTo]);

  const handleSeekForward = useCallback(() => {
    if (PLAYER_STATE.DURATION <= 0) return;

    const newPosition = Math.min(
      PLAYER_STATE.DURATION,
      PLAYER_STATE.POSITION + 10000
    ); // 10 seconds forward
    seekTo(newPosition);
  }, [PLAYER_STATE.DURATION, PLAYER_STATE.POSITION, seekTo]);

  // Use selected theme background or fallback to original imageUrl
  const backgroundImageUrl = selectedTheme?.backgroundImageUrl || "";

  // Create dynamic verse text style with selected theme font
  const verseTextStyle = useMemo(() => {
    const baseStyle = {
      color: "white",
      fontSize: 24,
      fontWeight: "400" as const,
      textAlign: "center" as const,
      lineHeight: 36,
      marginBottom: 20,
    };

    if (selectedTheme?.font?.name) {
      return {
        ...baseStyle,
        fontFamily: selectedTheme.font.name,
      };
    }

    return baseStyle;
  }, [selectedTheme?.font?.name]);

  return (
    <ImageBackground
      source={{
        uri: backgroundImageUrl,
      }}
      style={styles.fill}
      contentFit="cover"
    >
      <Animated.View style={[styles.overlay, rOverlayStyle]} />

      {/* Mini Player Content */}
      <Animated.View style={rContentStyle}>
        <Animated.View style={rImageStyle}>
          <Image
            source={{
              uri: backgroundImageUrl,
            }}
            style={styles.fill}
          />
        </Animated.View>

        <Animated.View style={rLabelsContainerStyle}>
          <Animated.Text style={[rTitleStyle, styles.title]}>
            {`${reference}`}
          </Animated.Text>
          <Animated.Text style={[rSubtitleStyle, styles.subtitle]}>
            {formatTime(PLAYER_STATE.POSITION)}
          </Animated.Text>
        </Animated.View>

        {/* Play Button - Only visible in mini player state */}
        <Animated.View style={rPlayButtonStyle}>
          <GestureDetector gesture={playButtonGesture}>
            <TouchableOpacity
              onPress={PLAYER_STATE.PLAY_ACTION}
              style={styles.playButton}
            >
              <Icon
                // name={PLAYER_STATE.IS_PLAYING ? "Pause" : "Play"}
                name={
                  PLAYER_STATE.IS_DOWNLOADING
                    ? "Download"
                    : PLAYER_STATE.IS_PLAYING
                      ? "Pause"
                      : "Play"
                }
                size={24}
                color={"white"}
              />
            </TouchableOpacity>
          </GestureDetector>
        </Animated.View>
      </Animated.View>

      {/* Expanded UI Content */}
      <Animated.View style={[rExpandedContentStyle, styles.expandedContent]}>
        {/* Header Bar */}
        <Animated.View style={[rHeaderBarStyle, styles.headerBar]}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Icon name="X" size={20} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitleText}>
            Audio | {bibleQuery.book} {bibleQuery.chapter}
          </Text>

          <TouchableOpacity
            onPress={handleDropdown}
            style={styles.headerButton}
          >
            <Icon name="ChevronDown" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Verse Display */}
        <Animated.View style={[rVerseContainerStyle, styles.verseContainer]}>
          {selectedTheme && verseHtmlContent ? (
            <WebView
              key={selectedTheme.id}
              originWhitelist={["*"]}
              style={styles.verseWebView}
              source={{
                html: verseHtmlContent,
              }}
              scrollEnabled={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
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
            />
          ) : (
            <>
              <Text style={verseTextStyle}>{currentVerseText}</Text>
              <Text style={styles.verseReference}>{`${reference}:${verseIndex + 1
                }`}</Text>
            </>
          )}

          {/* Progress Line */}
        </Animated.View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressTimeText}>
            {formatTime(PLAYER_STATE.POSITION)}
          </Text>

          <View style={styles.progressLineContainer}>
            <View style={styles.progressLineBackground} />
            <View
              style={[
                styles.progressLineFill,
                {
                  width: `${PLAYER_STATE.DURATION > 0
                    ? (PLAYER_STATE.POSITION / PLAYER_STATE.DURATION) * 100
                    : 0
                    }%`,
                },
              ]}
            />
            {/* Progress Thumb */}
            <View
              style={[
                styles.progressThumb,
                {
                  left: `${PLAYER_STATE.DURATION > 0
                    ? (PLAYER_STATE.POSITION / PLAYER_STATE.DURATION) * 100 -
                    1
                    : 0
                    }%`,
                  backgroundColor: theme.colors.notification,
                },
              ]}
            />
          </View>

          <Text style={styles.progressTimeText}>
            {formatTime(PLAYER_STATE.DURATION)}
          </Text>
        </View>
        {/* Playback Controls */}
        <Animated.View
          style={[rPlaybackControlsStyle, styles.playbackControls]}
        >
          <TouchableOpacity
            onPress={handlePrevious}
            style={styles.controlButton}
          >
            <Icon name="SkipBack" size={32} color="white" />
          </TouchableOpacity>
          {/* 10s Backward Button */}
          <TouchableOpacity
            onPress={handleSeekBackward}
            style={styles.seekButton}
          >
            <MaterialCommunityIcons name="rewind-10" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={PLAYER_STATE.PLAY_ACTION}
            style={styles.playButtonLarge}
          >
            <Icon
              name={
                PLAYER_STATE.IS_DOWNLOADING
                  ? "Download"
                  : PLAYER_STATE.IS_PLAYING
                    ? "Pause"
                    : "Play"
              }
              size={48}
              color="white"
            />
          </TouchableOpacity>

          {/* 10s Forward Button */}
          <TouchableOpacity
            onPress={handleSeekForward}
            style={styles.seekButton}
          >
            <MaterialCommunityIcons
              name="fast-forward-10"
              size={20}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
            <Icon name="SkipForward" size={32} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Feature Buttons */}
        <Animated.View style={[rFeatureButtonsStyle, styles.featureButtons]}>
          {/* <TouchableOpacity onPress={handleSound} style={styles.featureButton}>
            <Icon name="Volume2" size={24} color="white" />
            <Text style={styles.featureButtonText}>Voz</Text>
          </TouchableOpacity> */}
          <TouchableOpacity onPress={handleShare} style={styles.featureButton}>
            <Icon name="Share" size={24} color="white" />
            <Text style={styles.featureButtonText}>Compartir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleTheming}
            style={styles.featureButton}
          >
            <Icon name="Palette" size={24} color="white" />
            <Text style={styles.featureButtonText}>Tema</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Theme Selector Bottom Sheet */}
      <ThemeSelectorBottomSheet
        bottomSheetRef={themeSelectorRef}
        selectedTheme={selectedTheme}
        onThemeSelect={handleThemeSelect}
        onClose={handleThemeClose}
      />
    </ImageBackground>
  );
};

const Palette = {
  background: "#0D0D0D",
  card: "#222222", // Slightly darker for better contrast with background
  icons: "#FFFFFF",
  text: "#FFFFFF",
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  subtitle: {
    color: Palette.text,
    marginTop: 2,
    opacity: 0.5,
  },
  title: {
    color: Palette.text,
  },
  closeButtonContainer: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  // Expanded UI Styles
  expandedContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  offlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  verseContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  verseWebView: {
    flex: 1,
    minWidth: "100%",
    backgroundColor: "transparent",
  },
  verseText: {
    color: "white",
    fontSize: 24,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 20,
  },
  verseReference: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 15,
  },
  progressLine: {
    width: 70,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressGradient: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
    // paddingHorizontal: 20,
  },
  progressTimeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "400",
    minWidth: 40,
    textAlign: "center",
  },
  progressLineContainer: {
    flex: 1,
    height: 2,
    position: "relative",
    paddingVertical: 3,
    justifyContent: "center",
    marginHorizontal: 14,
  },
  progressLineBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.432)",
    borderRadius: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  progressLineFill: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.808)",
    borderRadius: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  progressThumb: {
    position: "absolute",
    top: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffb731",
  },
  seekButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  seekButtonText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  playbackControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  playButtonLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  featureButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  featureButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 30,
    marginHorizontal: 10,
  },
  featureButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 5,
  },
});
