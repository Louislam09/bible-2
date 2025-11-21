import React, { useEffect, useRef } from "react";
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Animated as RNAnimated,
} from "react-native";
import Svg, { G, Circle } from "react-native-svg";
import Icon from "@/components/Icon";
import { useMyTheme } from "@/context/ThemeContext";

interface NextButtonProps {
    percentage: number;
    scrollTo: () => void;
    color?: string;
}

const NextButton: React.FC<NextButtonProps> = ({ percentage, scrollTo, color }) => {
    const size = 80;
    const strokeWidth = 3;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    const progressAnimation = useRef(new RNAnimated.Value(0)).current;
    const progressRef = useRef<Circle>(null);
    const { theme } = useMyTheme();

    const animation = (toValue: number) => {
        return RNAnimated.timing(progressAnimation, {
            toValue,
            duration: 250,
            useNativeDriver: true,
        }).start();
    };

    useEffect(() => {
        animation(percentage);
    }, [percentage]);

    useEffect(() => {
        progressAnimation.addListener((value) => {
            const strokeDashoffset =
                circumference - (circumference * value.value) / 100;

            if (progressRef?.current) {
                progressRef.current.setNativeProps({
                    strokeDashoffset,
                });
            }
        });

        return () => {
            progressAnimation.removeAllListeners();
        };
    }, []);

    return (
        <View style={[styles.container, { position: "absolute", bottom: 100, left: 0, right: 0 }]}>
            <Svg width={size} height={size} style={styles.svg}>
                <G rotation="-90" origin={center}>
                    <Circle
                        stroke={theme.colors.border + "30"}
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />
                    <Circle
                        ref={progressRef}
                        stroke={color || "#4CAF50"}
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                    />
                </G>
            </Svg>
            <TouchableOpacity
                onPress={scrollTo}
                style={[styles.button, { backgroundColor: color || "#4CAF50" }]}
                activeOpacity={0.6}
            >
                <Icon name="ArrowRight" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    svg: {
        position: "absolute",
    },
    button: {
        position: "absolute",
        padding: 20,
        borderRadius: 100,
    },
});

export default NextButton;

