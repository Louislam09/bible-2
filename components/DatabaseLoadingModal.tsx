import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

import LottieView from "lottie-react-native";
import lottieAssets from "@/constants/lottieAssets";

const { width, height } = Dimensions.get("window");

interface DatabaseLoadingModalProps {
  visible: boolean;
  progress: {
    stage:
      | "preparing"
      | "downloading"
      | "extracting"
      | "converting"
      | "writing"
      | "verifying";
    message: string;
    percentage?: number;
  } | null;
  databaseName?: string;
}

const DatabaseLoadingModal: React.FC<DatabaseLoadingModalProps> = ({
  visible,
  progress,
  databaseName = "Base de datos",
}) => {
  const theme = useTheme();
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const pulseValue = React.useRef(new Animated.Value(1)).current;

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

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "preparing":
        return "settings-outline";
      case "downloading":
        return "cloud-download-outline";
      case "extracting":
        return "archive-outline";
      case "converting":
        return "sync-outline";
      case "writing":
        return "save-outline";
      case "verifying":
        return "checkmark-circle-outline";
      default:
        return "ellipsis-horizontal";
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

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: theme.colors.card,
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
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text,
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
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
    },
    progressText: {
      fontSize: 14,
      color: theme.colors.text,
      textAlign: "center",
      marginTop: 8,
      opacity: 0.7,
    },
    stageContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background,
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
      color: theme.colors.text,
      marginBottom: 2,
    },
    stageMessage: {
      fontSize: 12,
      color: theme.colors.text,
      opacity: 0.7,
    },
    percentageText: {
      fontSize: 12,
      fontWeight: "bold",
      color: theme.colors.primary,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
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
          <Text style={styles.title}>Descargando {databaseName}</Text>
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
          {progress && (
            <View style={styles.stageContainer}>
              <Animated.View
                style={[
                  styles.stageIcon,
                  {
                    transform: [{ rotate: spin }],
                  },
                ]}
              >
                <Ionicons
                  name={getStageIcon(progress.stage) as any}
                  size={24}
                  color={getStageColor(progress.stage)}
                />
              </Animated.View>
              <View style={styles.stageContent}>
                <Text style={styles.stageTitle}>
                  {progress.stage === "preparing" && "Preparando..."}
                  {progress.stage === "downloading" && "Descargando..."}
                  {progress.stage === "extracting" && "Extrayendo..."}
                  {progress.stage === "converting" && "Convirtiendo..."}
                  {progress.stage === "writing" && "Guardando..."}
                  {progress.stage === "verifying" && "Verificando..."}
                </Text>
                <Text style={styles.stageMessage}>{progress.message}</Text>
              </View>
              <Text style={styles.percentageText}>{progress.percentage}%</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default DatabaseLoadingModal;
