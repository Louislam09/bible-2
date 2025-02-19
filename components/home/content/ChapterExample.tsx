import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "@react-navigation/native";
import { Text } from "@/components/Themed";
import { useBibleChapter } from "@/context/BibleChapterContext";
import useDebounce from "@/hooks/useDebounce";
import { TChapter, TTheme } from "@/types";
import Verse from "./Verse";

const LoadingComponent = React.memo(({ textColor }: { textColor: string }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator />
    <Text style={[styles.loadingText, { color: textColor }]}>Cargando...</Text>
  </View>
));

const VerseItem = React.memo(
  ({ item, isSplit, verse, initVerse, estimatedReadingTime }: any) => (
    <Verse
      item={item}
      isSplit={isSplit}
      // verse={verse as any}
      initVerse={initVerse}
      estimatedReadingTime={estimatedReadingTime}
    />
  )
);

const Chapter: React.FC<TChapter & { isSplit: boolean }> = ({
  item,
  isSplit,
  verse: _verse,
  estimatedReadingTime,
}) => {
  const { verses = [] } = item;
  const theme = useTheme();
  const chapterRef = useRef<FlashList<any>>(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [topVerse, setTopVerse] = useState<number | null>(null);
  const [isLayoutMounted, setLayoutMounted] = useState(false);

  const chapterVerseLength = useMemo(() => verses.length, [verses]);
  const debounceTopVerse = useDebounce(topVerse, 100);
  const { historyManager } = useBibleChapter();
  const { updateVerse } = historyManager;

  const viewabilityConfig = useMemo(
    () => ({
      viewAreaCoveragePercentThreshold: 1,
    }),
    []
  );

  const verseNumber = +((_verse as number) || 0);
  const initialScrollIndex = useMemo(() => {
    if (verseNumber > verses.length) return 0;
    const shouldSubtract =
      verses.length === verseNumber || verseNumber === 1 ? -1 : 0;
    return verseNumber + shouldSubtract;
  }, [verseNumber, verses.length]);

  const renderItem = useCallback(
    ({ item: verseItem }: any) => (
      <VerseItem
        item={verseItem}
        isSplit={isSplit}
        verse={_verse}
        initVerse={initialScrollIndex}
        estimatedReadingTime={estimatedReadingTime}
      />
    ),
    [isSplit, _verse, initialScrollIndex, estimatedReadingTime]
  );

  useEffect(() => {
    if (debounceTopVerse) {
      updateVerse(debounceTopVerse);
    }
  }, [debounceTopVerse, updateVerse]);

  useEffect(() => {
    setFirstLoad(!topVerse);
  }, [topVerse]);

  useEffect(() => {
    if (
      initialScrollIndex !== topVerse &&
      topVerse &&
      firstLoad &&
      isLayoutMounted
    ) {
      chapterRef.current?.scrollToIndex({
        index: initialScrollIndex - 1,
        animated: false,
      });
    }
  }, [topVerse, isLayoutMounted, initialScrollIndex, firstLoad]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setTopVerse(viewableItems[0].item.verse);
    }
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    { onViewableItemsChanged, viewabilityConfig },
  ]);

  const onEndReached = useCallback(() => {
    requestAnimationFrame(() => {
      setTopVerse(chapterVerseLength);
    });
  }, [chapterVerseLength]);

  const keyExtractor = useCallback((item: any) => `verse-${item.verse}`, []);

  return (
    <View style={styles.chapterContainer}>
      <View style={styles.verseContent}>
        <FlashList
          ref={chapterRef}
          onLayout={() => setLayoutMounted(true)}
          decelerationRate="fast"
          estimatedItemSize={135}
          data={verses}
          renderItem={renderItem}
          onEndReached={onEndReached}
          ListEmptyComponent={() => (
            <LoadingComponent textColor={theme.colors.text} />
          )}
          initialScrollIndex={initialScrollIndex}
          keyExtractor={keyExtractor}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          removeClippedSubviews={true}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          onEndReachedThreshold={0.5}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default React.memo(Chapter);
