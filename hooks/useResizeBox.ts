import { useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  PanResponderGestureState,
  PanResponderInstance,
  useWindowDimensions,
} from "react-native";
import { TTheme } from "types";

interface UseResizableBoxProps {
  theme: TTheme;
}

interface UseResizableBoxReturn {
  topHeight: Animated.Value;
  topWidth: Animated.Value;
  _backgroundColor: Animated.AnimatedInterpolation<string | number>;
  panResponder: PanResponderInstance;
}

const useResizableBox = ({
  theme,
}: UseResizableBoxProps): UseResizableBoxReturn => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const [topHeight] = useState(new Animated.Value(SCREEN_HEIGHT / 2));
  const [topWidth] = useState(new Animated.Value(SCREEN_WIDTH / 2));
  const lastTopHeight = useRef(SCREEN_HEIGHT);
  const lastTopWidth = useRef(SCREEN_WIDTH);
  const minTopHeight = 50;
  const maxTopHeight = SCREEN_HEIGHT - 200;
  const [bColor] = useState(new Animated.Value(0));

  const animateBackgroundColorStart = () => {
    Animated.timing(bColor, {
      toValue: 1,
      delay: 100,
      useNativeDriver: false,
    }).start();
  };

  const animateBackgroundColorEnd = () => {
    Animated.timing(bColor, {
      toValue: 0,
      delay: 100,
      useNativeDriver: false,
    }).start();
  };

  const _backgroundColor = useMemo(
    () =>
      bColor.interpolate({
        inputRange: [0, 1],
        outputRange: [
          theme.colors.notification + "10",
          theme.colors.notification + "90",
        ],
      }),
    [bColor, theme]
  );

  const panResponder: PanResponderInstance = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (): boolean => {
          animateBackgroundColorStart();
          return true;
        },
        onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
          const newHeight = lastTopHeight.current + gestureState.dy;
          const newWidth = lastTopWidth.current + gestureState.dx;
          if (newWidth >= 200 && newWidth <= SCREEN_WIDTH - 200) {
            topWidth.setValue(newWidth);
          }
          if (newHeight >= minTopHeight && newHeight <= maxTopHeight) {
            topHeight.setValue(newHeight);
          }
        },
        onPanResponderRelease: () => {
          animateBackgroundColorEnd();
          lastTopHeight.current = (topHeight as any)._value;
          lastTopWidth.current = (topWidth as any)._value;
        },
      }),
    [animateBackgroundColorStart, animateBackgroundColorEnd]
  );

  return {
    topHeight,
    topWidth,
    _backgroundColor,
    panResponder,
  };
};

export default useResizableBox;
