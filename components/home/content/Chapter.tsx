import HebrewVerse from "@/components/home/content/HebrewVerse";
import Icon from "@/components/Icon";
import { Text } from "@/components/Themed";
import { useBibleContext } from "@/context/BibleContext";
import { useTheme } from "@/context/ThemeContext";
import { bibleState$ } from "@/state/bibleState";
import { EBibleVersions, IBookVerse, TTheme } from "@/types";
import { observer } from "@legendapp/state/react";
import { FlashList } from "@shopify/flash-list";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Verse from "./Verse";

interface TChapter {
  verses: IBookVerse[];
  isSplit?: boolean;
  estimatedReadingTime: number;
  initialScrollIndex: number;
  onScroll?: (direction: "up" | "down") => void;
}

interface TChapter {
  verses: IBookVerse[];
  interlinearVerses: IBookVerse[];
  isSplit?: boolean;
  estimatedReadingTime: number;
  initialScrollIndex: number;
  onScroll?: (direction: "up" | "down") => void;
}

const Chapter = ({
  verses,
  interlinearVerses,
  isSplit,
  estimatedReadingTime,
  initialScrollIndex,
  onScroll,
}: TChapter) => {
  const bibleSide = isSplit ? "bottom" : "top";

  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const chapterRef = useRef<FlashList<any>>(null);
  const topVerseRef = useRef<number | null>(null);
  const lastOffset = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const { currentBibleVersion } = useBibleContext();

  const aspectRadio = height / width;
  const isMobile = +aspectRadio.toFixed(2) > 1.65;
  const isInterlineal = [
    EBibleVersions.INT,
    EBibleVersions.INTERLINEAL,
  ].includes(currentBibleVersion as EBibleVersions);

  const data = isInterlineal && !isSplit ? interlinearVerses : verses;

  const renderItem = useCallback(
    ({ item }: any) =>
      isInterlineal && !isSplit ? (
        <HebrewVerse item={item} />
      ) : (
        <Verse item={item} isSplit={!!isSplit} initVerse={initialScrollIndex} />
      ),
    [isSplit, initialScrollIndex, isInterlineal]
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
    return isInterlineal ? null : (
      <View style={styles.estimatedContainer}>
        <Text style={[styles.estimatedText]}>
          <Icon size={14} name="Timer" color={theme.colors.notification} />
          &nbsp; Tiempo de lectura{" "}
          {`~ ${bibleState$.readingTimeData[bibleSide].get()} min(s)\n`}
        </Text>
      </View>
    );
  }, [estimatedReadingTime, isInterlineal]);

  const keyExtractor = useCallback(
    (item: IBookVerse) => `${item.book_number}-${item.chapter}-${item.verse}`,
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
      <View style={[styles.verseContent]}>
        <FlashList
          ref={chapterRef}
          keyExtractor={keyExtractor}
          data={data ?? []}
          // data={data.slice(0, 1)}
          ListHeaderComponent={ListHeader}
          renderItem={renderItem}
          decelerationRate="normal"
          estimatedItemSize={isMobile ? 162 : 100}
          removeClippedSubviews
          ListEmptyComponent={() => (
            <LoadingComponent textColor={theme.colors.text} />
          )}
          initialScrollIndex={initialScrollIndex}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          onEndReachedThreshold={0.5}
          disableAutoLayout
          disableHorizontalListHeightMeasurement
          ListHeaderComponentStyle={{ paddingTop: 70 }}
          ListFooterComponent={<View style={{ paddingBottom: 40 }} />}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        // decelerationRate="normal"
        // onEndReached={onEndReached}
        // maintainVisibleContentPosition={{
        //   minIndexForVisible: 0,
        //   autoscrollToTopThreshold: 10,
        // }}
        />
      </View>
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

export function useHighlightRender() {
  const animation = useRef(new Animated.Value(0)).current;
  const renderCount = useRef(0);
  const { theme } = useTheme();

  useEffect(() => {
    // Increment render count
    renderCount.current += 1;

    // Trigger animation only if it's not the first render
    if (renderCount.current > 1) {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  });

  return {
    style: {
      borderColor: animation.interpolate({
        inputRange: [0, 1],
        outputRange: ["transparent", "red"],
        // outputRange: ["transparent", theme.colors.notification],
      }),
      borderWidth: 1,
    },
  };
}

export default observer(Chapter);
// export default React.memo(Chapter);
