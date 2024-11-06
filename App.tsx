import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import ErrorBoundaryFallback from "components/ErrorBoundaryFallback";
import StorageProvider from "context/LocalstoreContext";
import { ModalProvider } from "context/modal-context";
import * as Updates from "expo-updates";
import React, { useEffect } from "react";
import { StatusBar, ToastAndroid } from "react-native";
import ErrorBoundary from "react-native-error-boundary";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BibleProvider from "./context/BibleContext";
import MyThemeProvider from "./context/ThemeContext";
import DatabaseProvider from "./context/databaseContext";
import useCachedResources from "./hooks/useCachedResources";
import Navigation from "./navigation";

const App = () => {
  const isLoadingComplete = useCachedResources();
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
        ToastAndroid.show("Actualizada ✅", ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show("🔄", ToastAndroid.SHORT);
    }
  }

  useEffect(() => {
    onFetchUpdateAsync();
  }, []);

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
        <MyThemeProvider>
          <StorageProvider>
            <DatabaseProvider>
              <BibleProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <BottomSheetModalProvider>
                    <ModalProvider>
                      <StatusBar barStyle="light-content" animated />
                      <Navigation />
                    </ModalProvider>
                  </BottomSheetModalProvider>
                </GestureHandlerRootView>
              </BibleProvider>
            </DatabaseProvider>
          </StorageProvider>
        </MyThemeProvider>
      </ErrorBoundary>
    );
  }
};

export default App;
