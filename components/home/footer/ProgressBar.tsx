import { Text, View } from "components/Themed";
import React from "react";

interface IProgressBar {
  progress: number;
  color: string;
  barColor: string;
  circleColor?: string;
  height?: number;
}

const ProgressBar = ({
  progress,
  color,
  barColor,
  height = 10,
  circleColor = "black",
}: IProgressBar) => {
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
        <View
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            backgroundColor: color,
            borderRadius: 15,
          }}
        />
        <View
          style={{
            position: "absolute",
            height: 16,
            width: 16,
            backgroundColor: circleColor,
            borderRadius: 50,
            // left: 10,
            top: -height / 2,
            left: `${(progress - 0.01) * 100}%`,
          }}
        />
      </View>
      {/* <Text>{Math.floor(progress * 100)}%</Text> */}
    </View>
  );
};

export default ProgressBar;
