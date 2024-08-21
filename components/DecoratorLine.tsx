import React from "react";
import { View } from "./Themed";
import { TTheme } from "types";

type DecoratorLineProps = {
  theme: TTheme;
};

const DecoratorLine = ({ theme }: DecoratorLineProps) => {
  return (
    <View
      style={{
        width: 5,
        backgroundColor: theme.colors.notification,
        paddingVertical: 10,
      }}
    />
  );
};

export default DecoratorLine;
