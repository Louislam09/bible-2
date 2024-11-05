/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { NavigationContainer } from "@react-navigation/native";
import { useBibleContext } from "context/BibleContext";
import * as React from "react";
import getThemes from "../constants/themeColors";
import { useCustomTheme } from "../context/ThemeContext";
import LinkingConfiguration from "./LinkingConfiguration";
import MainStack from "./MainStack";

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
