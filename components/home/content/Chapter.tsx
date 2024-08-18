import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import BottomModal from "components/BottomModal";
import CompareVersions from "components/CompareVersions";
import { useBibleContext } from "context/BibleContext";
import { useStorage } from "context/LocalstoreContext";
import useDebounce from "hooks/useDebounce";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { TChapter, TTheme } from "types";
import StrongContent from "./StrongContent";
import Verse from "./Verse";

const Chapter = ({
  item,
  isSplit,
  book,
  chapter,
  verse: _verse,
}: TChapter & { isSplit: boolean }) => {
  const { verses, subtitles } = item;
  if (!verses) return <ActivityIndicator />;
  const theme = useTheme();
  const styles = getStyles(theme);
  const chapterRef = useRef<FlashList<any>>(null);
  const compareRef = useRef<BottomSheetModal>(null);
  const selectedSideVerse = _verse;
  const [firstLoad, setFirstLoad] = useState(true);
  const [topVerse, setTopVerse] = useState(null);
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 1 };
  const [isLayoutMounted, setLayoutMounted] = useState(false);
  const { verseToCompare, strongWord, fontSize } = useBibleContext();
  const navigation = useNavigation();
  const debounceTopVerse = useDebounce(topVerse, 100);
  const strongSearchBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const dictionaryBottomSheetModalRef = useRef<BottomSheetModal>(null);
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

  const compareRefHandlePresentModalPress = useCallback(() => {
    compareRef.current?.present();
  }, []);

  const strongSearchHandlePresentModalPress = useCallback(() => {
    strongSearchBottomSheetModalRef.current?.present();
  }, []);

  const dictionaryHandlePresentModalPress = useCallback(() => {
    dictionaryBottomSheetModalRef.current?.present();
  }, []);

  const renderItem = (props: any) => (
    <Verse
      {...props}
      isSplit={isSplit}
      verse={selectedSideVerse}
      subtitles={subtitles ?? []}
      initVerse={initialScrollIndex}
      onCompare={compareRefHandlePresentModalPress}
      onWord={strongSearchHandlePresentModalPress}
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
          initialScrollIndex={initialScrollIndex}
          keyExtractor={(item: any) => `verse-${item.verse}:`}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
        />
      </View>

      <BottomModal
        shouldScroll
        startAT={2}
        ref={strongSearchBottomSheetModalRef}
      >
        <StrongContent
          navigation={navigation}
          theme={theme}
          data={strongWord}
          fontSize={fontSize}
          bottomRef={strongSearchBottomSheetModalRef}
          onDictionary={dictionaryHandlePresentModalPress}
        />
      </BottomModal>
      <BottomModal shouldScroll startAT={3} ref={compareRef}>
        <CompareVersions
          {...{
            theme,
            book,
            chapter,
            verse: verseToCompare || 1,
            navigation,
            compareRef,
          }}
        />
      </BottomModal>
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
