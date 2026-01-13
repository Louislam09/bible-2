import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { useMyTheme } from "@/context/ThemeContext";
import { useHaptics } from "@/hooks/useHaptics";
import { Slot, Stack } from "expo-router";
import React from "react";

const SearchLayout = () => {
  const { theme } = useMyTheme();
  const haptics = useHaptics();
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
              disabled: true,
              style: { opacity: 0 },
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
