import { saveFileToAppFolder, FileMimeType } from "@/utils/appFileManager";
import { showToast } from "@/utils/showToast";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React from "react";
import { Alert, Platform } from "react-native";
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

      // @ts-ignore
      const uri = await viewShotRef.current?.capture();

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

  const captureAndSaveToGallery = async (fileName: string = "cita") => {
    try {
      const fileUri = await captureAndSave();
      if (Platform.OS === "android") {
        const filename = `${fileName}_${Date.now()}.${format}`;

        // Determine mime type based on format
        const mimeType = format === "png" ? FileMimeType.IMAGE_PNG :
          format === "jpg" ? FileMimeType.IMAGE_JPEG :
            FileMimeType.IMAGE_PNG;

        const savedUri = await saveFileToAppFolder(fileUri, filename, mimeType);

        if (savedUri) {
          showToast('✅ Imagen guardada en la galería', 'SHORT', 'CENTER');
        } else {
          showToast('❌ No se pudo guardar la imagen en la galería');
        }
      }
    } catch (error: any) {
      console.error("Error saving screenshot to gallery:", error);
      showToast('❌ Error al guardar la imagen en la galería: ' + error.message);
      throw error;
    }
  };

  const captureAndShare = async () => {
    try {
      const fileUri = await captureAndSave();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: `image/${format}`,
          dialogTitle: "Compartir Cita",
          UTI: `public.${format}`,
        });
      } else {
        Alert.alert("Error", "Compartir no está disponible en este dispositivo");
      }
    } catch (error: any) {
      console.error("Error compartiendo cita:", error);
      Alert.alert("Error", "Error al compartir cita: " + error.message);
      throw error;
    }
  };

  return {
    viewShotRef,
    capture,
    captureAndSave,
    captureAndShare,
    captureAndSaveToGallery
  };
};
