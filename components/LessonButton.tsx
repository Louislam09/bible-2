import { Check, Crown, Star } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type LessonButtonProps = {
    type: 'start' | 'star' | 'crown';
    completed: boolean;
    isCurrent: boolean;
    label?: string;
    action: () => void;
};

const LessonButton: React.FC<LessonButtonProps> = ({ action, type, completed, label, isCurrent }) => {
    const buttonStyles = [
        styles.button,
        (completed || isCurrent) ? styles.buttonCompleted : styles.buttonIncomplete,
    ];

    const Icon = (type === 'start' || completed) ? Check : type === 'star' ? Star : Crown;

    const bounceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isCurrent) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bounceAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(bounceAnim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [isCurrent]);

    // const disabled = !isCurrent && !completed
    const disabled = false
    const bounce = bounceAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10],
    });

    return (
        <View style={styles.lessonContainer}>
            {/* {isCurrent && (
                <Animated.View style={[styles.tooltipContainer, { transform: [{ translateX: -60 }, { translateY: bounce }] }]}>
                    <View style={styles.tooltip}>
                        <Text style={[styles.label]}>
                            {label}
                        </Text>
                    </View>
                    <View style={styles.tooltipArrow} />
                </Animated.View>
            )} */}
            <TouchableOpacity onPress={action} disabled={disabled} style={styles.base}>
                <View style={styles.shadow} />
                <View style={buttonStyles}>
                    <Icon
                        fill={disabled ? "#c4c4c4" : "transparent"}
                        strokeWidth={2}
                        color={disabled ? "#c4c4c4" : "#fff"}
                        size={40}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    lessonContainer: {
        alignItems: 'center',
    },
    labelContainer: {
        position: 'absolute',
        top: -32,
        left: 0,
        right: 0,
        alignItems: 'center',
        backgroundColor: 'red'
    },
    label: {
        width: '100%',
        fontSize: 18,
        fontWeight: 500,
        textTransform: 'uppercase',
        color: '#10b981',
    },
    labelCompleted: {
        color: '#10b981',
    },
    labelIncomplete: {
        color: '#9ca3af',
    },
    base: {
        position: 'relative',
        width: 65,
        height: 65,
    },
    shadow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 30,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 9,
    },
    button: {
        width: 65,
        height: 65,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        transform: [{ translateY: -2 }],
    },
    buttonCompleted: {
        backgroundColor: '#10b981',
        color: '#fff',
    },
    buttonIncomplete: {
        backgroundColor: '#e5e7eb',
        color: '#9ca3af',
    },
    tooltipContainer: {
        position: 'absolute',
        top: -55,
        left: "50%",
        zIndex: 10,
        transform: [{ translateX: -60 }],
        alignItems: 'center',
    },
    tooltip: {
        backgroundColor: '#eee',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 10,
    },
    tooltipArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 6,
        borderStyle: 'solid',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#eee',
        marginTop: -1,
        transform: [{ rotate: '180deg' }],
    },
});

export default LessonButton;
