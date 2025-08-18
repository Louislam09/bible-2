import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React from "react";
import { Alert } from "react-native";
import ViewShot from "react-native-view-shot";

interface UseViewShotOptions {
  fileName: string;
  quality?: number;
  format?: "jpg" | "png" | "webm" | "raw";
  result?: "tmpfile" | "base64" | "data-uri";
  viewShotRef?: React.RefObject<ViewShot | null>;
}

export const useViewShot = ({
  fileName,
  quality = 1,
  format = "png",
  result = "tmpfile",
  viewShotRef: externalRef,
}: UseViewShotOptions) => {
  const internalRef = React.useRef<ViewShot>(null);
  const viewShotRef = externalRef || internalRef;

  const capture = async () => {
    try {
      if (!viewShotRef.current) {
        throw new Error("ViewShot ref is not initialized");
      }

      // @ts-ignore - The types in the package are incorrect
      const uri = await viewShotRef.current.capture({
        format,
        quality,
        result,
      });

      return uri;
    } catch (error: any) {
      console.error("Error capturing view:", error);
      throw error;
    }
  };

  const captureAndSave = async () => {
    try {
      const uri = await capture();
      if (typeof uri === "string" && uri.startsWith("data:")) {
        const base64 = uri.split(",")[1];
        const fileUri = FileSystem.documentDirectory + `${fileName}.${format}`;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return fileUri;
      }
      return uri;
    } catch (error: any) {
      console.error("Error saving screenshot:", error);
      Alert.alert("Error", "Failed to save screenshot: " + error.message);
      throw error;
    }
  };

  const captureAndShare = async () => {
    try {
      const fileUri = await captureAndSave();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: `image/${format}`,
          dialogTitle: "Share Quote",
          UTI: `public.${format}`,
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error: any) {
      console.error("Error sharing screenshot:", error);
      Alert.alert("Error", "Failed to share screenshot: " + error.message);
      throw error;
    }
  };

  return {
    viewShotRef,
    capture,
    captureAndSave,
    captureAndShare,
  };
};
