import { useMyTheme } from "@/context/ThemeContext";
import { tourState$ } from "@/state/tourState";
import { TStep, TTheme } from "@/types";
import React, { useEffect, useRef } from "react";
import { Pressable, StyleSheet, TouchableOpacity, Animated as RNAnimated, Easing } from "react-native";
import Popover, { PopoverPlacement } from "react-native-popover-view";
import Icon from "./Icon";
import { Text, View } from "./Themed";

type TWalkthrough = {
  currentStep: number;
  steps: TStep[] | any[];
  setStep: any;
  onComplete?: () => void;
};

const Walkthrough = ({ currentStep, steps, setStep, onComplete }: TWalkthrough) => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const totalStep = steps.length;
  const lastStep = currentStep === totalStep - 1;
  const firstStep = currentStep === 0;
  const content = steps[currentStep]?.text ?? "";
  const target = steps[currentStep]?.target ?? null;
  const action = steps[currentStep]?.action ?? null;

  // Animation values
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const scaleAnim = useRef(new RNAnimated.Value(0.8)).current;
  const slideAnim = useRef(new RNAnimated.Value(50)).current;
  const progressAnim = useRef(new RNAnimated.Value(0)).current;

  const next = async () => {
    if (currentStep < steps.length - 1) {
      // Fade out animation
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        RNAnimated.timing(slideAnim, {
          toValue: -30,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(async () => {
        action && (await action());
        setStep(currentStep + 1);
      });
    }
  };

  const previuos = () => {
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      RNAnimated.timing(slideAnim, {
        toValue: 30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(currentStep - 1);
    });
  };

  const close = () => {
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      RNAnimated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      tourState$.setTourPopoverVisible("EMPTY");
      if (action && lastStep) action();
      if (lastStep && onComplete) onComplete();
      setStep(-1);
    });
  };

  // Animate content on step change
  useEffect(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      // Reset and animate in
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      slideAnim.setValue(50);

      RNAnimated.parallel([
        RNAnimated.spring(fadeAnim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        RNAnimated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        RNAnimated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate progress bar
      RNAnimated.timing(progressAnim, {
        toValue: (currentStep + 1) / totalStep,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [currentStep]);

  useEffect(() => {
    const highlightElement = () => {
      const view = target?.current;
      if (view) {
        view.setNativeProps({
          style: {
            borderWidth: 2,
            borderColor: theme.colors.notification,
            borderRadius: 8,
            shadowColor: theme.colors.notification,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 5,
          },
        });
      }
    };

    highlightElement();

    return () => {
      const view = target?.current;
      if (view) {
        view.setNativeProps({
          style: {
            borderWidth: 0,
            borderRadius: 0,
            shadowOpacity: 0,
            elevation: 0,
          },
        });
      }
    };
  }, [currentStep]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Popover
      offset={12}
      from={target}
      isVisible={currentStep === -1 ? false : currentStep < steps.length}
      arrowSize={{ width: 16, height: 20 }}
      backgroundStyle={{ opacity: 0.3, backgroundColor: 'transparent' }}
      popoverStyle={{
        borderWidth: 2,
        borderColor: theme.colors.notification + '80',
        backgroundColor: theme.colors.notification + '80',
        borderRadius: 12,
        shadowColor: theme.colors.notification,
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 12,
      }}

      animationConfig={{
        duration: 300,
        // easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        easing: Easing.linear,
        useNativeDriver: true,
      }}
    >
      <RNAnimated.View
        style={[
          styles.container,
          {
            // opacity: fadeAnim,
            // transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <RNAnimated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
                backgroundColor: theme.colors.notification,
              },
            ]}
          />
        </View>

        <TouchableOpacity onPress={close} activeOpacity={0.7}>
          <View style={styles.closeIconWrapper}>
            <Icon style={styles.closeIcon} name="X" />
          </View>
        </TouchableOpacity>

        <RNAnimated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.content}>{content}</Text>
        </RNAnimated.View>

        <View style={styles.separetor} />

        <View style={styles.actions}>
          <View style={styles.stepCount}>
            <Text style={styles.countLabel}>{`${currentStep + 1} de ${totalStep}`}</Text>
          </View>
          <View style={styles.actionButtons}>
            {!firstStep && (
              <Pressable onPress={previuos} style={styles.iconButton}>
                {({ pressed }) => (
                  <RNAnimated.View
                    style={{
                      opacity: pressed ? 0.6 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    }}
                  >
                    <Icon
                      name="ArrowLeft"
                      color={theme.colors.notification}
                      size={16}
                    />
                  </RNAnimated.View>
                )}
              </Pressable>
            )}
            <Pressable onPress={close} style={styles.iconButton}>
              {({ pressed }) => (
                <RNAnimated.View
                  style={{
                    opacity: pressed ? 0.6 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  }}
                >
                  <Text style={styles.actionIcon}>
                    {lastStep ? "Finalizar" : "Saltar"}
                  </Text>
                </RNAnimated.View>
              )}
            </Pressable>
            {!lastStep && (
              <Pressable onPress={next} style={styles.iconButton}>
                {({ pressed }) => (
                  <RNAnimated.View
                    style={{
                      opacity: pressed ? 0.6 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    }}
                  >
                    <Icon
                      name="ArrowRight"
                      color={theme.colors.notification}
                      size={16}
                    />
                  </RNAnimated.View>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </RNAnimated.View>
    </Popover>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      display: "flex",
      justifyContent: "space-between",
      flex: 1,
      paddingHorizontal: 15,
      paddingVertical: 10,
      position: "relative",
      borderColor: colors.notification,
      backgroundColor: colors.background,
      borderRadius: 12,
      width: 320,
    },
    progressBarContainer: {
      height: 4,
      backgroundColor: colors.notification + "30",
      borderRadius: 2,
      marginBottom: 10,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      borderRadius: 2,
    },
    closeIcon: {
      fontSize: 18,
      color: colors.notification,
      paddingTop: 5,
    },
    closeIconWrapper: {
      alignSelf: "flex-end",
    },
    separetor: {
      width: "100%",
      height: 1,
      // marginLeft:,
      backgroundColor: colors.notification,
      marginVertical: 10,
    },
    content: {
      paddingVertical: 10,
      fontSize: 16,
      marginBottom: 10,
      color: colors.notification,
    },
    actions: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      flex: 1,
    },
    stepCount: {},
    countLabel: {
      fontSize: 16,
      color: colors.notification,
    },
    iconButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      padding: 10,
      margin: 5,
      color: colors.notification,
      borderColor: colors.notification,
      borderWidth: 1,
    },
    actionIcon: {
      fontSize: 16,
      color: colors.notification,
      fontWeight: "bold",
    },
    actionButtons: {
      display: "flex",
      flexDirection: "row",
    },
  });

export default Walkthrough;
