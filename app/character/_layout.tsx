import { Slot, Stack } from 'expo-router';
import React from 'react';

const SearchLayout = () => {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
        }}
      />
      <Slot />
    </>
  );
};

export default SearchLayout;
