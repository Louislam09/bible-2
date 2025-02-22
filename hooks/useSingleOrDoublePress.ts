import { useRef, useCallback } from "react";

type PressHandler = () => void;

type UseSingleAndDoublePress = {
  onSinglePress: PressHandler;
  onDoublePress: PressHandler;
  delay?: number;
};

const useSingleAndDoublePress = ({
  delay = 300,
  onDoublePress,
  onSinglePress,
}: UseSingleAndDoublePress): PressHandler => {
  const pressCount = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePress = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    pressCount.current += 1;

    if (pressCount.current === 2) {
      onDoublePress();
      pressCount.current = 0;
    } else {
      timeoutRef.current = setTimeout(() => {
        onSinglePress();
        pressCount.current = 0;
      }, delay);
    }
  }, [onSinglePress, onDoublePress, delay]);

  return handlePress;
};

export default useSingleAndDoublePress;
