import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";

import lottieAssets from "@/constants/lottieAssets";
import { useMyTheme } from "@/context/ThemeContext";
import { bibleState$ } from "@/state/bibleState";
import { dbDownloadState$ } from "@/state/dbDownloadState";
import { TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import LottieView from "lottie-react-native";
import { icons } from "lucide-react-native";
import Icon from "./Icon";

const { width, height } = Dimensions.get("window");

const DatabaseLoadingModal: React.FC = () => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const pulseValue = React.useRef(new Animated.Value(1)).current;
  const progress = use$(() => dbDownloadState$.get());

  const visible = useMemo(() => {
    return (
      progress.isDownloadingDB &&
      progress.percentage > 0 &&
      progress.percentage < 100
    );
  }, [progress.isDownloadingDB, progress.percentage]);

  React.useEffect(() => {
    if (visible) {
      // Start spinning animation
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      spinValue.stopAnimation();
      pulseValue.stopAnimation();
    }
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const getStageIcon = (stage: string): keyof typeof icons => {
    switch (stage) {
      case "preparing":
        return "Settings";
      case "downloading":
        return "Download";
      case "extracting":
        return "Wrench";
      case "converting":
        return "Drum";
      case "writing":
        return "Save";
      case "verifying":
        return "ListCheck";
      default:
        return "Settings";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "preparing":
        return "#FF9500";
      case "downloading":
        return "#007AFF";
      case "extracting":
        return "#FF2D92";
      case "converting":
        return "#AF52DE";
      case "writing":
        return "#30D158";
      case "verifying":
        return "#34C759";
      default:
        return theme.colors.primary;
    }
  };

  const getStageMessage = (stage: string) => {
    switch (stage) {
      case "preparing":
        return "Preparando...";
      case "downloading":
        return "Descargando...";
      case "extracting":
        return "Extrayendo...";
      case "converting":
        return "Convirtiendo...";
      case "writing":
        return "Guardando...";
      case "verifying":
        return "Verificando...";
      default:
        return "Descargando...";
    }
  };

  // useEffect(() => {
  //   console.log(
  //     "DatabaseLoadingModal",
  //     `${progress.databaseName} ${visible} ${progress.stage} ${progress.message} ${progress.percentage}`
  //   );
  // }, [progress, visible]);

  return (
    // <Modal
    //   visible={visible}
    //   transparent
    //   animationType="fade"
    //   statusBarTranslucent
    // >
    // <View style={styles.modalOverlay}>
    // </View>
    <Animated.View
      style={[
        styles.modalContent,
        {
          transform: [{ scale: pulseValue }],
        },
      ]}
    >
      {/* Lottie Animation */}
      <View style={styles.lottieContainer}>
        <LottieView
          source={lottieAssets.downloading}
          autoPlay
          loop
          style={{ width: "100%", height: "100%" }}
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>
        Descargando {progress.databaseName || "Base de datos"}
      </Text>
      <Text style={styles.subtitle}>
        Por favor espera mientras preparamos tu base de datos
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress?.percentage || 0}%`,
                backgroundColor: progress
                  ? getStageColor(progress.stage)
                  : theme.colors.primary,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {progress?.percentage || 0}% completado
        </Text>
      </View>

      {/* Current Stage */}
      {/* {progress && (
      )} */}
      <View style={styles.stageContainer}>
        <Animated.View
          style={[
            styles.stageIcon,
            {
              transform: [{ scale: pulseValue }],
            },
          ]}
        >
          <Icon
            name={getStageIcon(progress.stage)}
            size={24}
            color={getStageColor(progress.stage)}
          />
          {/* <Ionicons
              name={getStageIcon(progress.stage) as any}
              size={24}
              color={getStageColor(progress.stage)}
            /> */}
        </Animated.View>
        <View style={styles.stageContent}>
          <Text style={styles.stageTitle}>
            {getStageMessage(progress.stage)}
          </Text>
          <Text style={styles.stageMessage}>{progress.message || "---"}</Text>
        </View>
        <Text style={styles.percentageText}>{progress.percentage}%</Text>
      </View>
    </Animated.View>
    // </Modal>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 30,
      width: width * 0.85,
      maxWidth: 400,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    lottieContainer: {
      width: 120,
      height: 120,
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
      marginBottom: 20,
      opacity: 0.8,
    },
    progressContainer: {
      width: "100%",
      marginBottom: 20,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    progressText: {
      fontSize: 14,
      color: colors.text,
      textAlign: "center",
      marginTop: 8,
      opacity: 0.7,
    },
    stageContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 12,
      marginBottom: 15,
      width: "100%",
    },
    stageIcon: {
      marginRight: 12,
    },
    stageContent: {
      flex: 1,
    },
    stageTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    stageMessage: {
      fontSize: 12,
      color: colors.text,
      opacity: 0.8,
    },
    percentageText: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.primary,
    },
  });

export default DatabaseLoadingModal;
