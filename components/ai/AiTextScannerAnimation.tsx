import { TTheme } from "@/types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { Text } from "../Themed";

// Paleta de colores AI suave
const COLOR_SETS = [
    ["#4FC3F7", "#81D4FA"], // Azul
    ["#81C784", "#A5D6A7"], // Verde
    ["#FFD54F", "#FFE082"], // Amarillo
];

const AiTextScannerAnimation: React.FC<{
    verse: string;
    fontSize: number;
    theme: TTheme;
    style?: any,
    noTitle?: boolean
}> = ({ verse, fontSize, theme, style, noTitle = false }) => {
    const words = verse.split(" ");
    const [activeIndexes, setActiveIndexes] = useState<number[]>([]);
    useEffect(() => {
        const interval = setInterval(() => {
            const newIndexes: number[] = [];
            const count = 3;
            for (let i = 0; i < count; i++) {
                const index = Math.floor(Math.random() * words.length);
                if (!newIndexes.includes(index)) newIndexes.push(index);
            }
            setActiveIndexes(newIndexes);
        }, 300);
        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <View style={styles.wrapper}>
            {!noTitle && <Text
                style={{
                    fontSize: fontSize * 0.85,
                    color: theme.colors.text,
                    marginBottom: 12,
                    textAlign: "center",
                }}
            >
                Analizando el versículo...
            </Text>}

            <View style={[styles.lineWrap, style]}>
                {words.map((word, index) => {
                    const colorSet = COLOR_SETS[index % COLOR_SETS.length];
                    return (
                        <AnimatedWord
                            mainColor={theme.colors.text}
                            key={index}
                            word={word}
                            active={activeIndexes.includes(index)}
                            fontSize={fontSize}
                            colors={colorSet}
                        />
                    );
                })}
            </View>
        </View>
    );
};

const AnimatedWord: React.FC<{
    word: string;
    active: boolean;
    fontSize: number;
    colors: string[];
    mainColor: string
}> = ({ word, active, fontSize, colors, mainColor }) => {
    const pulse = useSharedValue(0);

    useEffect(() => {
        if (active) {
            pulse.value = withTiming(1, {
                duration: 1000,
                easing: Easing.linear,
            }, () => {
                pulse.value = 0;
            });
        }
    }, [active]);

    const color = useDerivedValue(() =>
        interpolateColor(pulse.value, [0, 1], colors)
    );

    const style = useAnimatedStyle(() => ({
        color: active ? color.value : mainColor,
        opacity: active ? 1 : 0.7,
        transform: [{ scale: withTiming(active ? 1.1 : 1, { duration: 150 }) }],
    }));

    return (
        <Animated.Text style={[styles.word, { fontSize }, style]}>
            {word}{" "}
        </Animated.Text>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    lineWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    word: {
        fontWeight: "600",
    },
});

export default AiTextScannerAnimation;
