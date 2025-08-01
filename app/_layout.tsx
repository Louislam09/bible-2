import CustomHeaderLeft from "@/components/CustomHeaderLeft";
import ErrorBoundaryFallback from "@/components/ErrorBoundaryFallback";
import BibleChapterProvider from "@/context/BibleChapterContext";
import BibleProvider from "@/context/BibleContext";
import DatabaseProvider from "@/context/databaseContext";
import StorageProvider from "@/context/LocalstoreContext";
import { MemorizationProvider } from "@/context/MemorizationContext";
import MyThemeProvider from "@/context/ThemeContext";
import useCachedResources from "@/hooks/useCachedResources";
import { QueryProvider } from "@/providers/QueryProvider";
import { settingState$ } from "@/state/settingState";
import { Screens, ScreensName } from "@/types";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import { ParamListBase, RouteProp } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import React, { useEffect } from "react";
import { ToastAndroid } from "react-native";
import ErrorBoundary from "react-native-error-boundary";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StackAnimationTypes } from "react-native-screens";
import { NativeStackNavigationOptions } from "react-native-screens/lib/typescript/native-stack/types";

import { NotificationProvider } from "@/context/NotificationContext";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  ({ data, error, executionInfo }) => {
    console.log("✅ Received a notification in the background!", {
      data,
      error,
      executionInfo,
    });
    // Do something with the notification data
  }
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

type ScreenOptionsProps = {
  route: RouteProp<ParamListBase, string>;
  navigation: any;
};

type TScreensName = { [key in Screens]: StackAnimationTypes };

const screenAnimations: TScreensName = {
  [Screens.Dashboard]: "none",
  [Screens.Home]: "slide_from_right",
  [Screens.ChooseBook]: "slide_from_bottom",
  [Screens.Search]: "slide_from_right",
  [Screens.ChooseChapterNumber]: "slide_from_right",
  [Screens.ChooseVerseNumber]: "none", // You can adjust this if needed
  [Screens.Onboarding]: "slide_from_bottom",
  [Screens.DownloadManager]: "slide_from_right",
  [Screens.Settings]: "slide_from_right",
  [Screens.Favorite]: "slide_from_right",
  [Screens.DictionarySearch]: "slide_from_bottom",
  [Screens.StrongSearchEntire]: "slide_from_bottom",
  [Screens.Notes]: "slide_from_right",
  [Screens.NoteDetail]: "slide_from_right",
  [Screens.Character]: "slide_from_right",
  [Screens.Song]: "slide_from_right",
  [Screens.Concordance]: "slide_from_right",
  [Screens.Hymn]: "slide_from_right",
  [Screens.Game]: "slide_from_right",
  [Screens.ChooseGame]: "slide_from_right",
  [Screens.MemorizeVerse]: "slide_from_bottom",
  [Screens.VerseId]: "slide_from_bottom",
  [Screens.ChallengeTypeId]: "slide_from_left",
  [Screens.History]: "slide_from_bottom",
  [Screens.Timeline]: "slide_from_bottom",
  [Screens.Admin]: "slide_from_bottom",
  [Screens.TimelineId]: "slide_from_bottom",
  [Screens.Login]: "slide_from_right",
  [Screens.Register]: "slide_from_right",
  [Screens.Quote]: "slide_from_right",
  [Screens.AISetup]: "slide_from_right",
  [Screens.AISearch]: "slide_from_right",
  [Screens.Notification]: "slide_from_right",
};

const App = () => {
  const isLoadingComplete = useCachedResources();
  const isAnimationDisabled = use$(() =>
    settingState$.isAnimationDisabled.get()
  );

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
        ToastAndroid.show("Actualizada ✅", ToastAndroid.SHORT);
      }
    } catch (error) {}
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
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <StorageProvider>
        <DatabaseProvider>
          <BibleProvider>
            <BibleChapterProvider>
              <MemorizationProvider>
                <NotificationProvider>
                  <MyThemeProvider>
                    <QueryProvider>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <BottomSheetModalProvider>
                          <StatusBar animated translucent style="auto" />
                          <Stack
                            initialRouteName="(dashboard)"
                            screenOptions={screenOptions}
                          />
                        </BottomSheetModalProvider>
                      </GestureHandlerRootView>
                    </QueryProvider>
                  </MyThemeProvider>
                </NotificationProvider>
              </MemorizationProvider>
            </BibleChapterProvider>
          </BibleProvider>
        </DatabaseProvider>
      </StorageProvider>
    </ErrorBoundary>
  );
};

export default App;
