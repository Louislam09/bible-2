import { TimelineEvent, TimelinePeriod, TTheme } from "@/types";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Image, StyleSheet } from "react-native";
import { Text, View } from "../Themed";
import EventTime from "./EventTime";

type MyTimelineProps = {
  data: TimelinePeriod;
};

const MyTimeline = ({ data }: MyTimelineProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const events = data.events;

  const renderDetail = (rowData: TimelineEvent, sectionID: any, rowID: any) => {
    const yearSpan = +rowData.end - +rowData.start;
    const timeLabel =
      yearSpan > 0
        ? `${Math.abs(rowData.start)} - ${Math.abs(
            rowData.end
          )} (${yearSpan} años)`
        : `${Math.abs(rowData.start)} (${yearSpan} años)`;
    return (
      <View style={styles.detailContainer}>
        <Text style={[styles.title, { color: theme.colors.notification }]}>
          {rowData.title}
        </Text>

        {rowData.image && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: rowData.image }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        <View key={`event-${rowData.id || rowID}`} style={styles.eventItem}>
          <Text style={styles.eventText}>{timeLabel}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <EventTime data={events} />
      {/* <BiblicalTimeline data={events} /> */}
    </View>
  );
  // return (
  //   <View
  //     style={[styles.container, { backgroundColor: theme.colors.background }]}
  //   >
  //     <Timeline
  //       columnFormat="two-column"
  //       style={styles.list}
  //       data={events}
  //       circleColor={theme.colors.notification}
  //       innerCircle={"icon"}
  //       lineColor={theme.colors.text}
  //       iconDefault={
  //         <Icon
  //           name="Diamond"
  //           size={30}
  //           fillColor={theme.colors.text}
  //           color={theme.colors.text}
  //         />
  //       }
  //       titleStyle={{
  //         color: theme.colors.notification,
  //         display: "none",
  //       }}
  //       timeContainerStyle={{ minWidth: 52, marginTop: 0 }}
  //       timeStyle={{
  //         textAlign: "center",
  //         backgroundColor: theme.colors.notification,
  //         color: theme.colors.background,
  //         borderRadius: 13,
  //         padding: 5,
  //         fontWeight: "600",
  //       }}
  //       descriptionStyle={{ display: "none" }}
  //       onEventPress={(props) => console.log(props)}
  //       renderDetail={renderDetail}
  //       separatorStyle={{
  //         backgroundColor: theme.colors.border,
  //         //   marginVertical: 8,
  //       }}
  //     />
  //   </View>
  // );
};

export default MyTimeline;

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 10,
      marginTop: 10,
    },
    list: {
      flex: 1,
      marginTop: 20,
    },
    detailContainer: {
      flex: 1,
      padding: 10,
      borderRadius: 8,
      backgroundColor: colors.text + 20,
      marginVertical: 5,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      lineHeight: 20,
    },
    imageContainer: {
      marginVertical: 8,
      borderRadius: 6,
      overflow: "hidden",
    },
    image: {
      height: 120,
      backgroundColor: colors.text + 10,
    },
    eventsContainer: {
      marginTop: 12,
      marginBottom: 8,
    },
    eventsLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    eventItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      backgroundColor: "transparent",
    },
    eventText: {
      fontSize: 13,
      color: colors.text,
      opacity: 0.9,
      flex: 1,
    },
  });
