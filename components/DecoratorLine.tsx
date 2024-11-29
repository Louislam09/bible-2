import React from "react";
import { View } from "./Themed";
import { TTheme } from "@/types";

type DecoratorLineProps = {
  theme: TTheme;
  color?: string;
};

const DecoratorLine = ({ theme, color }: DecoratorLineProps) => {
  return (
    <View
      style={{
        width: 5,
        backgroundColor: color || theme.colors.notification,
        paddingVertical: 10,
      }}
    />
  );
};

export default DecoratorLine;
