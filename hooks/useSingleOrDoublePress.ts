import { useState, useRef, useCallback } from 'react';

type PressHandler = () => void;

type UseSingleAndDoublePress = {
    onSinglePress: PressHandler,
    onDoublePress: PressHandler,
    delay?: number
}

const useSingleAndDoublePress = ({ delay = 300, onDoublePress, onSinglePress }: UseSingleAndDoublePress): PressHandler => {
    const [pressCount, setPressCount] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handlePress = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setPressCount(prevCount => {
            const newCount = prevCount + 1;
            if (newCount === 2) {
                onDoublePress();
                setPressCount(0);
            } else {
                timeoutRef.current = setTimeout(() => {
                    onSinglePress();
                    setPressCount(0);
                }, delay);
            }

            return newCount;
        });
    }, [onDoublePress, onSinglePress, delay]);

    return handlePress;
};

export default useSingleAndDoublePress;
