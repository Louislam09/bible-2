import Icon from "@/components/Icon";
import { View } from "@/components/Themed";
import { bibleState$ } from "@/state/bibleState";
import { favoriteState$ } from "@/state/favoriteState";
import { TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';

interface ActionButtonProps {
    item: {
        bottom: number;
        name: string;
        color: string;
        action: () => void;
        label?: string;
        hide?: boolean;
        isSync?: boolean;
        isDownload?: boolean;
    };
    index: number;
    theme: any;
}


export const Backdrop = ({ visible, onPress, theme }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [shouldRender, setShouldRender] = useState(visible);
    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.in(Easing.cubic),
            }).start(() => {
                setShouldRender(false);
            });
        }
    }, [visible]);

    if (!shouldRender) return null;

    return (
        <TouchableWithoutFeedback onPress={onPress}>
            <Animated.View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,.6)",
                    opacity: fadeAnim,
                    zIndex: 1,
                }}
            />
        </TouchableWithoutFeedback>
    );
};

const ActionButton = ({ item, index, theme }: ActionButtonProps) => {
    const styles = getStyles(theme);
    const isDark = theme.dark;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const translateYAnim = useRef(new Animated.Value(50)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const syncRotateAnim = useRef(new Animated.Value(0)).current;
    const isSyncingNotes = use$(() => bibleState$.isSyncingNotes.get() || favoriteState$.isLoading.get())

    useEffect(() => {
        const showAnimation = Animated.sequence([
            Animated.delay(index * 100),
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.cubic),
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.spring(translateYAnim, {
                    toValue: 0,
                    friction: 7,
                    tension: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.back(1.5)),
                }),
            ]),
        ]);

        const hideAnimation = Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.in(Easing.cubic),
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.5,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: 50,
                duration: 200,
                useNativeDriver: true,
            }),
        ]);

        if (item.hide) {
            hideAnimation.start();
        } else {
            showAnimation.start();
        }
    }, [fadeAnim, scaleAnim, translateYAnim, rotateAnim, index, item.hide]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["45deg", "0deg"],
    });

    const startRotation = () => {
        Animated.loop(
            Animated.timing(syncRotateAnim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };

    const stopRotation = () => {
        syncRotateAnim.stopAnimation();
        syncRotateAnim.setValue(0);
    };

    useEffect(() => {
        if (!item.isSync) return
        if (isSyncingNotes) {
            startRotation()
        } else {
            stopRotation()
        }
    }, [item.isSync, isSyncingNotes])

    const rotate = syncRotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["-360deg", "0deg"],
    });

    return (
        <View style={{ flexGrow: 0, zIndex: 11 }}>
            {item.label && <Animated.Text
                style={[
                    {
                        fontSize: 18,
                        position: "absolute",
                        color: "white",
                        right: 80,
                        bottom: item.bottom + 10,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 8,
                        backgroundColor: isDark ? theme.colors.background + 80 : 'black',
                    },
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
                    },
                ]}
            >
                {item.label}
            </Animated.Text>}

            <Animated.View
                key={`button-${item.name}`}
                style={[
                    styles.scrollToTopButton,
                    {
                        bottom: item.bottom,
                        backgroundColor: item.color,
                    },
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: translateYAnim },
                            { scale: scaleAnim },
                            { rotate: spin },
                        ],
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={() => item.action()}
                    disabled={isSyncingNotes}
                    style={{
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {(item.isSync || item.isDownload) && isSyncingNotes ? (
                        <Animated.View style={{ transform: [{ rotate }] }}>
                            <Icon color={"#fff"} name={(item.isSync || item.isDownload) ? 'Loader' : item.name as any} size={30} />
                        </Animated.View>
                    ) : (
                        <Icon color={"#fff"} name={item.name as any} size={30} />
                    )}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const getStyles = ({ colors, dark }: TTheme) =>
    StyleSheet.create({
        scrollToTopButton: {
            position: "absolute",
            right: 20,
            backgroundColor: colors.notification + 99,
            padding: 10,
            borderRadius: 10,
            elevation: 3,
            borderWidth: 0,
            borderColor: colors.notification,
        },
    });

export default ActionButton;