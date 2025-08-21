import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { useMyTheme } from "@/context/ThemeContext";
import { modalState$ } from "@/state/modalState";
import { Slot, Stack } from "expo-router";
import React from "react";
import { Keyboard } from "react-native";

const SearchLayout = () => {
  const { theme } = useMyTheme();
  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Buscador",
            titleIcon: "Search",
            headerRightProps: {
              headerRightIcon: "ListFilter",
              headerRightIconColor: theme.colors.text,
              onPress: () => {
                modalState$.openSearchFilterBottomSheet();
                if (Keyboard.isVisible()) {
                  Keyboard.dismiss();
                }
              },
              disabled: false,
              style: { opacity: 1 },
            },
          }),
        }}
      />
      <ScreenWithAnimation duration={800} icon="Search" title="Buscador">
        <Slot />
      </ScreenWithAnimation>
    </>
  );
};

export default SearchLayout;
