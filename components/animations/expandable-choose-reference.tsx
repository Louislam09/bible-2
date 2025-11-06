import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WebviewReferenceChoose from "@/components/home/content/WebviewReferenceChoose";
import { useMyTheme } from "@/context/ThemeContext";
import { bibleState$ } from "@/state/bibleState";
import Icon from "../Icon";
import { ChooseReferenceMutableProgress } from "./constants";

export const EasingsUtils = {
  inOut: Easing.bezier(0.25, 0.1, 0.25, 1),
};

const Palette = {
  background: "#0D0D0D",
  card: "#222222", // Slightly darker for better contrast with background
  icons: "#FFFFFF",
  text: "#FFFFFF",
};

type ExpandableChooseReferenceProps = {
  isCommentary?: boolean;
};

const ExpandableChooseReference = ({ isCommentary }: ExpandableChooseReferenceProps) => {
  const { height: windowHeight } = useWindowDimensions();
  const progress = ChooseReferenceMutableProgress;
  const { theme } = useMyTheme();

  const isTapped = useSharedValue(false);
  const progressThreshold = 0.8;
  const insets = useSafeAreaInsets();
  const safeTop = insets.top;
  const safeBottom = insets.bottom + 34;

  const closeModal = () => {
    bibleState$.isChooseReferenceOpened.set(false);
  };

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      if (progress.value >= progressThreshold) {
        return;
      }
      isTapped.value = true;
    })
    .onTouchesUp(() => {
      if (progress.value >= progressThreshold) {
        return;
      }

      progress.value = withTiming(1, {
        duration: 450,
        easing: EasingsUtils.inOut,
      });
    })
    .onFinalize(() => {
      isTapped.value = false;
    });

  const panEnabled = useSharedValue(false);
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      if (progress.value === 0) return;
      panEnabled.value = true;
    })
    .onUpdate((event) => {
      if (!panEnabled.value) return;
      progress.value = interpolate(
        event.translationY,
        [0, windowHeight],
        [1, 0]
      );
    })
    .onFinalize(() => {
      if (!panEnabled.value) return;
      panEnabled.value = false;
      const finalProgress = progress.value > progressThreshold ? 1 : 0;
      progress.value = withTiming(
        finalProgress,
        {
          duration: 350,
          easing: EasingsUtils.inOut,
        },
        (finished) => {
          if (finished && finalProgress === 0) {
            runOnJS(closeModal)();
          }
        }
      );
    });

  const rSheetStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(progress.value, [0, 1], [0, windowHeight - safeTop - (isCommentary ? 60 : 0)]),
      bottom: interpolate(progress.value, [0, 1], [safeBottom, 0]),
      left: interpolate(progress.value, [0, 1], [16, 0]),
      right: interpolate(progress.value, [0, 1], [16, 0]),
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [theme.colors.card, theme.colors.background]
      ),
      borderColor: interpolateColor(
        progress.value,
        [0, 0.9, 1],
        [
          theme.colors.notification + 50,
          "rgba(255, 255, 255, 0.1)",
          "rgba(255, 255, 255, 0.1)",
        ]
      ),
      borderRadius: interpolate(progress.value, [0, 0.9, 1], [16, 48, 0]),
      borderWidth: interpolate(
        progress.value,
        [0, 0.9, 1],
        [StyleSheet.hairlineWidth, StyleSheet.hairlineWidth, 0]
      ),
      shadowOpacity: interpolate(progress.value, [0, 1], [0.2, 0.5]),
      transform: [
        {
          scale: withTiming(isTapped.value ? 0.98 : 1, {
            easing: EasingsUtils.inOut,
          }),
        },
      ],
    };
  });

  const rKnobStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        progress.value,
        [0, progressThreshold / 2, 1],
        [0, 0, 1]
      ),
      zIndex: 1000,
    };
  });

  const rCloseButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        progress.value,
        [0, progressThreshold / 2, 1],
        [0, 0, 1]
      ),
      zIndex: 1000,
    };
  });

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
  const gestures = Gesture.Simultaneous(tapGesture, panGesture);

  return (
    <Animated.View style={[rSheetStyle, styles.container]}>
      <GestureDetector gesture={gestures}>
        <Animated.View
          style={[
            rKnobStyle,
            {
              height: safeTop,
              top: safeTop + 20,
            },
            styles.knobContainer,
          ]}
        >
          <View style={styles.knob} />
        </Animated.View>
      </GestureDetector>

      <Animated.View
        style={[
          rCloseButtonStyle,
          {
            top: safeTop + 20,
            right: 20,
          },
          styles.closeButtonContainer,
        ]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Icon name="X" color={theme.colors.text} size={20} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.webviewContainer}>
        <WebviewReferenceChoose isCommentary={isCommentary} onClose={handleClose} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    position: "absolute",
    shadowColor: Palette.card,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    overflow: "hidden",
    flex: 9999,
  },
  knob: {
    // backgroundColor: "#767676",
    backgroundColor: "#ffffff90",
    borderRadius: 24,
    height: 4,
    width: 48,
  },
  knobContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    width: "100%",
  },
  closeButtonContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 40,
    height: 40,
  },
  webviewContainer: {
    flex: 1,
    marginTop: 60, // Add some top margin to avoid overlap with knob and close button
  },
});

export default ExpandableChooseReference;
