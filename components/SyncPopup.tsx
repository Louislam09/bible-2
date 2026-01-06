import { storedData$, useStorage } from "@/context/LocalstoreContext";
import { useSync, syncState$ } from "@/context/SyncContext";
import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { use$ } from "@legendapp/state/react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncComplete, setSyncComplete] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { loadFromCloud } = useStorage();
  const { triggerSync, isInitialized } = useSync();
  
  // Get sync status from TinyBase
  const tinybaseSyncStatus = use$(() => syncState$.syncStatus.get());

  const handleSync = async (): Promise<void> => {
    try {
      setSyncing(true);
      setSyncError(null);

      let success = true;
      const errors: string[] = [];

      // 1. Sync TinyBase data (favorites, highlights, notes, history)
      if (isInitialized) {
        console.log('[SyncPopup] Starting TinyBase sync...');
        const tinybaseSuccess = await triggerSync();
        if (!tinybaseSuccess) {
          errors.push('Error al sincronizar datos locales');
        }
      }

      // 2. Load settings from cloud (LocalstoreContext)
      console.log('[SyncPopup] Loading settings from cloud...');
      const settingsSuccess = await loadFromCloud();
      if (!settingsSuccess) {
        errors.push('Error al cargar configuración');
      }

      if (errors.length > 0) {
        setSyncError(errors.join('. '));
        success = false;
      }

      if (success || errors.length === 0) {
        setSyncComplete(true);

        // Give a short delay before closing to show the success state
        setTimeout(() => {
          setSyncComplete(false);
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSyncError(
        typeof error === "string" ? error : "Error al sincronizar con la nube"
      );
    } finally {
      setSyncing(false);
    }
  };

  // Use TinyBase last sync time if available, fallback to prop
  const effectiveLastSync = tinybaseSyncStatus.lastSyncAt 
    ? new Date(tinybaseSyncStatus.lastSyncAt).toLocaleString()
    : lastSyncTime
      ? new Date(lastSyncTime).toLocaleString()
      : "- -- ----";

  // Show pending changes count if any
  const pendingInfo = tinybaseSyncStatus.pendingChanges > 0
    ? ` (${tinybaseSyncStatus.pendingChanges} cambios pendientes)`
    : '';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Sincronización</Text>
            <TouchableOpacity onPress={onClose} disabled={syncing}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.iconContainer}>
            {syncComplete ? (
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            ) : syncError ? (
              <Ionicons name="alert-circle" size={60} color="#F44336" />
            ) : tinybaseSyncStatus.isSyncing || syncing ? (
              <ActivityIndicator size={60} color="#4A80F0" />
            ) : (
              <Ionicons name="cloud-upload-outline" size={60} color="#4A80F0" />
            )}
          </View>

          <Text style={styles.description}>
            {syncComplete
              ? "¡Tus datos se han sincronizado exitosamente!"
              : syncError
                ? `${syncError}`
                : "Sincroniza favoritos, destacados, notas e historial con la nube."}
          </Text>

          {/* Sync info badges */}
          {!syncComplete && !syncError && (
            <View style={styles.syncInfoContainer}>
              <View style={styles.syncBadge}>
                <Ionicons name="heart" size={16} color={theme.colors.notification} />
                <Text style={styles.syncBadgeText}>Favoritos</Text>
              </View>
              <View style={styles.syncBadge}>
                <Ionicons name="color-palette" size={16} color={theme.colors.notification} />
                <Text style={styles.syncBadgeText}>Destacados</Text>
              </View>
              <View style={styles.syncBadge}>
                <Ionicons name="document-text" size={16} color={theme.colors.notification} />
                <Text style={styles.syncBadgeText}>Notas</Text>
              </View>
              <View style={styles.syncBadge}>
                <Ionicons name="settings" size={16} color={theme.colors.notification} />
                <Text style={styles.syncBadgeText}>Ajustes</Text>
              </View>
            </View>
          )}

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
                  <Text style={styles.syncButtonText}>Sincronizar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.lastSyncText}>
            Última sincronización: {effectiveLastSync}{pendingInfo}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.background + 70,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "85%",
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 24,
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
      color: colors.text,
    },
    iconContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 20,
    },
    description: {
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
      marginBottom: 16,
      lineHeight: 22,
    },
    syncInfoContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8,
      marginBottom: 20,
    },
    syncBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.text + "15",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    syncBadgeText: {
      fontSize: 12,
      color: colors.text,
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
      backgroundColor: colors.text + 80,
      marginRight: 8,
    },
    syncButton: {
      backgroundColor: colors.notification,
      marginLeft: 8,
    },
    disabledButton: {
      backgroundColor: colors.text + 80,
    },
    cancelButtonText: {
      color: !dark ? "white" : colors.text,
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
      color: colors.text,
      textAlign: "center",
    },
  });

export default CloudSyncPopup;
