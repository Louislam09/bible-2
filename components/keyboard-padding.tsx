import Animated, {
    useAnimatedKeyboard,
    useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "./Themed";

export const KeyboardPaddingView = () => {
    const { height } = useAnimatedKeyboard();
    const { bottom } = useSafeAreaInsets();

    const keyboardHeightStyle = useAnimatedStyle(() => {
        return {
            height: Math.max(height.get(), 0),
        };
    });
    return <Animated.View style={keyboardHeightStyle} />;
}

export const MoveWithKeyboardWrapper = ({ children }: { children: React.ReactNode }) => {
    const { height } = useAnimatedKeyboard();
    const { bottom } = useSafeAreaInsets();

    const keyboardHeightStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: Math.max(height.get(), bottom) },
            ],
        };
    });
    return <Animated.View style={keyboardHeightStyle}>
        {children}
    </Animated.View>;
}
