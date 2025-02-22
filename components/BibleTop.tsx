import { useBibleChapter } from "@/context/BibleChapterContext";
import { useBibleContext } from "@/context/BibleContext";
import useChangeBookOrChapter from "@/hooks/useChangeBookOrChapter";
import React, { FC, useMemo } from "react";
import { ActivityIndicator, Animated, StyleSheet } from "react-native";
import Chapter from "./home/content/Chapter";
import BibleFooter from "./home/footer/BibleFooter";
import SwipeWrapper from "./SwipeWrapper";
import { useTheme } from "@react-navigation/native";

// import { observable } from "@legendapp/state";
// import { enableReactTracking } from "@legendapp/state";

// const page$ = observable(1);
// enableReactTracking({ auto: true });

const BibleTop: FC<any> = (props) => {
  const { navigation } = props;
  const theme = useTheme();
  const { isSplitActived, orientation } = useBibleContext();
  const isPortrait = orientation === "PORTRAIT";

  const {
    verses,
    estimatedReadingTime,
    bibleQuery: { book, chapter, verse },
    loading,
  } = useBibleChapter();
  const memoizedData = useMemo(() => verses, [verses]);
  const memoizedBook = useMemo(() => book, [book]);
  const memoizedChapter = useMemo(() => chapter, [chapter]);
  const memoizedVerse = useMemo(() => verse, [verse]);

  const { nextChapter, previousChapter } = useChangeBookOrChapter({
    book: memoizedBook,
    chapter: memoizedChapter,
  });

  const initialScrollIndex = useMemo(
    () => Math.min(verse - 1, memoizedData.length - 1),
    [verse, memoizedData]
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
        {loading.top ? (
          <ActivityIndicator />
        ) : (
          <Chapter
            verses={memoizedData}
            verse={memoizedVerse || 1}
            estimatedReadingTime={estimatedReadingTime}
            initialScrollIndex={
              initialScrollIndex === 1 ? 0 : initialScrollIndex
            }
          />
        )}
      </SwipeWrapper>
      <BibleFooter isSplit={false} {...props} />
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
