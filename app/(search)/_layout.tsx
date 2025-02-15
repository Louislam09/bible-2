import ScreenWithAnimation from "@/components/LottieTransitionScreen";
import SearchHeader from "@/components/search/SearchHeader";
import StatusBarBackground from "@/components/StatusBarBackground";
import { Slot, Stack } from "expo-router";
import React from "react";

const SearchLayout = () => {
  return (
    <StatusBarBackground>
      <ScreenWithAnimation icon="Search" title="Buscador">
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
