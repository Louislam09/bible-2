import ProgressBar from "@/components/home/footer/ProgressBar";
import BibleHeader from "@/components/home/header/BibleHeader";
import { useBibleContext } from "@/context/BibleContext";
import useChangeBookOrChapter from "@/hooks/useChangeBookOrChapter";
import { bibleState$ } from "@/state/bibleState";
import { use$ } from "@legendapp/state/react";
import { useTheme } from "@/context/ThemeContext";
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const { theme } = useTheme();
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
    return Math.min(verse, Math.max(0, verses.length - 1));
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
  const headerHeight = useRef(new Animated.Value(1)).current;
  const footerHeight = useRef(new Animated.Value(1)).current;

  const handleScroll = useCallback((direction: "up" | "down") => {
    const toValue = direction === "up" ? 1 : 0;
    Animated.parallel([
      Animated.timing(headerHeight, {
        toValue,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(footerHeight, {
        toValue,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const containerStyle = useMemo(
    () => ({
      [widthOrHeight]: props[widthOrHeight],
      flex: isSplitActived ? undefined : 1,
      backgroundColor: theme.colors.background,
    }),
    [widthOrHeight, props, isSplitActived, theme.colors.background]
  );

  const headerStyle = {
    transform: [{ scaleY: headerHeight }],
    opacity: headerHeight,
  };

  const footerStyle = {
    transform: [{ scaleY: footerHeight }],
    opacity: footerHeight,
  };

  const progressTranslateY = headerHeight.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 28, 47],
  });

  const progressStyle = {
    transform: [{ translateY: progressTranslateY }],
    opacity: 1,
  };

  const currentHistoryIndexState = use$(() =>
    bibleState$.currentHistoryIndex.get()
  );
  const progressValue = useMemo(() => {
    return (currentHistoryIndexState || 0) / (verses?.length || 10);
  }, [currentHistoryIndexState, verses]);

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.header, headerStyle]}>
        <BibleHeader />
      </Animated.View>
      {!isSplitActived && (
        <Animated.View style={[styles.progressContainer, progressStyle]}>
          <ProgressBar
            hideCircle
            height={4}
            color={theme.colors.notification}
            barColor={theme.colors.text}
            progress={progressValue}
            circleColor={theme.colors.notification}
          />
        </Animated.View>
      )}
      <SwipeWrapper {...{ onSwipeRight, onSwipeLeft }}>
        {isDataLoading ? (
          <ActivityIndicator />
        ) : (
          <Chapter
            verses={verses}
            isSplit={false}
            estimatedReadingTime={0}
            initialScrollIndex={
              initialScrollIndex === 1 ? 0 : initialScrollIndex || 0
            }
            onScroll={handleScroll}
          />
        )}
      </SwipeWrapper>
      <Animated.View style={[styles.footer, footerStyle]}>
        <BibleFooter isSplit={false} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  progressContainer: {
    position: "absolute",
    width: "100%",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 8,
  },
});

export default BibleTop;
// export default withRenderCount(BibleTop);
