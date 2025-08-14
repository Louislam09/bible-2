import { useTheme } from "@react-navigation/native";
import LottieView, { AnimationObject } from "lottie-react-native";
import { icons } from "lucide-react-native";
import React, { FC, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Icon from "./Icon";
import { TTheme } from "@/types";

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
  const opacity = useRef(new Animated.Value(0)).current;
  const bounceValue = useRef(new Animated.Value(0)).current;
  const theme = useTheme();
  const styles = getStyles(theme);

  const onAnimationFinish = (isCancelled: boolean) => {
    setIsAnimating(false);
  };

  const animateOpacityLoop = () => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    if (isVisible) {
      animateOpacityLoop();
    } else {
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }).start(({ finished }) => onAnimationFinish(finished));
    }

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
  }, [opacity, bounceValue, icon, animationSource, duration, isVisible]);

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
              style={{
                width: 300,
                height: 300,
                opacity,
                transform: [{ translateY: bounceValue }],
              }}
              resizeMode="contain"
            />
          ) : (
            <Animated.View
              style={{ transform: [{ translateY: bounceValue }], opacity }}
            >
              <Icon
                name={icon! || "BookPlus"}
                size={100}
                color={iconColor || theme.colors.text}
              />
            </Animated.View>
          )}
          {title && (
            <Animated.Text
              style={{
                color: titleColor || theme.colors.text,
                fontSize: 28,
                opacity,
              }}
            >
              {title}
            </Animated.Text>
          )}
        </View>
      )}
      <View
        style={[
          styles.customContentContainer,
          { backgroundColor: backgroundColor || theme.colors.background },
        ]}
      >
        {customContent && customContent}
      </View>

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
