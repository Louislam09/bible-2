import CustomHeaderLeft from "@/components/CustomHeaderLeft";
import Icon from "@/components/Icon";
import SongViewer from "@/components/song-viewer";
import { View } from "@/components/Themed";
import AlegreSongs from "@/constants/songs";
import hymnSong from "@/constants/hymnSong";
import { storedData$, useStorage } from "@/context/LocalstoreContext";
import useParams from "@/hooks/useParams";
import { TimelinePeriod, TSongItem } from "@/types";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import timelineEvents from "@/constants/events";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import MyTimeline from "@/components/timeline/MyTimeline";

const SingleTimeline = () => {
  const { timelineId } = useParams();
  const theme = useTheme();
  const selected = timelineEvents.find(
    (item) => +item.id === timelineId
  ) as TimelinePeriod;

  return (
    <>
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
      <MyTimeline data={selected || {}} />
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
