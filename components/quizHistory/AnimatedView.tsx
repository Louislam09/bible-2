import React from "react";
import type { ViewStyle } from "react-native";
import Animated, {
  Easing,
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
} from "react-native-reanimated";

type Direction = "forward" | "backward";

type Props = {
  children: React.ReactNode;
  direction?: Direction;
  style?: ViewStyle | ViewStyle[];
};

const DURATION = 220;

export const AnimatedView: React.FC<Props> = ({
  children,
  direction = "forward",
  style,
}) => {
  const entering =
    direction === "forward"
      ? FadeInRight.duration(DURATION).easing(Easing.out(Easing.quad))
      : FadeInLeft.duration(DURATION).easing(Easing.out(Easing.quad));
  const exiting =
    direction === "forward"
      ? FadeOutLeft.duration(DURATION).easing(Easing.out(Easing.quad))
      : FadeOutRight.duration(DURATION).easing(Easing.out(Easing.quad));

  return (
    <Animated.View
      style={[{ flex: 1 }, style]}
      entering={entering}
      exiting={exiting}
    >
      {children}
    </Animated.View>
  );
};
