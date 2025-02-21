import { useBibleChapter } from "@/context/BibleChapterContext";
import { useBibleContext } from "@/context/BibleContext";
import useChangeBookOrChapter from "@/hooks/useChangeBookOrChapter";
import React, { FC, useMemo, useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet } from "react-native";
import Chapter from "./home/content/Chapter";
import BibleFooter from "./home/footer/BibleFooter";
import SwipeWrapper from "./SwipeWrapper";
import { useTheme } from "@react-navigation/native";

const BibleTop: FC<any> = (props) => {
  const renderCount = ++useRef(0).current;
  const theme = useTheme();
  const { isSplitActived, orientation } = useBibleContext();
  const isPortrait = orientation === "PORTRAIT";
  const { nextChapter, previousChapter } = useChangeBookOrChapter({});
  const {
    verses,
    estimatedReadingTime: _estimatedReadingTime,
    bibleQuery: { chapter, verse: _verse },
    loading,
  } = useBibleChapter();
  // console.log(
  //   `BibleTop renderCount:${renderCount} verses:${verses.length} chapter:${chapter} verse:${_verse}`
  // );
  const memoizedData = useMemo(() => verses, [verses]);
  const verse = useMemo(() => _verse, [_verse]);
  const estimatedReadingTime = useMemo(
    () => _estimatedReadingTime,
    [_estimatedReadingTime]
  );

  const initialScrollIndex = useMemo(
    () => Math.min(verse, memoizedData.length),
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
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Chapter
            verses={memoizedData}
            verse={verse || 1}
            estimatedReadingTime={estimatedReadingTime}
            initialScrollIndex={
              initialScrollIndex === 1 ? 0 : initialScrollIndex
            }
            fetching={loading}
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

export default React.memo(BibleTop);
// export default withRenderCount(BibleTop);
