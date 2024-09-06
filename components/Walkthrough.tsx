import { useTheme } from "@react-navigation/native";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, TouchableOpacity } from "react-native";
import Popover from "react-native-popover-view";
import { TStep, TTheme } from "types";
import Icon from "./Icon";
import { Text, View } from "./Themed";
type TWalkthrough = {
  currentStep: number;
  steps: TStep[] | any[];
  setStep: any;
};

const Walkthrough = ({ currentStep, steps, setStep }: TWalkthrough) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const totalStep = steps.length;
  const lastStep = currentStep === totalStep - 1;
  const firstStep = currentStep === 0;
  const content = steps[currentStep]?.text ?? "";
  const target = steps[currentStep]?.target ?? null;
  const action = steps[currentStep]?.action ?? null;

  const next = async () => {
    if (currentStep < steps.length - 1) {
      action && (await action());
      setStep(currentStep + 1);
    }
  };
  const previuos = () => {
    setStep(currentStep - 1);
  };
  const close = () => {
    if (action && lastStep) action();
    setStep(-1);
  };

  useEffect(() => {
    const highlightElement = () => {
      const view = target?.current;
      if (view) {
        view.setNativeProps({
          style: {
            borderWidth: 1,
            borderColor: theme.colors.notification,
          },
        });
      }
    };

    highlightElement();

    // Clean up the highlight when the component unmounts or when the current step changes
    return () => {
      const view = target?.current;
      if (view) {
        view.setNativeProps({
          style: {
            borderWidth: 0,
          },
        });
      }
    };
  }, [currentStep]);

  return (
    <Popover
      offset={10}
      from={target}
      isVisible={currentStep === -1 ? false : currentStep < steps.length}
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={close}>
          <View style={styles.closeIconWrapper}>
            <Icon style={styles.closeIcon} name="X" />
          </View>
        </TouchableOpacity>

        <Text style={styles.content}>{content}</Text>
        <View style={styles.separetor} />

        <View style={styles.actions}>
          <View style={styles.stepCount}>
            <Text style={styles.countLabel}>{`${
              currentStep + 1
            } de ${totalStep}`}</Text>
          </View>
          <View style={styles.actionButtons}>
            {!firstStep && (
              <Pressable onPress={previuos} style={styles.iconButton}>
                <Icon
                  name="ArrowLeft"
                  color={theme.colors.notification}
                  size={16}
                />
              </Pressable>
            )}
            <Pressable onPress={close} style={styles.iconButton}>
              <Text style={styles.actionIcon}>
                {lastStep ? "Fin" : "Saltar"}
              </Text>
            </Pressable>
            {!lastStep && (
              <Pressable onPress={next} style={styles.iconButton}>
                <Icon
                  name="ArrowRight"
                  color={theme.colors.notification}
                  size={16}
                />
              </Pressable>
            )}
          </View>
        </View>
      </View>
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
      paddingVertical: 5,
      position: "relative",
      borderWidth: 1,
      borderColor: colors.notification,
      backgroundColor: colors.background,
      width: 300,
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
