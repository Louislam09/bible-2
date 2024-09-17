import { useBibleContext } from "context/BibleContext";
import React, { FC } from "react";
import { Animated, StyleSheet } from "react-native";
import BookContent from "./home/content";
import CustomFooter from "./home/footer";
import SwipeWrapper from "./SwipeWrapper";
import useChangeBookOrChapter from "hooks/useChangeBookOrChapter";
import { View } from "./Themed";
import CurrentNoteDetail from "./CurrentNoteDetail";
import FloatingButton from "./FloatingButton";

const SplitTopSide: FC<any> = (props) => {
  const { navigation } = props;
  const { isSplitActived, orientation } = useBibleContext();
  const isPortrait = orientation === "PORTRAIT";
  const { nextChapter, previousChapter } = useChangeBookOrChapter({
    navigation,
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
            : props.width,
        },
        !isSplitActived && { flex: 1 },
      ]}
    >
      <SwipeWrapper {...{ onSwipeRight, onSwipeLeft }}>
        <BookContent isSplit={false} {...props} />
      </SwipeWrapper>
      <FloatingButton navigation={navigation}>
        <CurrentNoteDetail />
      </FloatingButton>
      <CustomFooter isSplit={false} {...props} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  strongContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    zIndex: 999,
    height: "60%",
  },
});

export default SplitTopSide;
