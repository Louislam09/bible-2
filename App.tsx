import "react-native-gesture-handler";
// import { StatusBar } from 'expo-status-bar';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import React from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BibleProvider from "./context/BibleContext";
import ThemeProvider from "./context/ThemeContext";
import DatabaseProvider from "./context/databaseContext";
import useCachedResources from "./hooks/useCachedResources";
import Navigation from "./navigation";
import StorageProvider from "context/LocalstoreContext";

const App = () => {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ThemeProvider>
        <DatabaseProvider>
          <StorageProvider>
            <BibleProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                  <StatusBar barStyle="light-content" animated />
                  <Navigation />
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </BibleProvider>
          </StorageProvider>
        </DatabaseProvider>
      </ThemeProvider>
    );
  }
};

export default App;
