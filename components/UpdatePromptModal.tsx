import React from "react";
import { Alert, Linking } from "react-native";
import { UpdateService } from "@/services/updateService";

interface UpdatePromptModalProps {
  isVisible: boolean;
  onClose: () => void;
  updateInfo: {
    isAvailable: boolean;
    isDownloaded: boolean;
    manifest?: any;
  };
}

export const UpdatePromptModal: React.FC<UpdatePromptModalProps> = ({
  isVisible,
  onClose,
  updateInfo,
}) => {
  const handleUpdate = async () => {
    try {
      if (updateInfo.isDownloaded) {
        // Update is already downloaded, just apply it
        await UpdateService.applyUpdate();
      } else {
        // Download and apply update
        const downloadSuccess = await UpdateService.downloadUpdate();
        if (downloadSuccess) {
          await UpdateService.applyUpdate();
        } else {
          Alert.alert(
            "Error",
            "No se pudo descargar la actualización. Inténtalo de nuevo más tarde."
          );
        }
      }
    } catch (error) {
      console.error("Error applying update:", error);
      Alert.alert("Error", "Ocurrió un error al aplicar la actualización.");
    }
    onClose();
  };

  const handleLater = () => {
    onClose();
  };

  // This component is mainly for future extensibility
  // Currently using native Alert for simplicity
  return null;
};

export default UpdatePromptModal;
