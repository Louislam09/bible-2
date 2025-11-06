import { useBibleContext } from "@/context/BibleContext";
import { useMyTheme } from "@/context/ThemeContext";
import useChangeBookOrChapter from "@/hooks/useChangeBookOrChapter";
import { bibleState$ } from "@/state/bibleState";
import { use$ } from "@legendapp/state/react";
import React, { FC, useMemo } from "react";
import { ActivityIndicator, Animated, StyleSheet } from "react-native";
import SwipeWrapper from "./SwipeWrapper";
import Chapter from "./home/content/Chapter";
import BibleFooter from "./home/footer/BibleFooter";
import { View } from "./Themed";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { OrientationType } from "@/types";

const BibleBottom: FC<any> = (props) => {
  const { theme } = useMyTheme();
  const orientation = useDeviceOrientation();
  const isPortrait = orientation === OrientationType.PORTRAIT;


  const isSplitActived = use$(() => bibleState$.isSplitActived.get());
  const isDataLoading = use$(() => bibleState$.isDataLoading.bottom.get());
  const bottomVerses = use$(() => bibleState$.bibleData.bottomVerses.get());
  const interlinearVerses = use$(
    () => bibleState$.bibleData.interlinearVerses.get() ?? []
  );
  const bibleQuery = use$(() => bibleState$.bibleQuery.get());

  const verse = bibleQuery?.bottomSideVerse || 1;
  const book = bibleQuery?.bottomSideBook || "Génesis";
  const chapter = bibleQuery?.bottomSideChapter || 1;

  const { nextChapter, previousChapter } = useChangeBookOrChapter({
    book,
    chapter,
    isSplit: true,
  });


  const initialScrollIndex = useMemo(
    () => Math.min(verse - 1, bottomVerses.length - 1),
    [verse, bottomVerses]
  );

  // const onSwipeRight = () => {
  //   previousChapter();
  // };
  // const onSwipeLeft = () => {
  //   nextChapter();
  // };

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

  // return <View style={{ width: 100, height: 100, backgroundColor: "red" }} />;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <SwipeWrapper onSwipeLeft={nextChapter} onSwipeRight={previousChapter}>

        {isDataLoading ? (
          <ActivityIndicator />
        ) : (
          <Chapter
            data={bottomVerses}
            isInterlinear={false}
            isSplit
            verses={bottomVerses}
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
