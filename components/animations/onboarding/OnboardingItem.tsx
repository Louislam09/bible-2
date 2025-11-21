import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Dimensions,
} from "react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import LottieView from "lottie-react-native";
import { OnboardingSlide } from "./data";
import Icon from "@/components/Icon";
import { useMyTheme } from "@/context/ThemeContext";

interface OnboardingItemProps {
  item: OnboardingSlide;
  index: number;
  x: SharedValue<number>;
}

const OnboardingItem: React.FC<OnboardingItemProps> = ({ item, index, x }) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { theme } = useMyTheme();
  const styles = getStyles(theme, SCREEN_WIDTH);

  const lottieStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );
    return {
      // width: width * 0.8,
      // height: width * 0.8,
      transform: [{ scale }],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [100, 0, 100],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={[styles.container, { width: SCREEN_WIDTH }]}>
      <View style={styles.imageContainer}>
        {item.lottie ? (
          <Animated.View style={[lottieStyle]}>
            <LottieView
              source={item.lottie}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            // style={styles.lottie}
            />
          </Animated.View>
        ) : (
          <Animated.View style={[styles.iconWrapper, lottieStyle, { backgroundColor: item.color + "20" }]}>
            <Icon name={item.icon || "BookOpen"} size={120} color={item.color} />
          </Animated.View>
        )}
      </View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={[styles.title, { color: item.color }]}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
};

const getStyles = (theme: any, width: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",

    },
    imageContainer: {
      // flex: 0.6,
      justifyContent: "center",
      alignItems: "center",
      width: width,
      // borderWidth: 1,
      // borderColor: "red",
    },

    lottie: {
      width: "100%",
      height: "100%",
    },
    iconWrapper: {
      width: width * 0.6,
      height: width * 0.6,
      borderRadius: (width * 0.6) / 2,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    textContainer: {
      flex: 0.4,
      paddingHorizontal: 40,
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 15,
      textAlign: "center",
    },
    description: {
      fontSize: 16,
      color: theme.colors.text,
      textAlign: "center",
      lineHeight: 24,
      opacity: 0.8,
    },
  });

export default OnboardingItem;

