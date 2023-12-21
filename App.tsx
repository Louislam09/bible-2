import 'react-native-gesture-handler';
// import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

import { StatusBar } from 'react-native';
import { DatabaseProvider } from './context/databaseContext';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <DatabaseProvider>
        <StatusBar barStyle='light-content' animated />
        <Navigation colorScheme={colorScheme} />
      </DatabaseProvider>
    );
  }
}

