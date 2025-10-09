import { View, Image, StyleSheet, TouchableOpacity } from "react-native";

import Animated, {
  interpolate,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { MiniPlayerHeight } from "./constants";
import { Palette } from "../../../../constants/palette";
import { EasingsUtils } from "../../../../animations/easings";

import type { SharedValue } from "react-native-reanimated";
import Icon from "@/components/Icon";
import { bibleState$ } from "@/state/bibleState";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useState } from "react";
import { useMyTheme } from "@/context/ThemeContext";
import { ImageBackground } from "expo-image";

type SheetContentProps = {
  progress: SharedValue<number>;
  reference: string;
  timeProgress: string;
  imageUrl: string;
};

const ImageHeight = 44;
const ExpandedImageHeight = ImageHeight * 3;

const BaseOffset = (MiniPlayerHeight - ImageHeight) / 2;

export const SheetContent = ({
  progress,
  reference,
  timeProgress,
  imageUrl,
}: SheetContentProps) => {
  const { theme } = useMyTheme();

  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleClose = () => {
    progress.value = withTiming(0, {
      duration: 350,
      easing: EasingsUtils.inOut,
    });
    bibleState$.toggleIsPlayerOpened();
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

  const playButtonGesture = Gesture.Tap().onTouchesUp(() => {
    // This prevents the sheet tap gesture from firing
  });

  return (
    <ImageBackground
      source={{
        uri: "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg",
      }}
      style={styles.fill}
      contentFit="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.fill}>
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
              {reference}
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
                  name={isPlaying ? "Pause" : "Play"}
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </GestureDetector>
          </Animated.View>
        </Animated.View>

        {/* Close Button */}
        <Animated.View style={[rCloseButtonStyle, styles.closeButtonContainer]}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Icon name="X" size={24} color={Palette.text} />
          </TouchableOpacity>
        </Animated.View>
      </View>
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
});
