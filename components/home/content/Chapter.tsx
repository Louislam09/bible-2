import Icon from "@/components/Icon";
import { Text } from "@/components/Themed";
import { TChapter, TTheme } from "@/types";
import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Verse from "./Verse";
import useHistoryManager from "@/hooks/useHistoryManager";
import { useBibleChapter } from "@/context/BibleChapterContext";

const Chapter = ({
  verses,
  isSplit,
  verse,
  estimatedReadingTime,
  initialScrollIndex,
  fetching,
}: TChapter) => {
  const { width, height } = useWindowDimensions();
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const chapterRef = useRef<FlashList<any>>(null);
  const topVerseRef = useRef<number | null>(null);

  const aspectRadio = height / width;
  const isMobile = +aspectRadio.toFixed(2) > 1.65;
  console.log("🔄 BibleTop Component Rendered", {
    verses: verses.length,
    isSplit,
    verse,
    estimatedReadingTime,
    initialScrollIndex,
    fetching,
  });

  const renderItem = useCallback(
    (props: any) => (
      <Verse
        {...props}
        isSplit={isSplit}
        verse={verse}
        initVerse={initialScrollIndex}
      />
    ),
    [isSplit, verse, initialScrollIndex]
  );

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newTopVerse = viewableItems[0].item.verse;
      // console.log({ newTopVerse });
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
    if (initialScrollIndex !== topVerseRef.current) {
      console.log({ initialScrollIndex });
      chapterRef.current?.scrollToIndex({
        index: initialScrollIndex,
        animated: true,
        viewPosition: 0,
      });
    }
  }, [initialScrollIndex]);

  const ListHeader = useCallback(() => {
    return (
      <View style={styles.estimatedContainer}>
        <Text style={[styles.estimatedText]}>
          <Icon size={14} name="Timer" color={theme.colors.notification} />
          &nbsp; Tiempo de lectura {`~ ${estimatedReadingTime} min(s)\n`}
        </Text>
      </View>
    );
  }, [estimatedReadingTime]);

  return (
    <View style={styles.chapterContainer}>
      <View style={[styles.verseContent]}>
        <FlashList
          ref={chapterRef}
          refreshing={fetching}
          keyExtractor={(item: any) => `verse-${item.verse}`}
          data={verses ?? []}
          ListHeaderComponent={ListHeader}
          renderItem={renderItem}
          decelerationRate="fast"
          estimatedItemSize={isMobile ? 140 : 100}
          removeClippedSubviews={true}
          ListEmptyComponent={() => (
            <LoadingComponent textColor={theme.colors.text} />
          )}
          initialScrollIndex={initialScrollIndex}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          onEndReachedThreshold={0.5}
          disableAutoLayout
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

// export default withRenderCount(Chapter);
export default Chapter;
