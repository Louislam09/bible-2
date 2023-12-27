/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { NavigationContainer } from "@react-navigation/native";
import * as React from "react";
import LinkingConfiguration from "./LinkingConfiguration";
import MainStack from "./MainStack";
import { DarkTheme, LightTheme } from "../constants/themeColors";
import { useCustomTheme } from "../context/ThemeContext";

type TNavigation = {
  // colorScheme: "light" | "dark";
};

export default function Navigation() {
  const { theme: colorScheme } = useCustomTheme();
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
}
