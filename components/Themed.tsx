/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from "react-native";

// import Colors from "../constants/Colors";
// import useColorScheme from "../hooks/useColorScheme";
import { useBibleContext } from "../context/BibleContext";
import { useTheme } from "@react-navigation/native";
import { TTheme } from "types";

// export function useThemeColor(
//   props: { light?: string; dark?: string },
//   colorName: keyof typeof Colors.light & keyof typeof Colors.dark
// ) {
//   const theme = useColorScheme();
//   const colorFromProps = props[theme];

//   if (colorFromProps) {
//     return colorFromProps;
//   } else {
//     return Colors[theme][colorName];
//   }
// }

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  // const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
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
  // const backgroundColor = useThemeColor(
  //   { light: lightColor, dark: darkColor },
  //   "background"
  // );

  return (
    <DefaultView
      style={[{ backgroundColor: colors.background }, style]}
      {...otherProps}
    />
  );
}
