import { DarkTheme, LightTheme } from "./themeColors";

const tintColorLight = LightTheme.colors.primary;
const tintColorDark = DarkTheme.colors.text;

export default {
  light: {
    text: LightTheme.colors.text,
    background: LightTheme.colors.background,
    tint: tintColorLight,
    tabIconDefault: LightTheme.colors.border,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: DarkTheme.colors.text,
    background: DarkTheme.colors.background,
    tint: tintColorDark,
    tabIconDefault: DarkTheme.colors.border,
    tabIconSelected: tintColorLight,
  },
  mainColor: "red",
};
