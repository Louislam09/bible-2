import React, { useRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Animated, StyleSheet, Text, View } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";

const AdjustableSplitScreen = ({ theme }: any) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const onPanGestureEvent = Animated.event<PanGestureHandlerGestureEvent>(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  React.useEffect(() => {
    console.log({ translateY });
  }, [translateY]);

  return (
    <PanGestureHandler onGestureEvent={onPanGestureEvent}>
      <Animated.View
        style={{
          backgroundColor: theme.colors.background,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Animated.View
          style={[
            {
              width: "100%",
              borderColor: "green",
              borderTopWidth: 2,
              position: "relative",
              height: 15,
            },
            {
              transform: [
                { translateX: translateX },
                { translateY: translateY },
              ],
            },
          ]}
        >
          <View
            style={{
              width: 15,
              height: 15,
              backgroundColor: "red",
              borderRadius: 50,
              zIndex: 99,
              ...StyleSheet.absoluteFillObject,
            }}
          />
          {/* <MaterialCommunityIcons
            color={theme.colors.notification}
            name={"arrow-split-horizontal"}
            size={35}
          /> */}
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default AdjustableSplitScreen;
