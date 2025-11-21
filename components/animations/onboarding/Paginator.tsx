import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { OnboardingSlide } from "./data";

interface PaginatorProps {
  data: OnboardingSlide[];
  x: SharedValue<number>;
  color?: string;
}

const Paginator: React.FC<PaginatorProps> = ({ data, x, color }) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {data.map((_, i) => {
        const animatedDotStyle = useAnimatedStyle(() => {
          const width = interpolate(
            x.value,
            [
              (i - 1) * SCREEN_WIDTH,
              i * SCREEN_WIDTH,
              (i + 1) * SCREEN_WIDTH,
            ],
            [10, 20, 10],
            Extrapolation.CLAMP
          );

          const opacity = interpolate(
            x.value,
            [
              (i - 1) * SCREEN_WIDTH,
              i * SCREEN_WIDTH,
              (i + 1) * SCREEN_WIDTH,
            ],
            [0.5, 1, 0.5],
            Extrapolation.CLAMP
          );

          return {
            width,
            opacity,
          };
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: color || "#4CAF50" },
              animatedDotStyle,
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
});

export default Paginator;

