import { iconSize } from "@/constants/size";
import { useBibleContext } from "@/context/BibleContext";
import useDraggableElement from "@/hooks/useDraggableBox";
import { TTheme } from "@/types";
import { useTheme } from "@/context/ThemeContext";
import { Router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import Icon from "./Icon";
import { Text, View } from "./Themed";
import { icons } from "lucide-react-native";
import { use$ } from "@legendapp/state/react";
import { bibleState$ } from "@/state/bibleState";

type FloatingButtonProps = {
  children: React.ReactNode;
  iconName: keyof typeof icons;
};

const FLOATING_BUTTON_SIZE = 60;
const ANIMATION_DURATION = 300;

const FloatingButton: React.FC<FloatingButtonProps> = ({
  children,
  iconName,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { orientation } = useBibleContext();
  const selectedVerseForNote = use$(() =>
    bibleState$.selectedVerseForNote.get()
  );
  const isLandscape = orientation === "LANDSCAPE";
  const [expanded, setExpanded] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const animation = useRef<Animated.Value>(new Animated.Value(0)).current;
  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
  const currentNoteId = use$(() => bibleState$.currentNoteId.get());

  const { pan, panResponder } = useDraggableElement({
    elementWidth: FLOATING_BUTTON_SIZE,
    elementHeight: FLOATING_BUTTON_SIZE,
    parentWidth: screenWidth,
    parentHeight: screenHeight,
    onPressAction: toggleExpand,
    enabled: !!currentNoteId,
  });

  useEffect(() => {
    if (!currentNoteId || !selectedVerseForNote) return;
    expandAnimation();
  }, [currentNoteId, selectedVerseForNote]);

  const collapseAnimation = (shouldClose = false) => {
    Animated.timing(animation, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start(() => {
      setIsExpanding(false);
      setExpanded(false);
      if (shouldClose)
        setTimeout(() => bibleState$.currentNoteId.set(null), 100);
    });
  };

  const expandAnimation = () => {
    setIsExpanding(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: ANIMATION_DURATION,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start(() => {
      setExpanded(true);
    });
  };

  function toggleExpand(): void {
    if (isLandscape) {
      ToastAndroid.show(
        "¡Rota tu pantalla para acceder a la nota! 🔄",
        ToastAndroid.LONG
      );
      return;
    }
    if (expanded) {
      collapseAnimation();
    } else {
      expandAnimation();
    }
  }

  const animatedValues = useMemo(
    () => ({
      containerHeight: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [FLOATING_BUTTON_SIZE, screenHeight],
      }),
      containerWidth: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [FLOATING_BUTTON_SIZE, screenWidth],
      }),
      borderRadius: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [30, 0],
      }),
      translateY: animation.interpolate({
        inputRange: [0, 1],
        // @ts-ignore
        outputRange: [pan.y._value, 0],
      }),
      translateX: animation.interpolate({
        inputRange: [0, 1],
        // @ts-ignore
        outputRange: [pan.x._value, 0],
      }),
      backgroundColor: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.notification, theme.colors.background],
      }),
      opacity: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      // @ts-ignore
    }),
    [
      animation,
      //   @ts-ignore
      pan.x._value,
      //   @ts-ignore
      pan.y._value,
      screenHeight,
      screenWidth,
      theme.colors,
    ]
  );

  const containerAnimatedStyle = useMemo(
    () => ({
      width: animatedValues.containerWidth,
      height: !expanded
        ? animatedValues.containerHeight
        : animation.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "100%"],
          }),
      borderRadius: animatedValues.borderRadius,
      backgroundColor: animatedValues.backgroundColor,
    }),
    [animatedValues, expanded, animation]
  );

  const draggableStyle = useMemo(
    () => ({
      transform: [
        {
          translateX:
            expanded || isExpanding ? animatedValues.translateX : pan.x,
        },
        {
          translateY:
            expanded || isExpanding ? animatedValues.translateY : pan.y,
        },
      ],
    }),
    [expanded, isExpanding, animatedValues, pan]
  );

  const onCloseFloatingButton = () => {
    collapseAnimation(true);
  };

  return (
    <Animated.View
      style={[
        styles.expandedContainer,
        containerAnimatedStyle,
        draggableStyle,
        currentNoteId === null && { display: "none" },
      ]}
      {...(expanded ? {} : panResponder.panHandlers)}
    >
      {!expanded ? (
        <TouchableOpacity onPress={toggleExpand} style={{ zIndex: 999 }}>
          <Animated.View style={[styles.floatingButton]}>
            <Icon name={iconName} color="white" size={iconSize} />
          </Animated.View>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity style={{}} onPress={toggleExpand}>
              <Icon
                name="ChevronDown"
                color={theme.colors.notification}
                size={iconSize}
              />
            </TouchableOpacity>
            <TouchableOpacity style={{}} onPress={onCloseFloatingButton}>
              <Icon name="X" color={"#e74856"} size={iconSize} />
            </TouchableOpacity>
          </View>
          <Animated.View
            style={[styles.content, { opacity: animatedValues.opacity }]}
          >
            {children}
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    floatingButton: {
      position: "absolute",
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.notification,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
      zIndex: 9999,
    },
    expandedContainer: {
      position: "absolute",
      backgroundColor: colors.background,
      zIndex: 9999,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    content: {
      flex: 1,
    },
  });

export default FloatingButton;
