import { useBibleContext } from "@/context/BibleContext";
import useChangeBookOrChapter from "@/hooks/useChangeBookOrChapter";
import { bibleState$ } from "@/state/bibleState";
import { use$ } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import React, { FC, useMemo } from "react";
import { ActivityIndicator, Animated, StyleSheet } from "react-native";
import SwipeWrapper from "./SwipeWrapper";
import Chapter from "./home/content/Chapter";
import BibleFooter from "./home/footer/BibleFooter";

const BibleBottom: FC<any> = (props) => {
  const { orientation } = useBibleContext();
  const isSplitActived = bibleState$.isSplitActived.get();
  const isPortrait = orientation === "PORTRAIT";
  const theme = useTheme();

  const estimatedReadingTimeBottom = bibleState$.readingTimeData.bottom.get();
  const isDataLoading = use$(() => bibleState$.isDataLoading.bottom.get());
  const bottomVerses = use$(() => bibleState$.bibleData.bottomVerses.get());
  const interlinearVerses = use$(
    () => bibleState$.bibleData.interlinearVerses.get() ?? []
  );

  console.log(
    `🔝 BibleBottom Component Rendered 🔄:${isDataLoading} 🧮:${bottomVerses.length} ⌚:${estimatedReadingTimeBottom}`
  );
  const {
    bottomSideVerse: verse,
    bottomSideBook: book,
    bottomSideChapter: chapter,
  } = bibleState$.bibleQuery.get();

  const { nextChapter, previousChapter } = useChangeBookOrChapter({
    book,
    chapter,
    isSplit: true,
  });

  const initialScrollIndex = useMemo(
    () => Math.min(verse - 1, bottomVerses.length - 1),
    [verse, bottomVerses]
  );

  const onSwipeRight = () => {
    previousChapter();
  };
  const onSwipeLeft = () => {
    nextChapter();
  };

  const widthOrHeight = useMemo(
    () => (isPortrait ? "height" : "width"),
    [isPortrait]
  );

  const containerStyle = useMemo(
    () => ({
      [widthOrHeight]: props[widthOrHeight],
      flex: 1,
      backgroundColor: theme.colors.background,
    }),
    [widthOrHeight, props, isSplitActived, theme.colors.background]
  );

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <SwipeWrapper {...{ onSwipeRight, onSwipeLeft }}>
        {isDataLoading ? (
          <ActivityIndicator />
        ) : (
          <Chapter
            isSplit
            interlinearVerses={interlinearVerses}
            verses={bottomVerses}
            estimatedReadingTime={estimatedReadingTimeBottom}
            initialScrollIndex={
              initialScrollIndex === 1 ? 0 : initialScrollIndex
            }
          />
        )}
      </SwipeWrapper>
      <BibleFooter isSplit />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
});

export default BibleBottom;
