import React, { useRef, useState, useEffect } from "react";
import {
  View,
  PanResponder,
  Animated,
  StyleSheet,
  Dimensions,
  PanResponderGestureState,
  useWindowDimensions,
} from "react-native";
import { Text } from "./Themed";

interface AdjustableSplitScreenProps {
  initialTopHeight: number;
  minTopHeight?: number;
  maxTopHeight?: number;
}

const AdjustableSplitScreen: React.FC<AdjustableSplitScreenProps> = ({
  initialTopHeight,
  minTopHeight = 100,
  maxTopHeight = 500,
}) => {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const [topHeight] = useState(new Animated.Value(initialTopHeight));
  const screenHeight = useRef(SCREEN_HEIGHT).current;
  const lastTopHeight = useRef(initialTopHeight);

  useEffect(() => {
    const updateScreenHeight = () => {
      const newHeight = Dimensions.get("window").height;
      topHeight.setValue(newHeight);
    };

    Dimensions.addEventListener("change", updateScreenHeight);

    return () => {};
  }, [topHeight]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
      const newHeight = lastTopHeight.current + gestureState.dy;
      if (newHeight >= minTopHeight && newHeight <= maxTopHeight) {
        topHeight.setValue(newHeight);
      }
    },
    onPanResponderRelease: () => {
      lastTopHeight.current = (topHeight as any)._value;
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.topSection, { height: topHeight }]}>
        {/* Content for top section */}
        <Text>Content for top section</Text>
      </Animated.View>
      <View {...panResponder.panHandlers} style={styles.slider}>
        <View style={styles.sliderHandle} />
      </View>
      <Animated.View
        style={[
          styles.bottomSection,
          {
            height: Animated.subtract(
              new Animated.Value(screenHeight),
              topHeight
            ),
          },
        ]}
      >
        {/* Content for bottom section */}
        <Text>Content for bottom section</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    backgroundColor: "#1e1e1e",
  },
  bottomSection: {
    backgroundColor: "#1e1e1e",
  },
  slider: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
  },
  sliderHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#00ffff",
    borderRadius: 2,
  },
});

export default AdjustableSplitScreen;
