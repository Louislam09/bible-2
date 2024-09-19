import { NavigationProp, NavigationState, useTheme } from '@react-navigation/native';
import { iconSize } from 'constants/size';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native';
import { TTheme } from 'types';
import Icon from './Icon';
import { useBibleContext } from 'context/BibleContext';

type FloatingButtonProps = {
    navigation: Omit<NavigationProp<ReactNavigation.RootParamList>, "getState"> & {
        getState(): NavigationState | undefined;
    },
    children: React.ReactNode,
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ navigation, children }) => {
    const theme = useTheme();
    const styles = getStyles(theme);
    const { currentNoteId, setCurrentNoteId, addToNoteText } = useBibleContext()
    const [expanded, setExpanded] = useState(false);
    const animation = useRef<Animated.Value>(new Animated.Value(0)).current;
    const floatingButtonSize = 60
    const animationDuration = 300
    const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

    useEffect(() => {
        if (!currentNoteId) return
        expandAnimation()
    }, [currentNoteId, addToNoteText])

    const collapseAnimation = (shouldClose = false) => {
        Animated.timing(animation, {
            toValue: 0,
            duration: animationDuration,
            easing: Easing.ease,
            useNativeDriver: false,
        }).start(() => {
            setExpanded(false)
            if (shouldClose) setTimeout(() => setCurrentNoteId(null), 100);
        });
    }

    const expandAnimation = () => {
        Animated.timing(animation, {
            toValue: 1,
            duration: animationDuration,
            easing: Easing.ease,
            useNativeDriver: false,
        }).start(() => {
            setExpanded(true);
        });
    }

    const toggleExpand = (): void => {
        if (expanded) {
            collapseAnimation()
        } else {
            expandAnimation()
        }
    };

    const containerHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [floatingButtonSize, screenHeight],
    });

    const containerWidth = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [floatingButtonSize, screenWidth],
    });

    const borderRadius = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [30, 0],
    });

    const bottom = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ["50%", "0%"],
    });

    const right = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
    })

    const backgroundColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.notification, theme.colors.background],
    });
    const opacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const containerAnimatedStyle = {
        width: containerWidth,
        height: !expanded ? containerHeight : animation.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "100%"],
        }),
        borderRadius,
        bottom,
        right,
        backgroundColor,
    }

    const onCloseFloatingButton = () => {
        collapseAnimation(true)
    }

    return (
        <Animated.View style={[styles.expandedContainer, containerAnimatedStyle, currentNoteId === null && { display: 'none' }]}>
            {!expanded ? (
                <TouchableOpacity
                    onPress={toggleExpand}
                    style={{ zIndex: 999 }}
                >
                    <Animated.View style={[styles.floatingButton]}>
                        <Icon name='NotebookText' color='white' size={iconSize} />
                    </Animated.View>
                </TouchableOpacity>
            ) : (
                <>
                    <View style={styles.header}>
                        <TouchableOpacity style={{}} onPress={toggleExpand}>
                            <Icon name='ChevronDown' color={theme.colors.notification} size={iconSize} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{}} onPress={onCloseFloatingButton}>
                            <Icon name='X' color={"#e74856"} size={iconSize} />
                        </TouchableOpacity>
                    </View>
                    <Animated.View style={[
                        styles.content,
                        { opacity }
                    ]}>
                        {children}
                    </Animated.View>
                </>
            )}
        </Animated.View>
    );
};

const getStyles = ({ colors }: TTheme) => StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.notification,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 9999,
    },
    expandedContainer: {
        position: 'absolute',
        backgroundColor: colors.background,
        zIndex: 9999,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    content: {
        flex: 1,
    },
});

export default FloatingButton;