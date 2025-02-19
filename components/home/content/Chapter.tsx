import { Text } from "@/components/Themed";
import { useBibleChapter } from "@/context/BibleChapterContext";
import useDebounce from "@/hooks/useDebounce";
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

const Chapter = ({
  item,
  isSplit,
  verse: _verse,
  estimatedReadingTime,
}: TChapter & { isSplit: boolean }) => {
  const { verses = [] } = item;
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const chapterRef = useRef<FlashList<any>>(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [topVerse, setTopVerse] = useState<number | null>(null);
  const [isLayoutMounted, setLayoutMounted] = useState(false);
  const chapterVerseLength = useMemo(() => verses.length, [verses]);
  const debounceTopVerse = useDebounce(topVerse, 100);
  const { historyManager } = useBibleChapter();
  const { updateVerse } = historyManager;
  const { width, height } = useWindowDimensions();
  const aspectRadio = height / width;
  const isMobile = +aspectRadio.toFixed(2) > 1.65;

  // THIS IS CAUSING RE-RENDER - FIX
  // useEffect(() => {
  // if (!debounceTopVerse) return;
  //   // updateVerse(debounceTopVerse);
  // }, [debounceTopVerse]);

  useEffect(() => {
    const isFirst = !!topVerse;
    setFirstLoad(!isFirst);
  }, [topVerse]);

  const verseNumber = +(_verse as number) || 0;
  const initialScrollIndex = useMemo(() => {
    const inValidIndex = verseNumber > verses.length;
    const shouldSubtract =
      verses.length === verseNumber || verseNumber === 1 ? -1 : 0;
    return inValidIndex ? 0 : verseNumber + shouldSubtract;
  }, [verseNumber, verses]);

  const renderItem = (props: any) => (
    <Verse
      {...props}
      isSplit={isSplit}
      verse={_verse}
      initVerse={initialScrollIndex}
      estimatedReadingTime={estimatedReadingTime}
    />
  );

  useEffect(() => {
    if (initialScrollIndex !== topVerse && topVerse) {
      if (!firstLoad || !isLayoutMounted) return;
      chapterRef.current?.scrollToIndex({
        index: initialScrollIndex - 1,
        animated: true,
      });
    }
  }, [topVerse, isLayoutMounted]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setTopVerse(viewableItems[0].item.verse);
    }
  }, []);

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 1 };

  const viewabilityConfigCallbackPairs = useRef([
    { onViewableItemsChanged, viewabilityConfig },
  ]);

  const onEndReached = useCallback(() => {
    setTimeout(() => setTopVerse(chapterVerseLength as any), 500);
  }, [chapterVerseLength]);

  return (
    <View style={styles.chapterContainer}>
      <View style={[styles.verseContent]}>
        <FlashList
          ref={chapterRef}
          keyExtractor={(item: any) => `verse-${item.verse}`}
          data={verses ?? []}
          onLayout={() => setLayoutMounted(true)}
          onEndReached={onEndReached}
          renderItem={renderItem}
          // decelerationRate="normal"
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
          // maintainVisibleContentPosition={{
          //   minIndexForVisible: 0,
          //   autoscrollToTopThreshold: 10,
          // }}
          onEndReachedThreshold={0.5}
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
  });

// export default withRenderCount(Chapter);
export default Chapter;
