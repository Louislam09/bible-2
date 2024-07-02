import React, { FC } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import BookContent from "./home/content";
import CustomFooter from "./home/footer";

const SplitTopSide: FC<any> = (props) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  return (
    <View style={[styles.container, { height: SCREEN_HEIGHT / 2 }]}>
      <BookContent {...props} />
      <CustomFooter {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    // borderColor: "red",
    // borderTopWidth: 2,
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
