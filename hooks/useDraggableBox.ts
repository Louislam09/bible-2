import { useStorage } from 'context/LocalstoreContext';
import { useState, useRef, useMemo, useEffect } from 'react';
import { PanResponder, Animated, PanResponderGestureState, PanResponderInstance, useWindowDimensions } from 'react-native';
import { OrientationType } from 'types';

interface UseDraggableElementProps {
  parentWidth?: number;
  parentHeight?: number;
  elementWidth: number;
  elementHeight: number;
}

interface UseDraggableElementReturn {
  pan: Animated.ValueXY;
  panResponder: PanResponderInstance;
}

const useDraggableElement = ({
  parentWidth,
  parentHeight,
  elementWidth,
  elementHeight,
}: UseDraggableElementProps): UseDraggableElementReturn => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const maxWidth = parentWidth || SCREEN_WIDTH;
  const maxHeight = parentHeight || SCREEN_HEIGHT;
  
  const { storedData: { floatingNoteButtonPosition }, saveData } = useStorage();

  const pan = useRef(new Animated.ValueXY(floatingNoteButtonPosition)).current;
  const [panState, setPanState] = useState(floatingNoteButtonPosition);

  const ensureWithinBounds = (x: number, y: number) => {
    const boundedX = Math.max(0, Math.min(x, maxWidth - elementWidth));
    const boundedY = Math.max(0, Math.min(y, maxHeight - elementHeight));
    return { x: boundedX, y: boundedY };
  };

  useEffect(() => {
    const { x, y } = ensureWithinBounds(panState.x, panState.y);
    pan.setValue({ x, y });
    setPanState({ x, y });
    saveData({ floatingNoteButtonPosition: { x, y } });
  }, [SCREEN_WIDTH, SCREEN_HEIGHT]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
          const newX = panState.x + gestureState.dx;
          const newY = panState.y + gestureState.dy;

          const { x: boundedX, y: boundedY } = ensureWithinBounds(newX, newY);

          pan.setValue({ x: boundedX, y: boundedY });
        },
        onPanResponderRelease: () => {
          // @ts-ignore
          const x = pan.x._value;
          // @ts-ignore
          const y = pan.y._value;
          saveData({ floatingNoteButtonPosition: { x, y } });
          setPanState({ x, y });
        },
      }),
    [pan, panState, maxWidth, maxHeight, elementWidth, elementHeight]
  );

  return { pan, panResponder };
};

export default useDraggableElement;
