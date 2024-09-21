import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import BottomModal from "components/BottomModal";
import CustomBottomSheet from "components/BottomSheet";
import CompareVersions from "components/CompareVersions";
import DictionaryContent from "components/DictionaryContent";
import Icon from "components/Icon";
import { useBibleContext } from "context/BibleContext";
import { useStorage } from "context/LocalstoreContext";
import useDebounce from "hooks/useDebounce";
import useResizableBox from "hooks/useResizeBox";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { TChapter, TTheme } from "types";
import StrongContent from "./StrongContent";
import Verse from "./Verse";

const DragIconView = Animated.View;

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
  const compareRef = useRef<BottomSheetModal>(null);
  const selectedSideVerse = _verse;
  const [firstLoad, setFirstLoad] = useState(true);
  const [topVerse, setTopVerse] = useState(null);
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 1 };
  const [isLayoutMounted, setLayoutMounted] = useState(false);
  const [searchWordOnDic, setSearchWordOnDic] = useState("");
  const { verseToCompare, strongWord, fontSize, chapterVerseLength } =
    useBibleContext();
  const navigation = useNavigation();
  const debounceTopVerse = useDebounce(topVerse, 100);
  const strongSearchBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const dictionaryBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isSheetClosed, setSheetClosed] = useState(true);
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
    setSheetClosed(false);
    strongSearchBottomSheetModalRef.current?.expand();
  }, []);

  const dictionaryHandlePresentModalPress = useCallback((text: string) => {
    setSearchWordOnDic(text);
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
      onDictionary={dictionaryHandlePresentModalPress}
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

  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const screenHeight = useRef(SCREEN_HEIGHT).current;

  const handleSheetChange = (index: number) => {
    setSheetClosed(index <= 0);
  };

  const { topHeight, topWidth, _backgroundColor, panResponder } =
    useResizableBox({ theme });


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
      {!isSheetClosed && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: Animated.subtract(
              new Animated.Value(screenHeight),
              topHeight
            ),
          }}
        >
          <CustomBottomSheet
            handleSheetChange={handleSheetChange}
            startAT={3}
            ref={strongSearchBottomSheetModalRef}
            handleComponent={() => {
              return (
                <DragIconView
                  {...panResponder.panHandlers}
                  style={[styles.slider]}
                >
                  <Icon
                    name="GripHorizontal"
                    size={30}
                    color={theme.colors.text}
                  />
                </DragIconView>
              );
            }}
          >
            <StrongContent
              navigation={navigation}
              theme={theme}
              data={strongWord}
              fontSize={fontSize}
              bottomRef={strongSearchBottomSheetModalRef}
              onDictionary={dictionaryHandlePresentModalPress}
            />
          </CustomBottomSheet>
        </Animated.View>
      )}

      <BottomModal
        backgroundColor={theme.dark ? theme.colors.background : "#eee"}
        shouldScroll
        startAT={2}
        ref={dictionaryBottomSheetModalRef}
      >
        <DictionaryContent
          word={searchWordOnDic}
          navigation={navigation}
          theme={theme}
          fontSize={fontSize}
          dicRef={dictionaryBottomSheetModalRef}
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
