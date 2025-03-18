import timelineEvents from "@/constants/events";
import { TimelinePeriod, TTheme } from "@/types";
import { useTheme } from "@react-navigation/native";
import { AnimatedFlashList, FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useWindowDimensions
} from "react-native";
import Animated, { FadeIn, FadeOut, SharedTransition, withSpring } from "react-native-reanimated";
import { Text, View } from "../Themed";

type TimeEventItemProps = {
  item: TimelinePeriod;
  onPress: any;
  isMobile: boolean;  
  index: number;
};

const TimeEventItem = ({ item, onPress, isMobile, index }: TimeEventItemProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  // const transitionTag = `image-${item.title || item.sectionTitle}`.replace(/\s+/g, '-');
  // const imageTransition = SharedTransition.custom((values) => {
  //   'worklet';
  //   return {
  //     height: withSpring(values.targetHeight, { damping: 15, stiffness: 90 }),
  //     width: withSpring(values.targetWidth, { damping: 15, stiffness: 90 }),
  //     originX: withSpring(values.targetOriginX, { damping: 15, stiffness: 90 }),
  //     originY: withSpring(values.targetOriginY, { damping: 15, stiffness: 90 }),
  //     borderRadius: withSpring(values.targetBorderRadius, { damping: 15, stiffness: 90 }),
  //   };
  // })

  return (
    <Pressable
      style={({ pressed }) => [
        styles.itemContainer,
        pressed && styles.itemPressed,
        !isMobile && { marginHorizontal: 4 },
      ]}
      onPress={() => onPress(item)}
    >
      <View style={styles.contentContainer}>
        {item.image ? (
          <View style={[styles.imageContainer]}>
            <Animated.Image
              // sharedTransitionTag={transitionTag}
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
              // sharedTransitionStyle={imageTransition}
              source={{ uri: item.image }}
              style={[{ backgroundColor: theme.colors.background, flex: 1, borderRadius: 8 }]}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
          </View>
        ) : null}

        <View style={styles.headerContainer}>
          <View
            style={[
              styles.titleBadge,
              { backgroundColor: item.color || theme.colors.primary },
            ]}
          >
            <Text style={styles.titleText}>
              {item.title || item.sectionTitle}
            </Text>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.subtitleText}>{item.subTitle}</Text>

          {item.description && (
            <Text style={styles.descriptionText} numberOfLines={3}>
              {item.description}
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.eventsIndicator}>
            <Text style={styles.eventsCount}>
              {item.events?.length || 0} eventos
            </Text>
          </View>
          <Text style={styles.viewMoreText}>Ver detalles</Text>
        </View>
      </View>
    </Pressable>
  );
};

const TimelineList = () => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const events = timelineEvents;
  const { width, height } = useWindowDimensions();
  const aspectRadio = height / width;
  const isMobile = +aspectRadio.toFixed(2) > 1.65;
  const router = useRouter();

  const handleItemPress = (index: number) => {
    router.push({
      pathname: `/timeline/${index}`,
    });
  };

  return (
    <View
      style={[styles.container]}>
      <AnimatedFlashList
        data={events}
        keyExtractor={(item, index) => `timelineEvent:${index}`}
        renderItem={({ item, index }) => (
          <TimeEventItem
            isMobile={isMobile}
            item={item}
            index={index}
            onPress={() => handleItemPress(index)}
          />
        )}
        estimatedItemSize={150}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.emptyText}>Loading timeline events...</Text>
          </View>
        )}
        ListHeaderComponent={() => <View style={styles.listHeader} />}
        ListFooterComponent={() => <View style={styles.listFooter} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        numColumns={isMobile ? 1 : 2}
      />
    </View>
  );
};

export default TimelineList;

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    headerText: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 16,
      color: colors.text,
    },
    listContent: {
      paddingHorizontal: 8,
    },
    listHeader: {
      height: 8,
    },
    listFooter: {
      height: 24,
    },
    separator: {
      height: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 48,
    },
    emptyText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.text,
      opacity: 0.7,
    },
    itemContainer: {
      flex: 1,
      flexDirection: "row",
      borderRadius: 12,
      backgroundColor: colors.background,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    timelineBar: {
      width: 40,
      alignItems: "center",
      paddingTop: 20,
    },
    timelineDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      zIndex: 1,
    },
    timelineLine: {
      width: 2,
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      padding: 16,
    },
    imageContainer: {
      height: 200,
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 12,
    },
    textContainer: {
      flex: 1,
    },
    periodText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 4,
    },
    titleText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "white",
    },
    subtitleText: {
      fontSize: 15,
      color: colors.text,
      opacity: 0.8,
      marginBottom: 12,
    },
    headerContainer: {
      marginBottom: 12,
    },
    titleBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.1)",
      borderRadius: 12,
    },
    descriptionText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
      opacity: 0.8,
      marginBottom: 12,
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
    },
    eventDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginRight: 8,
    },
    eventText: {
      fontSize: 13,
      color: colors.text,
      opacity: 0.9,
      flex: 1,
    },
    moreEventsText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: "500",
      marginTop: 4,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border + "40",
    },
    eventsIndicator: {
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    eventsCount: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
    },
    viewMoreText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primary,
    },
  });
