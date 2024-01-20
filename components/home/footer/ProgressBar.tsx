import { Text, View } from "components/Themed";
import React from "react";

interface IProgressBar {
  progress: number;
  color: string;
  barColor: string;
}

const ProgressBar = ({ progress, color, barColor }: IProgressBar) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View
        style={{
          height: 10,
          backgroundColor: barColor,
          borderRadius: 5,
          flex: 1,
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            backgroundColor: color,
            borderRadius: 5,
          }}
        />
      </View>
      {/* <Text>{Math.floor(progress * 100)}%</Text> */}
    </View>
  );
};

export default ProgressBar;
