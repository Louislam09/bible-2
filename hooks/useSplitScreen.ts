import { TTheme } from "@/types";
import { useRef, useState, useMemo } from "react";
import { Animated, PanResponder, PanResponderInstance } from "react-native";
// @ts-nocheck
export interface SplitScreenProps {
  screenWidth: number;
  screenHeight: number;
  theme: TTheme;
  minSplitSize: number;
}

export interface SplitConfig {
  minTopHeight: number;
  maxTopHeight: number;
  minWidth: number;
  maxWidth: number;
}

export interface SplitScreenState {
  topHeight: Animated.Value;
  topWidth: Animated.Value;
  bColor: Animated.Value;
  panResponder: PanResponderInstance;
  backgroundColor: Animated.AnimatedInterpolation<string>;
  resetSplitScreen: () => void;
}

export const useSplitScreen = ({
  screenWidth,
  screenHeight,
  theme,
  minSplitSize,
}: SplitScreenProps): SplitScreenState => {
  const [topHeight] = useState(() => new Animated.Value(screenHeight / 2));
  const [topWidth] = useState(() => new Animated.Value(screenWidth / 2));
  const [bColor] = useState(() => new Animated.Value(0));

  const lastTopHeight = useRef(screenHeight / 2);
  const lastTopWidth = useRef(screenWidth / 2);

  const splitConfig: SplitConfig = useMemo(
    () => ({
      minTopHeight: minSplitSize,
      maxTopHeight: screenHeight - minSplitSize,
      minWidth: minSplitSize,
      maxWidth: screenWidth - minSplitSize,
    }),
    [screenHeight, screenWidth, minSplitSize]
  );

  const animateBackgroundColor = (toValue: number) => {
    Animated.timing(bColor, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const backgroundColor = bColor.interpolate({
    inputRange: [0, 1],
    outputRange: [
      `${theme.colors.notification}30`,
      `${theme.colors.notification}90`,
    ],
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => {
          animateBackgroundColor(1);
          return true;
        },

        onPanResponderMove: (_, gestureState) => {
          const { dy, dx } = gestureState;

          const newHeight = lastTopHeight.current + dy;
          const newWidth = lastTopWidth.current + dx;

          if (
            newWidth >= splitConfig.minWidth &&
            newWidth <= splitConfig.maxWidth
          ) {
            topWidth.setValue(newWidth);
          }

          if (
            newHeight >= splitConfig.minTopHeight &&
            newHeight <= splitConfig.maxTopHeight
          ) {
            topHeight.setValue(newHeight);
          }
        },

        onPanResponderRelease: () => {
          animateBackgroundColor(0);
          // @ts-ignore
          lastTopHeight.current = topHeight._value;
          // @ts-ignore
          lastTopWidth.current = topWidth._value;
        },

        onPanResponderTerminate: () => {
          animateBackgroundColor(0);
          // @ts-ignore
          lastTopHeight.current = topHeight._value;
          // @ts-ignore
          lastTopWidth.current = topWidth._value;
        },
      }),
    [splitConfig, topHeight, topWidth, animateBackgroundColor]
  );

  const resetSplitScreen = () => {
    Animated.parallel([
      Animated.timing(topHeight, {
        toValue: screenHeight / 2,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(topWidth, {
        toValue: screenWidth / 2,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      lastTopHeight.current = screenHeight / 2;
      lastTopWidth.current = screenWidth / 2;
    });
  };

  useMemo(() => {
    // @ts-ignore
    const currentHeight = topHeight._value;
    // @ts-ignore
    const currentWidth = topWidth._value;

    if (currentHeight > splitConfig.maxTopHeight) {
      topHeight.setValue(splitConfig.maxTopHeight);
      lastTopHeight.current = splitConfig.maxTopHeight;
    }

    if (currentWidth > splitConfig.maxWidth) {
      topWidth.setValue(splitConfig.maxWidth);
      lastTopWidth.current = splitConfig.maxWidth;
    }
  }, [screenHeight, screenWidth, splitConfig]);

  const value = useMemo(() => {
    return {
      topHeight,
      topWidth,
      bColor,
      panResponder,
      backgroundColor,
      resetSplitScreen,
    };
  }, [
    {
      topHeight,
      topWidth,
      bColor,
      panResponder,
      backgroundColor,
      resetSplitScreen,
    },
  ]);

  return value;
};
