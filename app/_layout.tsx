import CustomHeaderLeft from '@/components/CustomHeaderLeft';
import ErrorBoundaryFallback from '@/components/ErrorBoundaryFallback';
import StatusBarBackground from '@/components/StatusBarBackground';
import BibleProvider from '@/context/BibleContext';
import DatabaseProvider from '@/context/databaseContext';
import StorageProvider from '@/context/LocalstoreContext';
import { ModalProvider } from '@/context/modal-context';
import MyThemeProvider from '@/context/ThemeContext';
import useCachedResources from '@/hooks/useCachedResources';
import { Screens, ScreensName } from '@/types';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import React, { useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NativeStackNavigationOptions } from 'react-native-screens/lib/typescript/native-stack/types';
type TScreensName = { [key in Screens]: string };

const screenAnimations: TScreensName = {
  [Screens.Dashboard]: 'none',
  [Screens.Home]: 'slide_from_right',
  [Screens.ChooseBook]: 'slide_from_bottom',
  [Screens.Search]: 'slide_from_right',
  [Screens.ChooseChapterNumber]: 'slide_from_right',
  [Screens.ChooseVerseNumber]: 'none', // You can adjust this if needed
  [Screens.Onboarding]: 'slide_from_bottom',
  [Screens.DownloadManager]: 'slide_from_right',
  [Screens.Settings]: 'slide_from_right',
  [Screens.Favorite]: 'slide_from_right',
  [Screens.DictionarySearch]: 'slide_from_bottom',
  [Screens.StrongSearchEntire]: 'slide_from_bottom',
  [Screens.Notes]: 'slide_from_right',
  [Screens.NoteDetail]: 'slide_from_right',
  [Screens.Character]: 'slide_from_right',
  [Screens.Song]: 'slide_from_right',
  [Screens.Concordance]: 'slide_from_right',
  [Screens.Hymn]: 'slide_from_right',
};

const App = () => {
  const isLoadingComplete = useCachedResources();
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
        ToastAndroid.show('Actualizada ✅', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('🔄', ToastAndroid.SHORT);
    }
  }

  useEffect(() => {
    onFetchUpdateAsync();
  }, []);

  const screenOptions: (props: any) => NativeStackNavigationOptions | any = (
    props
  ) => {
    return {
      headerTitle: '',
      // headerTitle: ScreensName[props.route.name as Screens],
      headerShown: false,
      headerTitleAlign: 'center',
      headerTitleStyle: { fontWeight: 'bold' },
      animation: screenAnimations[props.route.name as Screens],
      headerLeft: () => (
        <CustomHeaderLeft title={ScreensName[props.route.name as Screens]} />
      ),
    };
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
                      <StatusBar animated translucent style='light' />
                      <Stack
                        initialRouteName='(dashboard)'
                        screenOptions={screenOptions}
                      />
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
