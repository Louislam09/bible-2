import React, { useState, useRef, useEffect, MutableRefObject } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Animated, Easing, GestureResponderEvent } from 'react-native';
import Icon from './Icon';
import { iconSize } from 'constants/size';
import { Screens, TTheme } from 'types';
import { NavigationProp, NavigationState, useTheme } from '@react-navigation/native';
import BackButton from './BackButton';

type FloatingButtonProps = {
    navigation: Omit<NavigationProp<ReactNavigation.RootParamList>, "getState"> & {
        getState(): NavigationState | undefined;
    },
    children: React.ReactNode
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ navigation, children }) => {
    const theme = useTheme()
    const styles = getStyles(theme)
    const [expanded, setExpanded] = useState<boolean>(false);
    const animation = useRef<Animated.Value>(new Animated.Value(0)).current;

    const toggleExpand = (): void => {
        if (expanded) {
            Animated.timing(animation, {
                toValue: 0,
                duration: 300,
                easing: Easing.ease,
                useNativeDriver: false,
            }).start(() => {
                console.log('Collapse')
                setExpanded(false)
            });
        } else {
            setExpanded(true);
            Animated.timing(animation, {
                toValue: 1,
                duration: 300,
                easing: Easing.ease,
                useNativeDriver: false,
            }).start(() => {
                // navigation.navigate(Screens.NoteDetail, { noteId: 8, isNewNote: false });
                console.log('Expand')
            });
        }
    };

    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;

    const containerHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [60, screenHeight],
    });

    const containerWidth = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [60, screenWidth],
    });

    const borderRadius = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [30, 0],
    });

    const bottom = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ["50%", "0%"],
    });
    const backgroundColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.notification, theme.colors.background],
    });
    const opacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <Animated.View
            style={[
                styles.floatingButton,
                {
                    height: containerHeight,
                    width: containerWidth,
                    borderRadius: borderRadius,
                    bottom: bottom,
                    backgroundColor: theme.colors.notification
                },
            ]}
        >
            {!expanded ? <TouchableOpacity onPress={(event: GestureResponderEvent) => toggleExpand()} style={styles.button}>
                <Icon name='NotebookText' color={'white'} size={iconSize} />
            </TouchableOpacity> : (
                <Animated.View style={{ flex: 1, opacity }}>
                    <TouchableOpacity activeOpacity={1} onPress={toggleExpand} style={{ paddingVertical: 10, backgroundColor: theme.colors.background }}>
                        <Icon name='ChevronLeft' color={'white'} size={iconSize} />
                    </TouchableOpacity>
                    {children}
                </Animated.View>
            )}
        </Animated.View>
    );
};

const getStyles = ({ colors }: TTheme) => StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        right: 0,
        zIndex: 9999
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    buttonText: {
        fontSize: 28,
        color: '#fff',
    },
    expandedContent: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#fff',
    },
});

export default FloatingButton;
