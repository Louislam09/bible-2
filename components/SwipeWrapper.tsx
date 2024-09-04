import React, { forwardRef, useRef } from "react";
import { Animated, StyleSheet, useWindowDimensions, View } from "react-native";
import {
  Directions,
  FlingGestureHandler,
  GestureHandlerRootView,
  State,
} from "react-native-gesture-handler";

interface SwipeWrapperProps {
  children: React.ReactNode;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
}

const SwipeWrapper = forwardRef<View, SwipeWrapperProps>(
  ({ children, onSwipeRight, onSwipeLeft }, ref) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const { width: SCREEN_WIDTH } = useWindowDimensions();

    const handleSwipe = (direction: "left" | "right") => {
      let toValue = 0;
      if (direction === "left") {
        toValue = -SCREEN_WIDTH;
      } else if (direction === "right") {
        toValue = SCREEN_WIDTH;
      }

      Animated.timing(translateX, {
        toValue,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        if (direction === "left") {
          onSwipeLeft();
        } else {
          onSwipeRight();
        }
        translateX.setValue(0);
      });
    };

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <FlingGestureHandler
          direction={Directions.LEFT}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.END) {
              handleSwipe("left");
            }
          }}
        >
          <FlingGestureHandler
            direction={Directions.RIGHT}
            onHandlerStateChange={({ nativeEvent }) => {
              if (nativeEvent.state === State.END) {
                handleSwipe("right");
              }
            }}
          >
            <Animated.View
              style={{ flex: 1, transform: [{ translateX }] }}
              ref={ref} // Forward the ref
            >
              {children}
            </Animated.View>
          </FlingGestureHandler>
        </FlingGestureHandler>
      </GestureHandlerRootView>
    );
  }
);

export default SwipeWrapper;

const styles = StyleSheet.create({});
