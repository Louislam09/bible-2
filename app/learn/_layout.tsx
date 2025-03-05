import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import StatusBarBackground from "@/components/StatusBarBackground";
import { Slot, Stack } from "expo-router";
import React from "react";
import { useTheme } from "@react-navigation/native";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";

const LearnLayout = () => {
  const theme = useTheme();

  return (
    <ScreenWithAnimation title="DuoBible" icon="Gamepad2" iconColor={"#4caf50"}>
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
      <Slot />
    </ScreenWithAnimation>
  );
};

export default LearnLayout;
