import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useEffect, useRef } from "react";
import { TouchableOpacity, Animated, Easing, ViewStyle } from "react-native";
import { Text } from "./Themed";
import { TTheme } from "types";

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
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <MaterialCommunityIcons
          style={{
            color: isDownloaded ? "#e74856" : theme.colors.notification,
          }}
          name={progress ? "loading" : isDownloaded ? "delete" : "download"}
          size={iconSize || 30}
        />
      </Animated.View>
      {withLabel && (
        <Text style={{ color: theme.colors.text }}>
          {progress ? "Descargando..." : isDownloaded ? "Borrar" : "Descargar"}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default DownloadButton;
