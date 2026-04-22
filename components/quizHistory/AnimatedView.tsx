import React, { useMemo } from "react";
import type { ViewStyle } from "react-native";
import Animated, {
  BaseAnimationBuilder,
  Easing,
  FadeIn,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  FadeOutLeft,
  FadeOutRight,
  SharedTransition,
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
  ZoomIn,
  ZoomInDown,
  ZoomInLeft,
  ZoomInUp,
  ZoomOut,
  ZoomOutDown,
  ZoomOutLeft,
  ZoomOutUp,
  ZoomOutRight,
} from "react-native-reanimated";

/** Presets for `entering` / `exiting` on screen content (e.g. Mis quiz stack). */
export type AnimatedViewTransition =
  | "forward"
  | "backward"
  | "expand-up"
  | "expand-down"
  | "expand-updown"
  | "expand-center"
  /** Zoom desde un lateral (héroe / continuidad con la vista anterior; sin `sharedTransitionTag`). */
  | "expand-from-previous"
  /**
   * Transición compartida (misma `sharedTransitionTag` en el origen, p. ej. un avatar o tarjeta).
   * Requiere `sharedTransitionTag` en el elemento fuente y en este `AnimatedView`.
   */
  | "shared-element"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "slide-down";

type Props = {
  children: React.ReactNode;
  direction?: AnimatedViewTransition;
  style?: ViewStyle | ViewStyle[];
  /**
   * Obligatorio si `direction === "shared-element"`: el mismo string que en la vista
   * origen (p. ej. el botón o avatar que inicia la navegación).
   */
  sharedTransitionTag?: string;
};

const DURATION = 300;

const ease = Easing.out(Easing.quad);

type BuilderWithEasing = BaseAnimationBuilder & {
  easing: (easingFunction: (v: number) => number) => BaseAnimationBuilder;
};

function timed(Builder: typeof BaseAnimationBuilder): BaseAnimationBuilder {
  const chain = Builder.duration(DURATION) as BuilderWithEasing;
  return chain.easing(ease) as BaseAnimationBuilder;
}

const sharedSheetStyle = SharedTransition.duration(DURATION);

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
    case "expand-center":
      return {
        entering: timed(ZoomIn),
        exiting: timed(ZoomOut),
      };
    case "expand-from-previous":
      return {
        entering: timed(ZoomInLeft),
        exiting: timed(ZoomOutRight),
      };
    case "shared-element":
      return {
        entering: timed(FadeIn),
        exiting: timed(FadeOut),
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
  sharedTransitionTag,
}) => {
  const { entering, exiting } = useMemo(
    () => enteringExitingFor(direction),
    [direction],
  );

  const useShared = direction === "shared-element" && sharedTransitionTag;

  return (
    <Animated.View
      style={[{ flex: 1 }, style]}
      entering={entering}
      exiting={exiting}
      sharedTransitionStyle={useShared ? sharedSheetStyle : undefined}
      sharedTransitionTag={useShared ? sharedTransitionTag : undefined}
    >
      {children}
    </Animated.View>
  );
};
