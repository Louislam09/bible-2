import React, { useEffect, useRef } from "react";
import { Animated, Easing, TouchableOpacity } from "react-native";
import { TTheme } from "@/types";
import Icon from "./Icon";
import { Text } from "./Themed";

interface DownloadButtonProps {
  isDownloaded: boolean;
  deleteFile: () => void;
  downloadFile: () => void;
  progress: boolean;
  theme: TTheme;
  iconSize?: number;
  withLabel?: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  isDownloaded,
  deleteFile: deleteBibleFile,
  downloadFile: downloadBible,
  progress,
  theme,
  iconSize,
  withLabel = false,
}) => {
  const rotation = useRef(new Animated.Value(0)).current;
  // Start the rotation animation
  const startRotation = () => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  // Stop the rotation animation
  const stopRotation = () => {
    rotation.stopAnimation();
    rotation.setValue(0); // Reset the rotation
  };

  useEffect(() => {
    if (progress) {
      startRotation();
    } else {
      stopRotation();
    }
  }, [progress]);

  // Interpolate the rotation value to degrees
  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <TouchableOpacity
      style={{ alignItems: "center" }}
      onPress={isDownloaded ? deleteBibleFile : downloadBible}
      disabled={progress}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Icon
          name={progress ? "Loader" : isDownloaded ? "Trash2" : "Download"}
          color={
            isDownloaded
              ? progress
                ? "#4ec9b0"
                : "#e74856"
              : theme.colors.text
          }
          size={iconSize || 30}
        />
      </Animated.View>
      {withLabel && (
        <Text style={{ color: theme.colors.text }}>
          {progress
            ? isDownloaded
              ? "Eliminando..."
              : "Descargando..."
            : isDownloaded
            ? "Borrar"
            : "Descargar"}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default DownloadButton;
