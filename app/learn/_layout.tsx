import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import StatusBarBackground from "@/components/StatusBarBackground";
import { useMyTheme } from "@/context/ThemeContext";
import { Slot, Stack } from "expo-router";
import React from "react";

const LearnLayout = () => {
  const { theme } = useMyTheme();

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "DuoBible",
            titleIcon: "Gamepad2",
            titleIconColor: "#4caf50",
            headerRightProps: {
              fillColor: "red",
              headerRightIcon: "Heart",
              headerRightIconColor: "red",
              onPress: () => console.log(),
              disabled: false,
              style: { opacity: 1 },
            },
          }),
        }}
      />
      <ScreenWithAnimation title="DuoBible" icon="Gamepad2" iconColor={"#4caf50"}>
        <Slot />
      </ScreenWithAnimation>
    </>
  );
};

export default LearnLayout;
