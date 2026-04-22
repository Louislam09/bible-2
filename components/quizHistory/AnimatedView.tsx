import React, { useMemo } from "react";
import type { ViewStyle } from "react-native";
import Animated, {
  BaseAnimationBuilder,
  Easing,
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  SlideInUp,
  SlideOutDown,
  SlideOutLeft,
  SlideOutRight,
  SlideOutUp,
  StretchInY,
  StretchOutY,
  ZoomInDown,
  ZoomInUp,
  ZoomOutDown,
  ZoomOutUp,
} from "react-native-reanimated";

/** Presets for `entering` / `exiting` on screen content (e.g. Mis quiz stack). */
export type AnimatedViewTransition =
  | "forward"
  | "backward"
  | "expand-up"
  | "expand-down"
  | "expand-updown"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "slide-down";

type Props = {
  children: React.ReactNode;
  direction?: AnimatedViewTransition;
  style?: ViewStyle | ViewStyle[];
};

// const DURATION = 220;
const DURATION = 300;

const ease = Easing.out(Easing.quad);

/**
 * `BaseAnimationBuilder` typings omit `easing` (it lives on subclasses). Runtime chain is valid.
 */
type BuilderWithEasing = BaseAnimationBuilder & {
  easing: (easingFunction: (v: number) => number) => BaseAnimationBuilder;
};

function timed(Builder: typeof BaseAnimationBuilder): BaseAnimationBuilder {
  const chain = Builder.duration(DURATION) as BuilderWithEasing;
  return chain.easing(ease) as BaseAnimationBuilder;
}

function enteringExitingFor(
  transition: AnimatedViewTransition,
): { entering: BaseAnimationBuilder; exiting: BaseAnimationBuilder } {
  switch (transition) {
    case "forward":
      return {
        entering: timed(FadeInRight),
        exiting: timed(FadeOutLeft),
      };
    case "backward":
      return {
        entering: timed(FadeInLeft),
        exiting: timed(FadeOutRight),
      };
    case "expand-up":
      return {
        entering: timed(ZoomInUp),
        exiting: timed(ZoomOutUp),
      };
    case "expand-down":
      return {
        entering: timed(ZoomInDown),
        exiting: timed(ZoomOutDown),
      };
    case "expand-updown":
      return {
        entering: timed(StretchInY),
        exiting: timed(StretchOutY),
      };
    case "slide-left":
      return {
        entering: timed(SlideInLeft),
        exiting: timed(SlideOutRight),
      };
    case "slide-right":
      return {
        entering: timed(SlideInRight),
        exiting: timed(SlideOutLeft),
      };
    case "slide-up":
      return {
        entering: timed(SlideInUp),
        exiting: timed(SlideOutDown),
      };
    case "slide-down":
      return {
        entering: timed(SlideInDown),
        exiting: timed(SlideOutUp),
      };
    default: {
      const _n: never = transition;
      void _n;
      return {
        entering: timed(FadeInRight),
        exiting: timed(FadeOutLeft),
      };
    }
  }
}

export const AnimatedView: React.FC<Props> = ({
  children,
  direction = "forward",
  style,
}) => {
  const { entering, exiting } = useMemo(
    () => enteringExitingFor(direction),
    [direction],
  );

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
