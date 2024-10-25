import { Text as DefaultText, View as DefaultView } from "react-native";

import { useBibleContext } from "../context/BibleContext";
import { useTheme } from "@react-navigation/native";
import { TTheme } from "types";

export const NativeDefaultView = require('react-native/Libraries/Components/View/ViewNativeComponent').default;

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const { colors } = useTheme() as TTheme;
  const { selectedFont } = useBibleContext();
  return (
    <DefaultText
      style={[
        {
          color: colors?.text || "black",
          fontFamily: selectedFont,
          fontWeight: "100",
        },
        style,
      ]}
      {...otherProps}
    />
  );
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const { colors } = useTheme() as TTheme;

  return (
    <NativeDefaultView
      style={[{ backgroundColor: colors.background }, style]}
      {...otherProps}
    />
  );
}
