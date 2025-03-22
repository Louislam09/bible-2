import React from "react";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";

import BottomSheet from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { View, Text } from "../Themed";
import { calculateLabel, offset, rowToPx } from "./timelineConstants";
import { TimelineEvent as TimelineEventType, TTheme } from "@/types";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";

interface Props extends TimelineEventType {
  color: string;
  x: SharedValue<number>;
  yearsToPx: (years: number) => number;
  eventModalRef: React.RefObject<BottomSheet>;
  openBibleEventBottomSheet: () => void;
  setEvent: (event: Partial<TimelineEventType>) => void;
  calculateEventWidth: (
    yearStart: number,
    yearEnd: number,
    isFixed?: boolean
  ) => number;
}

const descSize = 140;
const imageSize = 60;

const TimelineEvent = ({
  slug,
  row,
  title,
  start,
  image,
  end,
  type,
  isFixed,
  x,
  color,
  id,
  yearsToPx,
  calculateEventWidth,
  openBibleEventBottomSheet,
  eventModalRef,
  setEvent,
}: Props) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { current: top } = React.useRef(rowToPx(row));
  const { current: left } = React.useRef(yearsToPx(start));
  const { current: width } = React.useRef(
    calculateEventWidth(start, end, isFixed)
  );

  const label = calculateLabel(start, end);

  const onOpenEvent = () => {
    setEvent({ slug, title, image, start, end, id });
    openBibleEventBottomSheet();
    // eventModalRef.current?.expand()
    // setEvent({ slug, title, titleEn, image, start, end })
  };

  const posX = useDerivedValue(() => {
    return interpolate(
      x.value * -1,
      [left + offset, left + width + offset - descSize - imageSize],
      [0, width - descSize - imageSize],
      Extrapolation.CLAMP
    );
  });

  const stylez = useAnimatedStyle(() => ({
    transform: [{ translateX: posX.value }],
  }));

  if (type === "minor") {
    return (
      <TouchableOpacity
        onPress={onOpenEvent}
        style={[styles.minorContainer, { left: left + offset, top: top }]}
      >
        <View
          style={{
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            backgroundColor: color,
            paddingHorizontal: 10,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 10 }} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: theme.colors.text + 50,
            paddingHorizontal: 10,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 8, color: "#fff" }}>{label}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onOpenEvent}
      style={[
        styles.container,
        { left: left + offset, top: top, width: width },
      ]}
    >
      <Animated.View style={[styles.titleContainer, stylez]}>
        <Text
          style={{
            color: theme.dark ? "#fff" : "#000",
            fontSize: 12,
            fontWeight: "bold",
          }}
          numberOfLines={2}
        >
          {title}
        </Text>
        <View
          style={{ borderBottomWidth: 1, borderColor: theme.colors.text + 99 }}
        />
        <Text style={{ color: theme.dark ? "#fff" : "#000", fontSize: 10 }}>
          {label}
        </Text>
      </Animated.View>

      <View style={styles.imageContainer}>
        <Image
          style={{ width: imageSize, height: "100%" }}
          source={{ uri: image }}
        />
      </View>
    </TouchableOpacity>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      flexDirection: "row",
      height: 60,
      backgroundColor: colors.text + 40,
      borderRadius: 20,
    },
    minorContainer: {
      position: "absolute",
      flexDirection: "row",
      height: 25,
      backgroundColor: colors.text + 50,
      borderRadius: 20,
      overflow: "hidden",
    },
    titleContainer: {
      height: 60,
      position: "relative",
      paddingHorizontal: 10,
      justifyContent: "space-around",
      paddingVertical: 6,
      width: descSize,
    },
    imageContainer: {
      marginLeft: "auto",
      width: imageSize,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      overflow: "hidden",
    },
  });

export default TimelineEvent;
