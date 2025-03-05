import { StyleSheet } from "react-native";
import React from "react";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Text, View } from "@/components/Themed";

const timeline = () => {
  const theme = useTheme();
  return (
    <ScreenWithAnimation
      duration={800}
      speed={1}
      title="Linea de tiempo"
      icon="CalendarRange"
    >
      <View>
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
        <Text>timeline</Text>
      </View>
    </ScreenWithAnimation>
  );
};

export default timeline;

const styles = StyleSheet.create({});
