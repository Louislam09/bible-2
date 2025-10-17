import timelineEvents from "@/constants/events";
import { useMyTheme } from "@/context/ThemeContext";
import { TimelineEvent, TimelinePeriod, TTheme } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
} from "react-native";
import { OptimizedImage } from "@/utils/imageCache";
import Animated, {
  clamp,
  FadeIn,
  FadeOut,
  interpolate,
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Text, View } from "../Themed";

const { width, height } = Dimensions.get("screen");
const _itemSize = width * 0.24;
const _spacing = 12;
const _itemTotalSize = _itemSize + _spacing;

const EventCard = ({
  event,
  period,
  index = 0,
  styles,
}: {
  event: TimelineEvent;
  period: TimelinePeriod;
  index?: number;
  styles: ReturnType<typeof getStyles>;
}) => {
  return (
    <Animated.View
      entering={FadeIn.duration(800)
        .delay(200 + index * 100)
        .withInitialValues({
          opacity: 0,
          transform: [{ translateX: -20 }],
        })}
      exiting={FadeOut.duration(400).withInitialValues({
        opacity: 1,
        transform: [{ translateX: 0 }],
      })}
      style={[styles.card, { borderLeftColor: period.color }]}
    >
      <Text style={styles.sectionTitle}>{period.sectionTitle}</Text>
      <Text style={styles.periodTitle}>{period.title}</Text>
      <Text style={styles.title}>{event.title}</Text>
      <View style={styles.dateContainer}>
        <Text style={styles.date}>
          {Math.abs(event.start)} {event.start < 0 ? "A.C." : "D.C."}
        </Text>
        {event.end !== event.start && (
          <>
            <Text style={styles.date}> - </Text>
            <Text style={styles.date}>
              {Math.abs(event.end)} {event.end < 0 ? "A.C." : "D.C."}
            </Text>
          </>
        )}
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {period.description}
      </Text>
    </Animated.View>
  );
};

const CarouseItem = ({
  imageURI,
  index,
  scrollX,
  activeColor,
  styles,
}: {
  activeColor: string;
  imageURI: string;
  index: number;
  scrollX: SharedValue<number>;
  styles: ReturnType<typeof getStyles>;
}) => {
  const [loading, setLoading] = useState(true);

  const stylez = useAnimatedStyle(() => {
    return {
      borderWidth: 4,
      borderColor: interpolateColor(
        scrollX.value,
        [index - 1, index, index + 1],
        ["transparent", "white", "transparent"]
      ),
      transform: [
        {
          translateY: interpolate(
            scrollX.value,
            [index - 1, index, index + 1],
            [_itemSize / 3, 0, _itemSize / 3]
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: _itemSize,
          height: _itemSize,
          borderRadius: _itemSize / 2,
          zIndex: 13,
        },
        stylez,
      ]}
    >
      <Image
        source={{ uri: imageURI }}
        style={{
          flex: 1,
          borderRadius: _itemSize / 2,
        }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
      {loading && (
        <View style={[StyleSheet.absoluteFillObject, styles.loadingContainer]}>
          <ActivityIndicator color="white" />
        </View>
      )}
    </Animated.View>
  );
};

const CircularSlider = () => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const events = timelineEvents;
  const eventImages = events.map((event) => event.image);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x / _itemTotalSize;
    const newActiveIndex = clamp(
      e.contentOffset.x / _itemTotalSize,
      0,
      eventImages.length - 1
    );

    if (activeIndex !== newActiveIndex) {
      runOnJS(setActiveIndex)(Math.round(newActiveIndex));
    }
  });

  const currentPeriod = events[activeIndex];
  const currentEvents = currentPeriod?.events;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[StyleSheet.absoluteFillObject, { zIndex: 1 }]}>
        <Animated.View
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(500)}
          key={`image-${activeIndex}`}
          style={{ flex: 1 }}
        >
          <OptimizedImage
            source={{ uri: eventImages[activeIndex] }}
            style={{ flex: 1 }}
            contentFit="cover"
            category="timeline"
            transition={300}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
          />
        </Animated.View>
        {loading && (
          <View
            style={[StyleSheet.absoluteFillObject, styles.loadingContainer]}
          >
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
      </View>

      {currentEvents?.length > 0 && currentPeriod && (
        <>
          <View
            style={[
              styles.counterContainer,
              { backgroundColor: theme.colors.background + 99 },
            ]}
          >
            <View style={styles.periodHeader}>
              <Text style={styles.sectionTitle}>
                {currentPeriod.sectionTitle}
              </Text>
              <Text style={styles.periodName}>{currentPeriod.title}</Text>
            </View>
            <View style={styles.counterBadge}>
              <Text style={styles.counter}>{currentEvents.length} eventos</Text>
            </View>
          </View>
          <View
            style={{ zIndex: 2, backgroundColor: theme.colors.background + 99 }}
          >
            <ScrollView
              style={{
                // maxHeight: currentEvents.length > 5 ? height * 0.60 : height * 0.4,
                backgroundColor: "transparent",
              }}
              contentContainerStyle={{
                padding: _spacing,
                paddingBottom: _itemSize + _itemSize * 1.5,
              }}
              showsVerticalScrollIndicator={false}
              overScrollMode="never"
              bounces={false}
            >
              {currentEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  period={currentPeriod}
                  index={index}
                  styles={styles}
                />
              ))}
            </ScrollView>
            {currentEvents.length > 5 && (
              <LinearGradient
                colors={["transparent", theme.colors.background + 99]}
                style={styles.scrollFade}
                pointerEvents="none"
              />
            )}
          </View>
        </>
      )}

      <Animated.FlatList
        style={{
          flexGrow: 0,
          height: _itemSize * 1.6,
          marginBottom: _spacing,
          zIndex: 13,
          position: "absolute",
          bottom: 0,
        }}
        contentContainerStyle={{
          gap: _spacing,
          paddingHorizontal: (width - _itemSize) / 2,
        }}
        data={eventImages}
        keyExtractor={(_, index) => String(index)}
        renderItem={({ item, index }) => {
          return (
            <CarouseItem
              imageURI={item}
              index={index}
              scrollX={scrollX}
              activeColor={theme.colors.notification}
              styles={styles}
            />
          );
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={_itemTotalSize}
        decelerationRate="fast"
      />
    </View>
  );
};

export default CircularSlider;

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.background + 99,
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      borderLeftWidth: 4,
    },
    counterContainer: {
      padding: _spacing,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      zIndex: 2,
      backgroundColor: colors.background,
    },
    periodHeader: {
      flex: 1,
      marginRight: _spacing,
      backgroundColor: "transparent",
    },
    counterBadge: {
      backgroundColor: "rgba(255,255,255,0.15)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    periodName: {
      fontSize: 20,
      fontWeight: "600",
      color: "#fff",
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 12,
      color: "#fff",
      opacity: 0.7,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    counter: {
      fontSize: 12,
      color: "#fff",
      opacity: 0.9,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    periodTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      color: "#fff",
      marginBottom: 8,
      opacity: 0.9,
    },
    dateContainer: {
      flexDirection: "row",
      marginBottom: 8,
      opacity: 0.7,
      backgroundColor: "transparent",
    },
    date: {
      fontSize: 14,
      color: "#fff",
    },
    description: {
      fontSize: 13,
      color: "#ccc",
      lineHeight: 18,
    },
    loadingContainer: {
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    scrollIndicator: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
      marginTop: 8,
      marginBottom: 8,
      backgroundColor: "red",
    },
    scrollDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: "#fff",
    },
    scrollFade: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 40,
    },
  });
