import { useBibleChapter } from "@/context/BibleChapterContext";
import { useBibleContext } from "@/context/BibleContext";
import useChangeBookOrChapter from "@/hooks/useChangeBookOrChapter";
import React, { FC } from "react";
import { Animated, StyleSheet } from "react-native";
import SwipeWrapper from "./SwipeWrapper";
import Chapter from "./home/content/Chapter";
import BibleFooter from "./home/footer/BibleFooter";

const BibleBottom: FC<any> = (props) => {
  const { navigation } = props;
  const { isSplitActived, orientation } = useBibleContext();
  const isPortrait = orientation === "PORTRAIT";

  const {
    bottomVerses,
    bibleQuery: { bottomSideVerse },
    estimatedReadingTimeBottom,
    loading,
  } = useBibleChapter();

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

  return (
    <Animated.View
      style={[
        styles.container,
        {
          [isPortrait ? "height" : "width"]: isPortrait
            ? props.height
            : props.wdith,
        },
        isSplitActived && { flex: 1 },
      ]}
    >
      <SwipeWrapper {...{ onSwipeRight, onSwipeLeft }}>
        <Chapter
          initialScrollIndex={0}
          fetching={loading}
          verses={bottomVerses}
          verse={bottomSideVerse || 1}
          estimatedReadingTime={estimatedReadingTimeBottom}
        />
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
