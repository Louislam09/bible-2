import { StyleSheet, View } from "react-native";

import Animated from "react-native-reanimated";

import { Text } from "@/components/Themed";
import { TabBarHeight } from "./constants";
import { ExpandedSheet } from "./expanded-sheet";

type TabBarProps = {
  activeIndex: number;
};

const TabBar = ({ activeIndex }: TabBarProps) => {
  return (
    <View style={styles.container}>
      <ExpandedSheet />
      <Animated.View style={styles.tabsContainer}>
        <Text>Hello</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    flexDirection: "row",
    height: TabBarHeight,
    justifyContent: "space-between",
    left: 0,
    position: "absolute",
    right: 0,
  },
  tabsContainer: {
    ...StyleSheet.absoluteFillObject,
    bottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export { TabBar };
