import CustomHeaderLeft from "@/components/CustomHeaderLeft";
import ErrorBoundaryFallback from "@/components/ErrorBoundaryFallback";
import BibleChapterProvider from "@/context/BibleChapterContext";
import BibleProvider from "@/context/BibleContext";
import DatabaseProvider from "@/context/databaseContext";
import StorageProvider from "@/context/LocalstoreContext";
import { MemorizationProvider } from "@/context/MemorizationContext";
import MyThemeProvider, { useMyTheme } from "@/context/ThemeContext";
import { settingState$ } from "@/state/settingState";
import { screenAnimations, Screens, ScreensName } from "@/types";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import { ParamListBase, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Stack } from "expo-router";
import * as Updates from "expo-updates";
import React, { memo, ReactNode, useEffect } from "react";
import { ToastAndroid, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import ErrorBoundary from "react-native-error-boundary";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// @ts-ignore
import "../global.css";

import { NetworkProvider } from "@/context/NetworkProvider";
import { NotificationProvider } from "@/context/NotificationContext";
import { useQuickActions } from "@/hooks/useQuickActions";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error, executionInfo }) => {
    console.log("✅ Received a notification in the background!", {
      data,
      error,
      executionInfo,
    });
  }
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

type ScreenOptionsProps = {
  route: RouteProp<ParamListBase, string>;
  navigation: any;
};



// Memoized SafeContentView to prevent unnecessary re-renders
const SafeContentView = memo(({ children }: { children: ReactNode }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useMyTheme();

  return (
    <View
      style={{
        paddingBottom: insets.bottom,
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.background,
      }}
    >
      {children}
    </View>
  );
});
SafeContentView.displayName = 'SafeContentView';

// Consolidated Core Providers - Critical for app startup
const CoreProviders = memo(({ children }: { children: ReactNode }) => (
  <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
    <NetworkProvider>
      <StorageProvider>
        <MyThemeProvider>{children}</MyThemeProvider>
      </StorageProvider>
    </NetworkProvider>
  </ErrorBoundary>
));
CoreProviders.displayName = 'CoreProviders';

// Database and Bible Providers - Can be lazy loaded
const DataProviders = memo(({ children }: { children: ReactNode }) => (
  <DatabaseProvider>
    <BibleProvider>
      <BibleChapterProvider>{children}</BibleChapterProvider>
    </BibleProvider>
  </DatabaseProvider>
));
DataProviders.displayName = 'DataProviders';

// UI and Feature Providers - Non-critical for startup
const FeatureProviders = memo(({ children }: { children: ReactNode }) => (
  <MemorizationProvider>
    <NotificationProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
      </GestureHandlerRootView>
    </NotificationProvider>
  </MemorizationProvider>
));
FeatureProviders.displayName = 'FeatureProviders';

const App = () => {
  const isAnimationDisabled = use$(() =>
    settingState$.isAnimationDisabled.get()
  );

  // Initialize quick actions
  useQuickActions();

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
        ToastAndroid.show("Actualizada ✅", ToastAndroid.SHORT);
      }
    } catch (error) { }
  }

  useEffect(() => {
    onFetchUpdateAsync();
  }, []);

  const screenOptions: (
    props: ScreenOptionsProps
  ) => NativeStackNavigationOptions | any = (props) => {
    return {
      headerTitle: "",
      headerShown: false,
      headerTitleAlign: "center",
      headerTitleStyle: { fontWeight: "bold" },
      animation: isAnimationDisabled
        ? "none"
        : screenAnimations[props.route.name as Screens],
      headerLeft: () => (
        <CustomHeaderLeft title={ScreensName[props.route.name as Screens]} />
      ),
    };
  };

  return (
    <CoreProviders>
      <DataProviders>
        <FeatureProviders>
          <SafeContentView>
            <SystemBars style="auto" />
            <Stack
              initialRouteName="(dashboard)"
              screenOptions={screenOptions}
            />
          </SafeContentView>
          {/* <BookContentModals /> */}
        </FeatureProviders>
      </DataProviders>
    </CoreProviders>
  );
};

export default App;
