import "react-native-gesture-handler";
// import { StatusBar } from 'expo-status-bar';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import React, { useEffect } from "react";
import { StatusBar, ToastAndroid } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BibleProvider from "./context/BibleContext";
import ThemeProvider from "./context/ThemeContext";
import DatabaseProvider from "./context/databaseContext";
import useCachedResources from "./hooks/useCachedResources";
import Navigation from "./navigation";
import StorageProvider from "context/LocalstoreContext";
import ErrorBoundary from "components/ErrorBoundary";
import * as Updates from "expo-updates";

const App = () => {
  const isLoadingComplete = useCachedResources();
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      // You can also add an alert() to see the error message in case of an error when fetching updates.
      ToastAndroid.show("Error fetching latest update", ToastAndroid.SHORT);
      // alert(`Error fetching latest Expo update: ${error}`);
    }
  }

  useEffect(() => {
    onFetchUpdateAsync();
  }, []);

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
