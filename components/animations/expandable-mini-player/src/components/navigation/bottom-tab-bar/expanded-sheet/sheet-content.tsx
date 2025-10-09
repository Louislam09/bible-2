import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Animated, {
  interpolate,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { EasingsUtils } from "../../../../animations/easings";
import { Palette } from "../../../../constants/palette";
import { MiniPlayerHeight } from "./constants";

import Icon from "@/components/Icon";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import useBibleReader from "@/hooks/useBibleReading";
import useChangeBookOrChapter from "@/hooks/useChangeBookOrChapter";
import { bibleState$ } from "@/state/bibleState";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import { useNetInfo } from "@react-native-community/netinfo";

type SheetContentProps = {
  progress: SharedValue<number>;
  timeProgress: string;
  imageUrl: string;
};

const ImageHeight = 44;
const ExpandedImageHeight = ImageHeight * 3;

const BaseOffset = (MiniPlayerHeight - ImageHeight) / 2;

export const SheetContent = ({
  progress,
  timeProgress,
  imageUrl,
}: SheetContentProps) => {
  const { theme } = useMyTheme();
  const { isConnected } = useNetInfo();

  const bibleQuery = bibleState$.bibleQuery.get();
  const reference = `${bibleQuery.book} ${bibleQuery.chapter}`;

  const currentVoiceIdentifier = storedData$.currentVoiceIdentifier.get();
  const currentVoiceRate = storedData$.currentVoiceRate.get() || 1;
  const {
    verseIndex,
    startReading,
    stopReading,
    isSpeaking,
    reading: isReading,
    ended,
    reset,
    currentVerseText,
  } = useBibleReader({
    currentChapterVerses: bibleState$.bibleData.topVerses.get() as any,
    currentVoiceIdentifier,
    voiceRate: currentVoiceRate,
  });

  const { nextChapter, previousChapter } = useChangeBookOrChapter({
    book: bibleQuery.book,
    chapter: bibleQuery.chapter,
  });

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
    // Handle share functionality
  };

  const handleTheming = () => {
    // Handle theming
  };

  const handleDropdown = () => {
    progress.value = withTiming(0, {
      duration: 350,
      easing: EasingsUtils.inOut,
    });
  };

  const handleClose = () => {
    progress.value = withTiming(0, {
      duration: 550,
      easing: EasingsUtils.inOut,
    });
    setTimeout(() => {
      bibleState$.toggleIsPlayerOpened();
    }, 550);
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

  return (
    <ImageBackground
      source={{
        uri: imageUrl,
      }}
      style={styles.fill}
      contentFit="cover"
    >
      <View style={styles.overlay} />

      {/* Mini Player Content */}
      <Animated.View style={rContentStyle}>
        <Animated.View style={rImageStyle}>
          <Image
            source={{
              uri: imageUrl,
            }}
            style={styles.fill}
          />
        </Animated.View>

        <Animated.View style={rLabelsContainerStyle}>
          <Animated.Text style={[rTitleStyle, styles.title]}>
            {`${reference}:${verseIndex + 1}`}
          </Animated.Text>
          <Animated.Text style={[rSubtitleStyle, styles.subtitle]}>
            {timeProgress}
          </Animated.Text>
        </Animated.View>

        {/* Play Button - Only visible in mini player state */}
        <Animated.View style={rPlayButtonStyle}>
          <GestureDetector gesture={playButtonGesture}>
            <TouchableOpacity onPress={handlePlay} style={styles.playButton}>
              <Icon
                name={isReading ? "Pause" : "Play"}
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
          <Text style={styles.verseText}>{currentVerseText}</Text>
          <Text style={styles.verseReference}>{`${reference}:${
            verseIndex + 1
          }`}</Text>
          <View style={styles.progressLine}>
            <LinearGradient
              colors={["#FF6B35", "#20ACB6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </View>
        </Animated.View>

        {/* <View style={styles.offlineContainer}>
          <Icon name="WifiOff" size={18} color="white" />
        </View> */}

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
          <TouchableOpacity onPress={handlePlay} style={styles.playButtonLarge}>
            <Icon name={isReading ? "Pause" : "Play"} size={48} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
            <Icon name="SkipForward" size={32} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Feature Buttons */}
        <Animated.View style={[rFeatureButtonsStyle, styles.featureButtons]}>
          <TouchableOpacity onPress={handleSound} style={styles.featureButton}>
            <Icon name="Volume2" size={24} color="white" />
            <Text style={styles.featureButtonText}>Voz</Text>
          </TouchableOpacity>
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
    </ImageBackground>
  );
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
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
