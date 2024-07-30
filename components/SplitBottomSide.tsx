import React, { FC } from "react";
import { Animated, StyleSheet, useWindowDimensions, View } from "react-native";
import BookContent from "./home/content";
import CustomFooter from "./home/footer";
import { useBibleContext } from "context/BibleContext";

const SplitBottomSide: FC<any> = (props) => {
  const { isSplitActived, orientation } = useBibleContext();
  const isPortrait = orientation === "PORTRAIT";
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
      <BookContent isSplit {...props} />
      <CustomFooter isSplit {...props} />
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

export default SplitBottomSide;
