import { useState, useRef, useCallback, useEffect } from 'react';

type PressHandler = () => void;

type UseSingleAndDoublePress = {
    onSinglePress: PressHandler,
    onDoublePress: PressHandler,
    delay?: number
}

const useSingleAndDoublePress = ({ delay = 300, onDoublePress, onSinglePress }: UseSingleAndDoublePress): PressHandler => {
    const [pressCount, setPressCount] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (pressCount === 0) return
        if (pressCount === 2) {
            onDoublePress();
            setPressCount(0);
        } else {
            timeoutRef.current = setTimeout(() => {
                onSinglePress();
                setPressCount(0);
            }, delay);
        }
    }, [pressCount])

    const handlePress = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setPressCount(prevCount => prevCount + 1);
    }, [onDoublePress, onSinglePress, delay]);

    return handlePress;
};

export default useSingleAndDoublePress;
