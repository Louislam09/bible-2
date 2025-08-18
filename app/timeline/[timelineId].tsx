import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import DisplayTimeline from "@/components/timeline/DisplayTimeline";
import { useMyTheme } from "@/context/ThemeContext";
import useParams from "@/hooks/useParams";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

const SingleTimeline = () => {
  const { timelineId } = useParams();
  const { theme } = useMyTheme();
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Linea de tiempo",
            titleIcon: "CalendarRange",
            titleIconColor: "#6de5cb",
            goBack: () => router.navigate("/timeline"),
            headerRightProps: {
              headerRightIcon: "Check",
              headerRightIconColor: theme.colors.text,
              onPress: () => console.log(),
              disabled: true,
              style: { opacity: 0 },
            },
          }),
        }}
      />
      <DisplayTimeline startingSection={timelineId} />
    </>
  );
};

export default SingleTimeline;

const styles = StyleSheet.create({
  headerActions: {
    display: "flex",
    flexDirection: "row",
    gap: 30,
    backgroundColor: "transparent",
  },
});
