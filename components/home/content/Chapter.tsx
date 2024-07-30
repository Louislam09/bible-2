import { useRoute, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Verse from "./Verse";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { TChapter, HomeParams, TTheme } from "types";
import { useBibleContext } from "context/BibleContext";
import { Text } from "components/Themed";

const Chapter = ({
  item,
  isSplit,
  verse: _verse,
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
    />
  );

  useEffect(() => {
    if (initialScrollIndex !== topVerse && topVerse) {
      if (!firstLoad) return;
      chapterRef.current?.scrollToIndex({ index: initialScrollIndex - 1 });
    }
  }, [topVerse]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setTopVerse(viewableItems[0].item.verse);
    }
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    { onViewableItemsChanged, viewabilityConfig },
  ]);

  return (
    <View style={styles.chapterContainer}>
      <View style={[styles.verseContent]}>
        <FlashList
          ref={chapterRef}
          decelerationRate="normal"
          estimatedItemSize={135}
          data={verses ?? []}
          renderItem={renderItem}
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
      // width: 400,
      width: "100%",
      height: "100%",
    },
  });

export default Chapter;
