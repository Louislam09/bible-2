import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ModalProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { storedData$, useStorage } from "@/context/LocalstoreContext";
import { settingState$ } from "@/state/settingState";

interface CloudSyncPopupProps {
  visible: boolean;
  onClose: () => void;
  lastSyncTime?: string | null;
}

const CloudSyncPopup: React.FC<CloudSyncPopupProps> = ({
  visible,
  onClose,
  lastSyncTime,
}) => {
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncComplete, setSyncComplete] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { loadFromCloud } = useStorage();

  const handleSync = async (): Promise<void> => {
    try {
      setSyncing(true);
      setSyncError(null);
      await loadFromCloud();
      setSyncComplete(true);

      setTimeout(() => {
        settingState$.requiresSettingsReloadAfterSync.set(true);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Sync error:", error);
      setSyncError(
        typeof error === "string" ? error : "Failed to sync with cloud"
      );
    } finally {
      setSyncing(false);
    }
  };

  const formattedLastSync = lastSyncTime
    ? new Date(lastSyncTime).toLocaleString()
    : "Never";

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Sincronización de nubes</Text>
            <TouchableOpacity onPress={onClose} disabled={syncing}>
              <Ionicons name="close" size={24} color="#555" />
            </TouchableOpacity>
          </View>

          <View style={styles.iconContainer}>
            {syncComplete ? (
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            ) : syncError ? (
              <Ionicons name="alert-circle" size={60} color="#F44336" />
            ) : (
              <Ionicons name="cloud-upload-outline" size={60} color="#4A80F0" />
            )}
          </View>

          <Text style={styles.description}>
            {syncComplete
              ? "¡Tus datos se han sincronizado exitosamente con la nube!"
              : syncError
              ? `Error de sincronización: ${syncError}`
              : "Sincroniza tus datos con la nube para acceder a ellos desde todos tus dispositivos."}
          </Text>

          {!syncComplete && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={syncing}
              >
                <Text style={styles.cancelButtonText}>Más tarde</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.syncButton,
                  syncing && styles.disabledButton,
                ]}
                onPress={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.syncButtonText}>Sincronizar ahora</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.lastSyncText}>
            Última sincronización: {formattedLastSync}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },
  syncButton: {
    backgroundColor: "#4A80F0",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#a0b9f8",
  },
  cancelButtonText: {
    color: "#555",
    fontWeight: "600",
    fontSize: 16,
  },
  syncButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  lastSyncText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
});

export default CloudSyncPopup;
