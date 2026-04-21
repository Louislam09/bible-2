import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import LottieView, { AnimationObject } from "lottie-react-native";
import { icons } from "lucide-react-native";
import React, { FC, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import Icon from "./Icon";

type ScreenWithAnimationProps = {
  children: React.ReactNode;
  animationSource?: string | AnimationObject | { uri: string };
  icon?: keyof typeof icons;
  imageSource?: any;
  title?: string;
  speed?: number;
  duration?: number;
  shouldPlay?: boolean;
  isVisible?: boolean;
  backgroundColor?: any;
  titleColor?: any;
  iconColor?: any;
  loop?: boolean;
  customContent?: React.ReactNode;
};

const ScreenWithAnimation: FC<ScreenWithAnimationProps> = ({
  children,
  speed = 1,
  title,
  animationSource,
  icon,
  duration = 1500,
  shouldPlay = true,
  isVisible,
  loop,
  backgroundColor,
  titleColor,
  iconColor,
  imageSource,
  customContent,
}) => {
  const [isAnimating, setIsAnimating] = useState(shouldPlay);
  const opacity = useSharedValue(0);
  const bounceValue = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const { theme } = useMyTheme();
  const styles = getStyles(theme);

  const finishAnimation = () => {
    setIsAnimating(false);
  };

  useEffect(() => {
    if (isVisible) {
      // Loop opacity 0→1→0 (avoid withSequence — not always available in UI worklets)
      opacity.value = withRepeat(
        withTiming(1, { duration }),
        -1,
        true,
      );
    } else {
      // Entrance animation
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      }, (finished) => {
        if (finished) {
          runOnJS(finishAnimation)();
        }
      });

      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });


    }

    if ((icon || imageSource) && !animationSource) {
      bounceValue.value = withRepeat(
        withTiming(-10, { duration: 500 }),
        -1,
        true,
      );
    }
  }, [icon, imageSource, animationSource, duration, isVisible]);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: bounceValue.value },
        { scale: scale.value },
      ],
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: bounceValue.value },
        { scale: scale.value },
      ],
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const onAnimationFinish = (isCancelled: boolean) => {
    if (!isCancelled) return;
    finishAnimation();
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: backgroundColor || theme.colors.background,
      }}
    >
      {isAnimating && !customContent && (
        <View
          style={[
            styles.animationContainer,
            { backgroundColor: backgroundColor || theme.colors.background },
          ]}
        >
          {animationSource ? (
            <LottieView
              source={animationSource}
              autoPlay
              speed={speed}
              loop={loop || false}
              style={{ width: 300, height: 300 }}
              onAnimationFinish={onAnimationFinish}
            />
          ) : imageSource ? (
            <Animated.Image
              source={imageSource}
              style={[
                {
                  width: 300,
                  height: 300,
                },
                imageAnimatedStyle,
              ]}
              resizeMode="contain"
            />
          ) : (
            <Animated.View style={iconAnimatedStyle}>
              <Icon
                name={icon || "BookPlus"}
                size={100}
                color={iconColor || theme.colors.text}
              />
            </Animated.View>
          )}
          {title && (
            <Animated.Text
              style={[
                {
                  color: titleColor || theme.colors.text,
                  fontSize: 28,
                  fontWeight: "bold",
                  marginTop: 20,
                },
                titleAnimatedStyle,
              ]}
            >
              {title}
            </Animated.Text>
          )}
        </View>
      )}
      {customContent && (
        <View
          style={[
            styles.customContentContainer,
            { backgroundColor: backgroundColor || theme.colors.background },
          ]}
        >
          {customContent}
        </View>
      )}

      {!isAnimating && children}
    </View>
  );
};

export default ScreenWithAnimation;

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    animationContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
    },
    customContentContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
