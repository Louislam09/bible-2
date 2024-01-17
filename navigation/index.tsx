/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { NavigationContainer } from "@react-navigation/native";
import * as React from "react";
import LinkingConfiguration from "./LinkingConfiguration";
import MainStack from "./MainStack";
import getThemes from "../constants/themeColors";
import { useCustomTheme } from "../context/ThemeContext";
import { EThemes } from "types";
import { useBibleContext } from "context/BibleContext";

const Navigation = () => {
  const { currentTheme } = useBibleContext();

  const { theme: colorScheme } = useCustomTheme();
  const themes = getThemes();
  const { DarkTheme, LightTheme } = themes[currentTheme];
  const theme = {
    dark: DarkTheme,
    light: LightTheme,
  };

  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={theme[colorScheme]}
    >
      <MainStack />
    </NavigationContainer>
  );
};

export default Navigation;
