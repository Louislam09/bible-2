import LottieView, { AnimationObject } from "lottie-react-native";
import React, { FC, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { icons } from "lucide-react-native";
import Icon from "./Icon";

type ScreenWithAnimationProps = {
  /** The child components to render once the animation is complete. */
  children: React.ReactNode;
  /** The source of the Lottie animation. */
  animationSource?: string | AnimationObject | { uri: string };
  /** The name of the icon to display if no animation source is provided. */
  icon?: keyof typeof icons;
  /** The title text to display during the animation. */
  title?: string;
  /** The speed of the animation. */
  speed?: number;
  /** The duration of the opacity transition in milliseconds. */
  duration?: number;
  /** A flag indicating whether the animation should play on mount. */
  shouldPlay?: boolean;
};

/**
 * A functional component that displays an animation or icon with a transition effect.
 *
 * @param {React.ReactNode} children - The child components to render once the animation is complete.
 * @param {number} [speed=1] - The speed of the animation.
 * @param {string} title - The title text to display during the animation.
 * @param {object} animationSource - The source of the Lottie animation.
 * @param {string} icon - The name of the icon to display if no animation source is provided.
 * @param {number} [duration=1500] - The duration of the opacity transition in milliseconds.
 * @param {boolean} [shouldPlay=true] - A flag indicating whether the animation should play on mount.
 *
 * @returns {JSX.Element} The rendered component.
 */
const ScreenWithAnimation: FC<ScreenWithAnimationProps> = ({
  children,
  speed = 1,
  title,
  animationSource,
  icon,
  duration = 1500,
  shouldPlay = true,
}) => {
  const [isAnimating, setIsAnimating] = useState(shouldPlay);
  const opacity = useRef(new Animated.Value(0)).current;
  const bounceValue = useRef(new Animated.Value(0)).current;
  const theme = useTheme();

  const onAnimationFinish = (isCancelled: boolean) => {
    setIsAnimating(false);
  };

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: duration,
      useNativeDriver: true,
    }).start(({ finished }) => onAnimationFinish(finished));

    if (icon && !animationSource) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceValue, {
            toValue: -10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [opacity, bounceValue, icon, animationSource, duration]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {isAnimating && (
        <View
          style={[
            styles.animationContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {animationSource ? (
            <LottieView
              source={animationSource}
              autoPlay
              speed={speed}
              loop={false}
              style={{ width: 300, height: 300 }}
              onAnimationFinish={onAnimationFinish}
            />
          ) : (
            icon && (
              <Animated.View
                style={{ transform: [{ translateY: bounceValue }], opacity }}
              >
                <Icon name={icon} size={100} color={theme.colors.text} />
              </Animated.View>
            )
          )}
          {title && (
            <Animated.Text
              style={{ color: theme.colors.text, fontSize: 28, opacity }}
            >
              {title}
            </Animated.Text>
          )}
        </View>
      )}

      {!isAnimating && children}
    </View>
  );
};

export default ScreenWithAnimation;

const styles = StyleSheet.create({
  animationContainer: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
});
