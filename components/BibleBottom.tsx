import { useBibleChapter } from "@/context/BibleChapterContext";
import { useBibleContext } from "@/context/BibleContext";
import useChangeBookOrChapter from "@/hooks/useChangeBookOrChapter";
import React, { FC, useMemo } from "react";
import { ActivityIndicator, Animated, StyleSheet } from "react-native";
import SwipeWrapper from "./SwipeWrapper";
import Chapter from "./home/content/Chapter";
import BibleFooter from "./home/footer/BibleFooter";
import { useTheme } from "@react-navigation/native";

const BibleBottom: FC<any> = (props) => {
  const { navigation } = props;
  const { isSplitActived, orientation } = useBibleContext();
  const isPortrait = orientation === "PORTRAIT";
  const theme = useTheme();

  const {
    bottomVerses,
    bibleQuery: { bottomSideVerse },
    estimatedReadingTimeBottom,
    loading,
  } = useBibleChapter();
  const memoizedData = useMemo(() => bottomVerses, [bottomVerses]);

  const initialScrollIndex = useMemo(
    () => Math.min(bottomSideVerse, memoizedData.length),
    [bottomSideVerse, memoizedData]
  );

  const { nextChapter, previousChapter } = useChangeBookOrChapter({
    navigation,
    isSplit: true,
    ...props,
  });

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
    // <Animated.View
    //   style={[
    //     styles.container,
    //     {
    //       [isPortrait ? "height" : "width"]: isPortrait
    //         ? props.height
    //         : props.wdith,
    //     },
    //     isSplitActived && { flex: 1 },
    //   ]}
    // >
    <Animated.View style={[styles.container, containerStyle]}>
      <SwipeWrapper {...{ onSwipeRight, onSwipeLeft }}>
        {loading.bottom ? (
          <ActivityIndicator />
        ) : (
          <Chapter
            verses={memoizedData}
            verse={bottomSideVerse || 1}
            estimatedReadingTime={estimatedReadingTimeBottom}
            initialScrollIndex={
              initialScrollIndex === 1 ? 0 : initialScrollIndex
            }
          />
        )}

        {/* <BookContent isSplit {...props} />
         */}
      </SwipeWrapper>
      <BibleFooter isSplit {...props} />
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
