import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { useMyTheme } from "@/context/ThemeContext";
import { Slot, Stack } from "expo-router";
import React from "react";

const SearchLayout = () => {
  const { theme } = useMyTheme();

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "",
            titleIcon: "Users",
            titleIconColor: theme.dark ? "#cec8ff" : theme.colors.notification,
            headerRightProps: {
              headerRightIcon: "Trash2",
              headerRightIconColor: "red",
              onPress: () => console.log(),
              disabled: true,
              style: { opacity: 0 },
            },
          }),
        }}
      />
      <ScreenWithAnimation duration={800} icon="User" title="Personajes Biblicos">
        <Slot />
      </ScreenWithAnimation>
    </>
  );
};

export default SearchLayout;
