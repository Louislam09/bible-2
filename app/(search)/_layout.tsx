import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import SearchHeader from "@/components/search/SearchHeader";
import StatusBarBackground from "@/components/StatusBarBackground";
import { Slot, Stack } from "expo-router";
import React from "react";

const SearchLayout = () => {
  return (
    <StatusBarBackground>
      <ScreenWithAnimation duration={800} icon="Search" title="Buscador">
        <Stack.Screen
          options={{
            headerShown: false,
            headerTitle: "",
          }}
        />
        <SearchHeader />
        <Slot />
      </ScreenWithAnimation>
    </StatusBarBackground>
  );
};

export default SearchLayout;
