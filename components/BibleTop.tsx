import { useBibleContext } from "@/context/BibleContext";
import useChangeBookOrChapter from "@/hooks/useChangeBookOrChapter";
import React, { FC } from "react";
import { Animated, StyleSheet } from "react-native";
import BookContent from "./home/content";
import BibleFooter from "./home/footer/BibleFooter";
import SwipeWrapper from "./SwipeWrapper";

const BibleTop: FC<any> = (props) => {
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
