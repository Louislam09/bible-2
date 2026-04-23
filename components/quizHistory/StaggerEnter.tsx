import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";

const BASE_MS = 55;
const STEP_MS = 54;

type Props = {
  index: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Added before the index-based stagger (e.g. wait for sheet / route transition). */
  delayOffsetMs?: number;
};

/** Staggered slide-up + fade on first mount. */
export function StaggerEnter({ index, children, style, delayOffsetMs = 0 }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.delay(BASE_MS + delayOffsetMs + index * STEP_MS)
        .duration(460)
        .easing(Easing.bezier(0.4, 0, 0.2, 1))}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
