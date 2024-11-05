import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import ErrorBoundaryFallback from "components/ErrorBoundaryFallback";
import { View } from "components/Themed";
import BibleProvider from "context/BibleContext";
import DatabaseProvider from "context/databaseContext";
import StorageProvider from "context/LocalstoreContext";
import { ModalProvider } from "context/modal-context";
import ThemeProvider from "context/ThemeContext";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import useCachedResources from "hooks/useCachedResources";
import React, { useEffect } from "react";
import { ToastAndroid } from "react-native";
import ErrorBoundary from "react-native-error-boundary";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const StatusBarBackground = ({ children }: any) => {
    const styling = {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        // backgroundColor: 'salmon',
    };
    return <View style={[styling, { width: "100%" }]}>{children}</View>;
};

const MyStack = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
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
            <StatusBarBackground>
                <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                    <StorageProvider>
                        <DatabaseProvider>
                            <BibleProvider>
                                <ThemeProvider>
                                    <GestureHandlerRootView style={{ flex: 1 }}>
                                        <BottomSheetModalProvider>
                                            <ModalProvider>
                                                {/* <StatusBar barStyle="light-content" animated /> */}
                                                <StatusBar animated translucent style="inverted" />
                                                <MyStack />
                                            </ModalProvider>
                                        </BottomSheetModalProvider>
                                    </GestureHandlerRootView>
                                </ThemeProvider>
                            </BibleProvider>
                        </DatabaseProvider>
                    </StorageProvider>
                </ErrorBoundary>
            </StatusBarBackground>
        );
    }
};

export default App;
