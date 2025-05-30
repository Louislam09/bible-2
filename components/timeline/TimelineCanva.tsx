import React, { memo, ReactNode, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector, State } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { wp, wpUI } from "./timelineConstants";

function friction(value: number) {
  "worklet";

  const MAX_FRICTION = 200;
  const MAX_VALUE = 500;

  const res = Math.max(
    1,
    Math.min(
      MAX_FRICTION,
      1 + (Math.abs(value) * (MAX_FRICTION - 1)) / MAX_VALUE
    )
  );

  if (value < 0) {
    return -res;
  }

  return res;
}

interface AnimationProps {
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  translationX: SharedValue<number>;
  velocityX: SharedValue<number>;
  translationY: SharedValue<number>;
  velocityY: SharedValue<number>;
  state: SharedValue<State>;
  containerHeight: number;
  containerWidth: number;
  onPrev: () => void;
  onNext: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  contentWidth: number;
  contentHeight: number;
  isReady: SharedValue<number>;
  entrance: 0 | 1;
  opacity: SharedValue<number>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
});

interface ScrollViewProps {
  children: ReactNode;
  x: SharedValue<number>;
  y: SharedValue<number>;
  width: number;
  height: number;
  onPrev: () => void;
  onNext: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isReady: SharedValue<number>;
  entrance: 0 | 1;
}

export default memo(
  ({
    children,
    width,
    height,
    x,
    y,
    onPrev,
    onNext,
    isFirst,
    isLast,
    isReady,
    entrance,
  }: ScrollViewProps) => {
    const [containerHeight, setContainerHeight] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const opacity = useSharedValue(0);
    const canStartAnimation = useSharedValue(0);
    const upperBoundX = 0;
    const lowerBoundX = -1 * (width - containerWidth);
    const upperBoundY = 0;
    const lowerBoundY = -1 * (height - containerHeight);
    const deltaX = useSharedValue(0);
    const deltaY = useSharedValue(0);

    useEffect(() => {
      const checkAndStartAnimation = () => {
        if (canStartAnimation.value === 0) {
          x.value = entrance ? wpUI(100) : lowerBoundX - wpUI(100);
          canStartAnimation.value = withDelay(
            1500,
            withTiming(1, { duration: 0 })
          );
        }
      };
      checkAndStartAnimation();
    }, []);

    useAnimatedReaction(
      () => canStartAnimation.value,
      () => {
        if (canStartAnimation.value === 1) {
          if (!isReady.value) {
            opacity.value = 1;
            x.value = withTiming(
              entrance ? 0 : lowerBoundX,
              { duration: 1000 },
              () => {
                isReady.value = 1;
              }
            );
          }
        }
      }
    );

    const animatedStyles = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: y.value }, { translateX: x.value }],
    }));

    const panGesture = Gesture.Pan()
      .onStart((e) => {
        deltaX.value = x.value;
        deltaY.value = y.value;
      })
      .onUpdate((e) => {
        const translateX = deltaX.value + e.translationX;
        const translateY = deltaY.value + e.translationY;

        // Apply friction when reaching the bounds
        const isInBoundX = x.value >= lowerBoundX && x.value <= upperBoundX;
        if (!isInBoundX) {
          const bound = x.value < lowerBoundX ? lowerBoundX : upperBoundX;
          const distance = bound - translateX;
          x.value = bound - friction(distance);
        } else {
          x.value = translateX;
        }

        const isInBoundY = y.value >= lowerBoundY && y.value <= upperBoundY;
        if (!isInBoundY) {
          const bound = y.value < lowerBoundY ? lowerBoundY : upperBoundY;
          const distance = bound - translateY;
          y.value = bound - friction(distance);
        } else {
          y.value = deltaY.value + e.translationY;
        }
      })
      .onEnd((e) => {
        const isInBoundX = x.value >= lowerBoundX && x.value <= upperBoundX;
        if (!isInBoundX) {
          const direction = e.velocityX > 0 ? "left" : "right";

          if (
            direction === "left" &&
            !isFirst &&
            (x.value - upperBoundX > 100 || e.velocityX > 1800)
          ) {
            x.value = withTiming(
              upperBoundX + wpUI(100),
              { duration: 300 },
              () => {
                runOnJS(onPrev)();
              }
            );
          } else if (
            direction === "right" &&
            !isLast &&
            (x.value - lowerBoundX < -100 || e.velocityX < -1800)
          ) {
            x.value = withTiming(
              lowerBoundX - wpUI(100),
              { duration: 300 },
              () => {
                runOnJS(onNext)();
              }
            );
          } else {
            x.value = withTiming(
              Math.max(lowerBoundX, Math.min(upperBoundX, x.value))
            );
          }
        } else {
          x.value = withDecay({
            velocity: e.velocityX,
            clamp: [lowerBoundX, upperBoundX],
            rubberBandEffect: true,
            rubberBandFactor: 1,
            velocityFactor: 0.6,
          });
        }
        const isInBoundY = y.value >= lowerBoundY && y.value <= upperBoundY;
        if (!isInBoundY) {
          y.value = withTiming(
            Math.max(lowerBoundY, Math.min(upperBoundY, y.value))
          );
        } else {
          y.value = withDecay({
            velocity: e.velocityY,
            clamp: [lowerBoundY, upperBoundY],
            rubberBandEffect: true,
            rubberBandFactor: 1,
            velocityFactor: 0.6,
          });
        }
      });

    return (
      <View
        style={styles.container}
        onLayout={({
          nativeEvent: {
            layout: { height: h, width: w },
          },
        }) => {
          setContainerHeight(h);
          setContainerWidth(w);
        }}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ width, height }, animatedStyles]}>
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }
);
