import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useSharedValue } from "react-native-reanimated";
import { View } from "../Themed";
import TimelineCanva from "./TimelineCanva";
import TimelineEvent from "./TimelineEvent";
import { useTimeline } from "./useTimeline";

import {
  BibleTimelineEvent,
  ShallowTimelineSection,
  TimelineEvent as TimelineEventProps,
  TimelinePeriod,
} from "@/types";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import CurrentSectionImage from "./CurrentSectionImage";
import CurrentYear from "./CurrentYear";
import Line from "./Line";
import NextSectionImage from "./NextSectionImage";
import PrevSectionImage from "./PrevSectionImage";
import TimelineFooter from "./TimelineFooter";

import bibleTimelineEvents from "@/constants/bibleTimelineEvents";
import { useMyTheme } from "@/context/ThemeContext";
import BottomModal from "../BottomModal";
import BiblicalEventDetail from "./EventDetail";

interface Props extends TimelinePeriod {
  onPrev: () => void;
  onNext: () => void;
  isCurrent: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  entrance: 0 | 1;
  prevEvent: ShallowTimelineSection;
  nextEvent: ShallowTimelineSection;
}

const Timeline = ({
  events,
  startYear,
  endYear,
  interval,
  id,
  image,
  description,
  title,
  sectionTitle,
  subTitle,
  color,
  onPrev,
  onNext,
  isCurrent,
  isFirst,
  isLast,
  entrance,
  prevEvent,
  nextEvent,
}: Props) => {
  const { theme } = useMyTheme();
  const isReady = useSharedValue(0);
  const eventModalRef = React.useRef<BottomSheet>(null);

  const [bibleEvent, setBibleEvent] =
    React.useState<Partial<TimelineEventProps> | null>(null);

  const bibleTimelineEvent = useMemo(() => {
    console.log({ bibleEvent });
    const id = bibleEvent?.id || 0;
    return (
      bibleTimelineEvents.find(
        (currentBibleEvent) => +currentBibleEvent.id === id
      ) || ({} as BibleTimelineEvent)
    );
  }, [bibleEvent]);

  const { x, y, lineX, year, width, height, yearsToPx, calculateEventWidth } =
    useTimeline({
      startYear,
      endYear,
      interval,
    });

  const bibleEventBottomSheetRef = useRef<BottomSheetModal>(null);

  const openBibleEventBottomSheet = useCallback(() => {
    bibleEventBottomSheetRef.current?.present();
  }, []);

  if (!isCurrent) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: title || "" }} />

      {!isFirst && <PrevSectionImage x={x} prevEvent={prevEvent} />}
      {!isLast && (
        <NextSectionImage x={x} width={width} nextEvent={nextEvent} />
      )}
      <CurrentSectionImage
        isReady={isReady}
        currentEvent={{
          id,
          image,
          color,
          description,
          title,
          sectionTitle,
          subTitle,
          startYear,
          endYear,
          interval,
        }}
      />
      <TimelineCanva
        x={x}
        y={y}
        width={width}
        height={height}
        onPrev={onPrev}
        onNext={onNext}
        isFirst={isFirst}
        isLast={isLast}
        isReady={isReady}
        entrance={entrance}
      >
        <View style={{ width, height }}>
          <View
            style={{
              position: "relative",
              width,
              height,
              backgroundColor: theme.colors.text + 19,
              overflow: "hidden",
            }}
          >
            {events.map((event, i) => (
              <TimelineEvent
                color={color}
                x={x}
                key={i}
                yearsToPx={yearsToPx}
                calculateEventWidth={calculateEventWidth}
                eventModalRef={eventModalRef}
                setEvent={setBibleEvent}
                openBibleEventBottomSheet={openBibleEventBottomSheet}
                {...event}
              />
            ))}
          </View>
        </View>
      </TimelineCanva>
      <TimelineFooter
        width={width}
        x={x}
        startYear={startYear}
        endYear={endYear}
        interval={interval}
      />
      <Line lineX={lineX} color={color} />
      <CurrentYear
        year={year}
        x={x}
        width={width}
        lineX={lineX}
        color={color}
        onPrev={onPrev}
        onNext={onNext}
        prevColor={prevEvent?.color}
        nextColor={nextEvent?.color}
      />
      <BottomModal
        justOneSnap
        showIndicator
        justOneValue={["90%"]}
        startAT={0}
        ref={bibleEventBottomSheetRef}
        shouldScroll
      >
        <BiblicalEventDetail bibleTimelineEvent={bibleTimelineEvent} />
      </BottomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    top: 0,
  },
});

export default Timeline;
