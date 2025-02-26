import { useBibleContext } from "@/context/BibleContext";
import useChangeBookOrChapter from "@/hooks/useChangeBookOrChapter";
import { bibleState$ } from "@/state/bibleState";
import { use$ } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import React, { FC, useMemo } from "react";
import { ActivityIndicator, Animated, StyleSheet } from "react-native";
import Chapter from "./home/content/Chapter";
import BibleFooter from "./home/footer/BibleFooter";
import SwipeWrapper from "./SwipeWrapper";

interface BibleTopProps {
  height: Animated.Value;
  width: Animated.Value;
}

const BibleTop: FC<BibleTopProps> = (props) => {
  const theme = useTheme();
  const { orientation } = useBibleContext();
  const isPortrait = orientation === "PORTRAIT";
  const verses = use$(() => bibleState$.bibleData.topVerses.get());
  const isDataLoading = use$(() => bibleState$.isDataLoading.top.get());
  const estimatedReadingTime = bibleState$.readingTimeData.top.get();
  console.log(
    `🔝 BibleTop Component Rendered 🔄:${isDataLoading} 🧮:${verses.length} ⌚:${estimatedReadingTime}`
  );

  const isSplitActived = bibleState$.isSplitActived.get();
  const { book, chapter, verse } = bibleState$.bibleQuery.get();

  const { nextChapter, previousChapter } = useChangeBookOrChapter({
    book,
    chapter,
  });

  const initialScrollIndex = useMemo(
    () => Math.min(verse - 1, verses.length - 1),
    [verse, verses]
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
            estimatedReadingTime={estimatedReadingTime}
            initialScrollIndex={
              initialScrollIndex === 1 ? 0 : initialScrollIndex
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
