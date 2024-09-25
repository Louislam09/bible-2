import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useBibleContext } from "context/BibleContext";
import { useStorage } from "context/LocalstoreContext";
import useDebounce from "hooks/useDebounce";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View
} from "react-native";
import { TChapter, TTheme } from "types";
import Verse from "./Verse";


const Chapter = ({
  item,
  isSplit,
  book,
  chapter,
  verse: _verse,
  estimatedReadingTime,
}: TChapter & { isSplit: boolean }) => {
  const { verses, subtitles } = item;
  if (!verses) return <ActivityIndicator />;
  const theme = useTheme();
  const styles = getStyles(theme);
  const chapterRef = useRef<FlashList<any>>(null);
  const selectedSideVerse = _verse;
  const [firstLoad, setFirstLoad] = useState(true);
  const [topVerse, setTopVerse] = useState(null);
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 1 };
  const [isLayoutMounted, setLayoutMounted] = useState(false);
  const { chapterVerseLength } =
    useBibleContext();
  const debounceTopVerse = useDebounce(topVerse, 100);
  const {
    historyManager: { updateVerse },
  } = useStorage();

  useEffect(() => {
    if (!debounceTopVerse) return;
    updateVerse(debounceTopVerse);
  }, [debounceTopVerse]);

  useEffect(() => {
    const isFirst = !!topVerse;
    setFirstLoad(!isFirst);
  }, [topVerse]);

  const verseNumber = +(selectedSideVerse as number) || 0;
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
      verse={selectedSideVerse}
      subtitles={subtitles ?? []}
      initVerse={initialScrollIndex}
      estimatedReadingTime={estimatedReadingTime}
    />
  );

  useEffect(() => {
    if (initialScrollIndex !== topVerse && topVerse) {
      if (!firstLoad || !isLayoutMounted) return;
      chapterRef.current?.scrollToIndex({ index: initialScrollIndex - 1 });
    }
  }, [topVerse, isLayoutMounted]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setTopVerse(viewableItems[0].item.verse);
    }
  }, []);

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
          onLayout={() => {
            setLayoutMounted(true);
          }}
          decelerationRate="normal"
          estimatedItemSize={135}
          data={verses ?? []}
          renderItem={renderItem}
          onEndReached={onEndReached}
          initialScrollIndex={initialScrollIndex}
          keyExtractor={(item: any) => `verse-${item.verse}:`}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
        />
      </View>
    </View>
  );
};

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

export default Chapter;
