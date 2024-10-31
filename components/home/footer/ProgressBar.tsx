import { View } from "components/Themed";
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

interface IProgressBar {
  progress: number;
  color: string;
  barColor: string;
  circleColor?: string;
  height?: number;
  animationDuration?: number;
  hideCircle?: boolean;
}

const ProgressBar = ({
  progress,
  color,
  barColor,
  height = 10,
  circleColor = "black",
  hideCircle,
  animationDuration = 500,
}: IProgressBar) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressWidth = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const circleLeftPosition = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "99%"],
  });

  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", borderRadius: 15 }}
    >
      <View
        style={{
          position: "relative",
          height: height,
          backgroundColor: barColor + "99",
          borderRadius: 15,
          flex: 1,
        }}
      >
        <Animated.View
          style={{
            height: "100%",
            width: progressWidth,
            backgroundColor: color,
            borderRadius: 15,
          }}
        />
        {!hideCircle && (
          <Animated.View
            style={{
              position: "absolute",
              height: 16,
              width: 16,
              backgroundColor: circleColor,
              borderRadius: 50,
              top: -height / 2,
              left: circleLeftPosition,
            }}
          />
        )}
      </View>
    </View>
  );
};

export default ProgressBar;
