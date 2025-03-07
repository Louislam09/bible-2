import { ScrollView, StyleSheet } from "react-native";
import React from "react";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Text, View } from "@/components/Themed";
import Timeline from "react-native-timeline-flatlist";
import oldTimeline from "@/constants/oldTimeline";
import Icon from "@/components/Icon";
import MyTimeline from "@/components/timeline/MyTimeline";
import TimelineList from "@/components/timeline/TimelineList";

const data = [
  {
    time: "09:00",
    title: "Archery Training",
    description:
      "The Beginner Archery and Beginner Crossbow course does not require you to bring any equipment, since everything you need will be provided for the course. ",
    circleColor: "#009688",
    lineColor: "#009688",
  },
  {
    time: "10:45",
    title: "Play Badminton",
    description:
      "Badminton is a racquet sport played using racquets to hit a shuttlecock across a net.",
  },
  { time: "12:00", title: "Lunch" },
  {
    time: "14:00",
    title: "Watch Soccer",
    description:
      "Team sport played between two teams of eleven players with a spherical ball. ",
    lineColor: "#009688",
  },
  {
    time: "16:30",
    title: "Go to Fitness center",
    description: "Look out for the Best Gym & Fitness Centers around me :)",
    circleColor: "#009688",
  },
];

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

      {/* <MyTimeline /> */}
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
