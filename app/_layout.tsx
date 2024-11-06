import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import ErrorBoundaryFallback from "components/ErrorBoundaryFallback";
import BibleProvider from "context/BibleContext";
import DatabaseProvider from "context/databaseContext";
import StorageProvider from "context/LocalstoreContext";
import { ModalProvider } from "context/modal-context";
import MyThemeProvider from "context/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import useCachedResources from "hooks/useCachedResources";
import React, { useEffect } from "react";
import { ToastAndroid } from "react-native";
import ErrorBoundary from "react-native-error-boundary";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const MyStack = () => {
    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen options={{ headerShown: false }} name="(dashboard)" />
            <Stack.Screen options={{ headerShown: false }} name="home" />
            <Stack.Screen options={{ headerShown: false }} name="settings" />
        </Stack>
    )
}

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
                <StorageProvider>
                    <DatabaseProvider>
                        <BibleProvider>
                            <MyThemeProvider>
                                <GestureHandlerRootView style={{ flex: 1 }}>
                                    <BottomSheetModalProvider>
                                        <ModalProvider>
                                            <StatusBar animated translucent style="inverted" />
                                            <MyStack />
                                        </ModalProvider>
                                    </BottomSheetModalProvider>
                                </GestureHandlerRootView>
                            </MyThemeProvider>
                        </BibleProvider>
                    </DatabaseProvider>
                </StorageProvider>
            </ErrorBoundary>
        );
    }
};

export default App;
