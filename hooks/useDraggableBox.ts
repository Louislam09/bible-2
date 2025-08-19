import { bibleState$ } from "@/state/bibleState";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  PanResponderGestureState,
  PanResponderInstance,
  useWindowDimensions,
} from "react-native";

interface UseDraggableElementProps {
  parentWidth?: number;
  parentHeight?: number;
  elementWidth: number;
  elementHeight: number;
  onPressAction: () => void;
  enabled: boolean;
}

interface UseDraggableElementReturn {
  pan: Animated.ValueXY;
  panResponder: PanResponderInstance;
}

const TOUCH_SLOP = 5; // Threshold to differentiate between tap and drag

const useDraggableElement = ({
  parentWidth,
  parentHeight,
  elementWidth,
  elementHeight,
  onPressAction,
  enabled,
}: UseDraggableElementProps): UseDraggableElementReturn => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const maxWidth = parentWidth || SCREEN_WIDTH;
  const maxHeight = parentHeight || SCREEN_HEIGHT;
  const floatingNoteButtonPosition =
    bibleState$.floatingNoteButtonPosition.get();
  const pan = useRef(new Animated.ValueXY(floatingNoteButtonPosition)).current;
  const [panState, setPanState] = useState(floatingNoteButtonPosition);
  const isTappedRef = useRef(false);

  const ensureWithinBounds = (x: number, y: number) => {
    const boundedX = Math.max(0, Math.min(x, maxWidth - elementWidth));
    const boundedY = Math.max(0, Math.min(y, maxHeight - elementHeight));
    return { x: boundedX, y: boundedY };
  };

  useEffect(() => {
    if (!enabled) return;
    const { x, y } = ensureWithinBounds(panState.x, panState.y);
    pan.setValue({ x, y });
    setPanState({ x, y });
    bibleState$.handleFloatingNoteButtonPosition(x, y);
  }, [SCREEN_WIDTH, SCREEN_HEIGHT, enabled]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          isTappedRef.current = true;
        },
        onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
          const newX = panState.x + gestureState.dx;
          const newY = panState.y + gestureState.dy;

          const { x: boundedX, y: boundedY } = ensureWithinBounds(newX, newY);
          if (
            Math.abs(gestureState.dx) > TOUCH_SLOP ||
            Math.abs(gestureState.dy) > TOUCH_SLOP
          ) {
            isTappedRef.current = false;
          }
          pan.setValue({ x: boundedX, y: boundedY });
        },
        onPanResponderRelease: () => {
          if (isTappedRef.current) {
            onPressAction?.();
            return;
          }
          // @ts-ignore
          const x = pan.x._value;
          // @ts-ignore
          const y = pan.y._value;
          bibleState$.handleFloatingNoteButtonPosition(x, y);
          setPanState({ x, y });
        },
      }),
    [pan, panState, maxWidth, maxHeight, elementWidth, elementHeight]
  );

  return { pan, panResponder };
};

export default useDraggableElement;
