import React, { useRef } from "react";
import {
  View,
  Animated,
  StyleSheet,
  ScrollView,
  PanResponder,
  Text,
  Button,
} from "react-native";

export default function BrowserZoomView({ children }) {
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const pinchDistance = useRef(0);

  // Pinch gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastScale.current = scale.__getValue();
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.numberActiveTouches === 2) {
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];

          const dx = touch1.pageX - touch2.pageX;
          const dy = touch1.pageY - touch2.pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (pinchDistance.current !== 0) {
            let scaleFactor = distance / pinchDistance.current;
            let newScale = lastScale.current * scaleFactor;

            if (newScale < 1) newScale = 1; // Minimum zoom (100%)
            if (newScale > 3) newScale = 3; // Maximum zoom (300%)

            scale.setValue(newScale);
          }
          pinchDistance.current = distance;
        }
      },
      onPanResponderRelease: () => {
        pinchDistance.current = 0;
      },
    })
  ).current;

  // Function to zoom in programmatically
  const zoomIn = () => {
    Animated.timing(scale, {
      toValue: Math.min(scale.__getValue() + 0.5, 7), // Max zoom is 3
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Function to zoom out programmatically
  const zoomOut = () => {
    Animated.timing(scale, {
      toValue: Math.max(scale.__getValue() - 0.5, 0.1), // Min zoom is 1
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      maximumZoomScale={7}
      minimumZoomScale={0.5}
      pinchGestureEnabled={true}
      {...panResponder.panHandlers}
    >
      <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
        {children}
      </Animated.View>

      {/* Zoom buttons */}
      <View style={styles.buttonsContainer}>
        <Button title="Zoom In" onPress={zoomIn} />
        <Button title="Zoom Out" onPress={zoomOut} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonsContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
});
