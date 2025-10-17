import Icon from "@/components/Icon";
import { Text } from "@/components/Themed";
import { useHighlightRender } from "@/components/withDrawTimeMeasurement";
import { useMyTheme } from "@/context/ThemeContext";
import { bibleState$ } from "@/state/bibleState";
import { IBookVerse, TTheme } from "@/types";
import { observer } from "@legendapp/state/react";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import InterlinearVerse from "./InterlinearVerse";
import Verse from "./Verse";

interface TChapter {
  verses: IBookVerse[];
  data: IBookVerse[];
  isSplit?: boolean;
  initialScrollIndex: number;
  onScroll?: (direction: "up" | "down") => void;
  theme?: TTheme;
  isInterlinear: boolean;
}

const Chapter = ({
  verses,
  data,
  isSplit,
  initialScrollIndex,
  onScroll,
  isInterlinear,
}: TChapter) => {
  const bibleSide = isSplit ? "bottom" : "top";
  const hightlightStyle = useHighlightRender();

  const { theme } = useMyTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const chapterRef = useRef<FlashListRef<any>>(null);
  const topVerseRef = useRef<number | null>(null);
  const lastOffset = useRef(0);
  const lastScrollTime = useRef(Date.now());

  const renderItem = useCallback(
    ({ item }: any) =>
      isInterlinear && !isSplit ? (
        <InterlinearVerse item={item} />
      ) : (
        <Verse item={item} isSplit={!!isSplit} initVerse={initialScrollIndex} />
      ),
    [isSplit, initialScrollIndex, isInterlinear]
  );

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newTopVerse = viewableItems[0].item.verse;
      bibleState$.handleCurrentHistoryIndex(newTopVerse);
      if (topVerseRef.current !== newTopVerse) {
        topVerseRef.current = newTopVerse;
      }
    }
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    {
      onViewableItemsChanged,
      viewabilityConfig: {
        viewAreaCoveragePercentThreshold: 50,
        // itemVisiblePercentThreshold: 75,
        minimumViewTime: 500,
        waitForInteraction: true,
      },
    },
  ]);

  useEffect(() => {
    if (initialScrollIndex !== topVerseRef.current && chapterRef.current) {
      chapterRef.current?.scrollToIndex({
        index: initialScrollIndex,
        animated: true,
        // viewPosition: 0.5,
      });
    }
  }, [initialScrollIndex]);

  const ListHeader = useCallback(() => {
    return isInterlinear ? null : (
      <View style={styles.estimatedContainer}>
        <Text style={[styles.estimatedText]}>
          <Icon size={14} name="Timer" color={theme.colors.notification} />
          &nbsp; Tiempo de lectura{" "}
          {`~ ${bibleState$.readingTimeData[bibleSide].get()} min(s)\n`}
        </Text>
      </View>
    );
  }, [isInterlinear]);

  const keyExtractor = useCallback(
    (item: IBookVerse) =>
      `${item?.book_number}-${item?.chapter}-${item?.verse}`,
    []
  );

  const handleScroll = useCallback(
    ({ nativeEvent }: { nativeEvent: any }) => {
      const now = Date.now();
      const minScrollTime = 50; // Minimum time between scroll events to process

      if (now - lastScrollTime.current < minScrollTime) {
        return;
      }

      const currentOffset = nativeEvent.contentOffset.y;
      const direction = currentOffset > lastOffset.current ? "down" : "up";

      if (Math.abs(currentOffset - lastOffset.current) > 10) {
        // Minimum scroll distance
        onScroll?.(direction);
        lastOffset.current = currentOffset;
        lastScrollTime.current = now;
      }
    },
    [onScroll]
  );

  return (
    <View style={styles.chapterContainer}>
      <Animated.View style={[styles.verseContent, hightlightStyle.style]}>
        <FlashList
          ref={chapterRef}
          keyExtractor={keyExtractor}
          data={data ?? []}
          ListHeaderComponent={ListHeader}
          renderItem={renderItem}
          decelerationRate="normal"
          removeClippedSubviews
          getItemType={() => "verse"} // Consistent item type
          ListEmptyComponent={() => (
            <LoadingComponent textColor={theme.colors.text} />
          )}
          initialScrollIndex={Math.abs(initialScrollIndex - 1 || 0)}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          onEndReachedThreshold={0.5}
          ListFooterComponent={<View style={{ paddingBottom: 100 }} />}
          ListHeaderComponentStyle={{ paddingTop: 70 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      </Animated.View>
    </View>
  );
};

const LoadingComponent = React.memo(({ textColor }: { textColor: string }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator />
    <Text style={[styles.loadingText, { color: textColor }]}>Cargando...</Text>
  </View>
));

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    chapterContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    verseContent: {
      width: "100%",
      height: "100%",
    },
    slider: {
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      width: "100%",
    },
    sliderHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.text,
      borderRadius: 2,
    },
    estimatedContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingRight: 10,
      width: "100%",
    },
    estimatedText: {
      textAlign: "right",
    },
  });

export default observer(Chapter);
