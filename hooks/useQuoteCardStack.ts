import { useRef, useMemo } from "react";
import { Animated, PanResponder, Dimensions } from "react-native";

interface UseQuoteCardStackProps {
  currentIndex: number;
  totalTemplates: number;
  onIndexChange: (newIndex: number) => void;
}

export const useQuoteCardStack = ({
  currentIndex,
  totalTemplates,
  onIndexChange,
}: UseQuoteCardStackProps) => {
  const screenWidth = Dimensions.get("window").width;
  const pan = useRef(new Animated.ValueXY()).current;

  const rotate = pan.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const currentCardScale = pan.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: [0.95, 1, 0.95],
    extrapolate: "clamp",
  });

  const currentCardOpacity = pan.x.interpolate({
    inputRange: [-screenWidth / 3, 0, screenWidth / 3],
    outputRange: [0.8, 1, 0.8],
    extrapolate: "clamp",
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          const threshold = screenWidth * 0.25;
          const velocity = gesture.vx;

          const swipeRight = gesture.dx > threshold || velocity > 0.5;
          const swipeLeft = gesture.dx < -threshold || velocity < -0.5;

          let nextIndex = currentIndex;
          if (swipeRight && currentIndex > 0) {
            nextIndex = currentIndex - 1;
          } else if (swipeLeft && currentIndex < totalTemplates - 1) {
            nextIndex = currentIndex + 1;
          }

          if (nextIndex !== currentIndex) {
            Animated.timing(pan, {
              toValue: {
                x: nextIndex > currentIndex ? -screenWidth : screenWidth,
                y: gesture.dy,
              },
              duration: 250,
              useNativeDriver: false,
            }).start(() => {
              onIndexChange(nextIndex);
              pan.setValue({ x: 0, y: 0 });
            });
          } else {
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
              tension: 40,
              friction: 7,
            }).start();
          }
        },
      }),
    [currentIndex, totalTemplates, screenWidth, onIndexChange]
  );

  const renderCardRange = useMemo(() => {
    const indices = [];

    // Include previous card if available
    if (currentIndex > 0) {
      indices.push(currentIndex - 1);
    }

    // Always include the current card
    indices.push(currentIndex);

    // Include next cards if available
    if (currentIndex < totalTemplates - 1) {
      indices.push(currentIndex + 1);
    }
    if (currentIndex < totalTemplates - 2) {
      indices.push(currentIndex + 2);
    }

    return indices;
  }, [currentIndex, totalTemplates]);

  return {
    pan,
    rotate,
    currentCardScale,
    currentCardOpacity,
    panResponder,
    renderCardRange,
    screenWidth,
  };
};
