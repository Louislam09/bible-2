import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import { useTheme } from "@react-navigation/native";
import { Slot, Stack } from "expo-router";
import React from "react";

const SearchLayout = () => {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Personajes Biblicos",
            titleIcon: "User",
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
      <Slot />
    </>
  );
};

export default SearchLayout;
