import SearchHeader from '@/components/search/SearchHeader';
import StatusBarBackground from '@/components/StatusBarBackground';
import { Slot, Stack } from 'expo-router';
import React from 'react';

const SearchLayout = () => {
  const screenOptions = { headerShown: true, animation: 'slide_from_left' };
  return (
    <StatusBarBackground>
      <Stack.Screen
        options={{
          headerShown: false,
          headerTitle: '',
          animation: 'slide_from_left',
        }}
      />
      <SearchHeader />
      <Slot />
    </StatusBarBackground>
  );
};

export default SearchLayout;
