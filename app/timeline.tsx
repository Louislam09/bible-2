import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import TimelineList from "@/components/timeline/TimelineList";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

const timeline = () => {
  const theme = useTheme();

  return (
    <ScreenWithAnimation
      duration={800}
      speed={1}
      title="Linea de tiempo"
      icon="CalendarRange"
    >
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Linea de tiempo",
            titleIcon: "CalendarRange",
            titleIconColor: "#6de5cb",
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
      <TimelineList />
    </ScreenWithAnimation>
  );
};

export default timeline;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  list: {
    flex: 1,
    marginTop: 20,
  },
});
