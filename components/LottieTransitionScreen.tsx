import LottieView, { AnimationObject } from 'lottie-react-native';
import React, { FC, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { icons } from 'lucide-react-native';
import Icon from './Icon';

type ScreenWithAnimationProps = {
    children: React.ReactNode;
    animationSource?: string | AnimationObject | { uri: string };
    icon?: keyof typeof icons;
    title?: string;
    speed?: number;
    duration?: number;
};

const ScreenWithAnimation: FC<ScreenWithAnimationProps> = ({
    children,
    speed = 1,
    title,
    animationSource,
    icon,
    duration = 1500
}) => {
    const [isAnimating, setIsAnimating] = useState(true);
    const opacity = useRef(new Animated.Value(0)).current;
    const bounceValue = useRef(new Animated.Value(0)).current;
    const theme = useTheme();

    const onAnimationFinish = (isCancelled: boolean) => {
        setIsAnimating(false);
    };

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
        }).start(({ finished }) => onAnimationFinish(finished))

        if (icon && !animationSource) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bounceValue, {
                        toValue: -10,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(bounceValue, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start()
        }
    }, [opacity, bounceValue, icon, animationSource, duration]);

    return (
        <View style={{ flex: 1 }}>
            {isAnimating && (
                <View style={styles.animationContainer}>
                    {animationSource ? (
                        <LottieView
                            source={animationSource}
                            autoPlay
                            speed={speed}
                            loop={false}
                            style={{ width: 300, height: 300 }}
                            onAnimationFinish={onAnimationFinish}
                        />
                    ) : (
                        icon && (
                            <Animated.View style={{ transform: [{ translateY: bounceValue }], opacity }}>
                                <Icon name={icon} size={100} color={theme.colors.text} />
                            </Animated.View>
                        )
                    )}
                    {title && <Animated.Text style={{ color: theme.colors.text, fontSize: 28, opacity }}>{title}</Animated.Text>}
                </View>
            )}

            {!isAnimating && children}
        </View>
    );
};

export default ScreenWithAnimation;

const styles = StyleSheet.create({
    animationContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
