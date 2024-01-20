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
import ErrorBoundary from "components/ErrorBoundary";

const App = () => {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <StorageProvider>
            <DatabaseProvider>
              <BibleProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <BottomSheetModalProvider>
                    <StatusBar barStyle="light-content" animated />
                    <Navigation />
                  </BottomSheetModalProvider>
                </GestureHandlerRootView>
              </BibleProvider>
            </DatabaseProvider>
          </StorageProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }
};

export default App;
