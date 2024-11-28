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
import { NativeStackNavigationOptions } from "node_modules/react-native-screens/lib/typescript/native-stack/types";
import React, { useEffect } from "react";
import { ToastAndroid } from "react-native";
import ErrorBoundary from "react-native-error-boundary";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Screens, ScreensName } from "types";

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


    const screenOptions: (props: any) => NativeStackNavigationOptions | any = (props) => {
        return ({
            headerTitle: ScreensName[props.route.name as Screens],
            headerShown: false,
            headerTitleAlign: "center",
            headerTitleStyle: { fontWeight: "bold" },
        })
    };

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
                                            <Stack screenOptions={screenOptions} />
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
