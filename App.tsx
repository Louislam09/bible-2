import "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import StorageProvider from "context/LocalstoreContext";
import React, { useEffect, useState } from "react";
import { StatusBar, ToastAndroid } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BibleProvider from "./context/BibleContext";
import ThemeProvider from "./context/ThemeContext";
import DatabaseProvider from "./context/databaseContext";
import useCachedResources from "./hooks/useCachedResources";
import Navigation from "./navigation";
import ErrorBoundaryFallback from "components/ErrorBoundaryFallback";
import * as Updates from "expo-updates";
import ErrorBoundary from "react-native-error-boundary";
import { ModalProvider } from "context/modal-context";
import SplashPage from "components/SplashPage";

const App = () => {
  const isLoadingComplete = useCachedResources();
  const [hideSplash, setHideSplash] = useState(false)

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

  const onAnimationFinish = (isCancelled: Boolean) => {
    console.log('onAnimationFinish', isCancelled)
    if (!isCancelled) setHideSplash(true)
  }

  if (!isLoadingComplete || !hideSplash) return <SplashPage onAnimationFinish={onAnimationFinish} />

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
        <ThemeProvider>
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
        </ThemeProvider>
      </ErrorBoundary>
    );
  }
};

export default App;
