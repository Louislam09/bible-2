import { StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Constants
const HEADER_HEIGHT = 60;
const MIN_SECTION_HEIGHT = 100;
const VELOCITY_THRESHOLD = 800;
const HEIGHT_THRESHOLD = 50;

// Animation Configuration
const ANIMATION_CONFIG = {
  damping: 25, // Controls bounce (lower = more bouncy)
  stiffness: 300, // Controls speed (higher = faster)
  mass: 0.8, // Controls inertia (higher = more inertia)
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

type ResizableSplitViewProps = {
  topContent: React.ReactNode;
  bottomContent: React.ReactNode;
  minSectionHeight?: number;
  defaultTopSectionHeight?: number;
  maxTopSectionHeight?: number;
  headerHeight?: number;
  onHeightChange?: (height: number) => void;
};

const ResizableSplitView: React.FC<ResizableSplitViewProps> = ({
  topContent,
  bottomContent,
  minSectionHeight = MIN_SECTION_HEIGHT,
  defaultTopSectionHeight,
  maxTopSectionHeight,
  headerHeight = HEADER_HEIGHT,
  onHeightChange,
}) => {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Calculate default heights if not provided
  const DEFAULT_TOP_SECTION_HEIGHT =
    defaultTopSectionHeight ?? SCREEN_HEIGHT * 0.45;
  const MAX_TOP_SECTION_HEIGHT =
    maxTopSectionHeight ?? SCREEN_HEIGHT * 0.7;

  // Shared values
  const topSectionHeight = useSharedValue(DEFAULT_TOP_SECTION_HEIGHT);
  const isDragging = useSharedValue(false);
  const startY = useSharedValue(0);

  // Snap positions (stored as constants for worklet access)

  // Notify height change callback
  const notifyHeightChange = (height: number) => {
    if (onHeightChange) {
      onHeightChange(height);
    }
  };

  // Pan gesture handler
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = topSectionHeight.value;
      isDragging.value = true;
    })
    .onUpdate((event) => {
      const newHeight = startY.value + event.translationY;
      const constrainedHeight = Math.max(
        minSectionHeight,
        Math.min(MAX_TOP_SECTION_HEIGHT, newHeight)
      );
      topSectionHeight.value = constrainedHeight;
    })
    .onEnd(() => {
      "worklet";
      isDragging.value = false;

      // No snapping - stay at current position
      // Min/max constraints are already enforced in onUpdate
      const currentHeight = topSectionHeight.value;
      runOnJS(notifyHeightChange)(currentHeight);
    });

  // Animated styles
  const topSectionAnimatedStyle = useAnimatedStyle(() => ({
    height: topSectionHeight.value,
  }));

  const bottomSectionAnimatedStyle = useAnimatedStyle(() => {
    const availableHeight =
      SCREEN_HEIGHT - insets.top - insets.bottom - headerHeight;
    return {
      height: availableHeight - topSectionHeight.value,
    };
  });

  const dragHandleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: isDragging.value ? 1 : 0.6,
  }));

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Top Section - Resizable */}
        <Animated.View style={[styles.topSection, topSectionAnimatedStyle]}>
          {topContent}
        </Animated.View>

        {/* Drag Handle */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[styles.dragHandleContainer, dragHandleAnimatedStyle]}
          >
            <Animated.View style={styles.dragHandle} />
          </Animated.View>
        </GestureDetector>

        {/* Bottom Section - Auto-adjusting */}
        <Animated.View
          style={[styles.bottomSection, bottomSectionAnimatedStyle]}
        >
          {bottomContent}
        </Animated.View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
  },
  container: {
    flex: 1,
  },
  topSection: {
    overflow: "hidden",
  },
  bottomSection: {
    overflow: "hidden",
  },
  dragHandleContainer: {
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  dragHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#767676",
  },
});

export default ResizableSplitView;

