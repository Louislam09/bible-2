import "react-native-gesture-handler";
// import { StatusBar } from 'expo-status-bar';
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";

import { StatusBar } from "react-native";
import { DatabaseProvider } from "./context/databaseContext";
import { Text } from "./components/Themed";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ThemeProvider>
        <DatabaseProvider>
          <StatusBar barStyle="light-content" animated />
          <Navigation />
        </DatabaseProvider>
      </ThemeProvider>
    );
  }
}
