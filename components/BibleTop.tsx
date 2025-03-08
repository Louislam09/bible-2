import { useBibleContext } from "@/context/BibleContext";
import useChangeBookOrChapter from "@/hooks/useChangeBookOrChapter";
import { bibleState$ } from "@/state/bibleState";
import { use$ } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import React, { FC, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet } from "react-native";
import Chapter from "./home/content/Chapter";
import BibleFooter from "./home/footer/BibleFooter";
import SwipeWrapper from "./SwipeWrapper";
import { View } from "./Themed";

interface BibleTopProps {
  height: Animated.Value;
  width: Animated.Value;
}

const BibleTop: FC<BibleTopProps> = (props) => {
  const theme = useTheme();
  const { orientation } = useBibleContext();
  const isPortrait = orientation === "PORTRAIT";
  const isDataLoading = use$(() => bibleState$.isDataLoading.top.get());
  // console.log(`🔝 BibleTop Component Rendered 🔄:${isDataLoading} `);
  const verses = bibleState$.bibleData.topVerses.get() ?? [];

  const isSplitActived = bibleState$.isSplitActived.get();
  const {
    book: book,
    chapter: chapter,
    verse: verse,
  } = bibleState$.bibleQuery.get();

  const { nextChapter, previousChapter } = useChangeBookOrChapter({
    book,
    chapter,
  });

  const initialScrollIndex = useMemo(() => {
    if (verse <= 0) return 0;
    return Math.min(verse - 1, Math.max(0, verses.length - 1));
  }, [verse, verses]);

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
      flex: isSplitActived ? undefined : 1,
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
            verses={verses}
            verse={verse || 1}
            estimatedReadingTime={0}
            initialScrollIndex={
              initialScrollIndex === 1 ? 0 : initialScrollIndex || 0
            }
          />
        )}
      </SwipeWrapper>
      <BibleFooter isSplit={false} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
});

export default BibleTop;
// export default withRenderCount(BibleTop);
