import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";

const BASE_MS = 44;
const STEP_MS = 46;

type Props = {
  index: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Staggered slide-up + fade on first mount. */
export function StaggerEnter({ index, children, style }: Props) {
  return (
    <Animated.View
      entering={FadeInDown
        .delay(BASE_MS + index * STEP_MS)
        .duration(380)
        .easing(Easing.out(Easing.cubic))}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
