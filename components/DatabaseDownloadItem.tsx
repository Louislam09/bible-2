import { DownloadedDatabase } from "@/classes/Database";
import {
  dbFileExt,
  defaultDatabases,
  getIfDatabaseNeedsDownload,
  SQLiteDirPath,
} from "@/constants/databaseNames";
import { useBibleContext } from "@/context/BibleContext";
import { useDBContext } from "@/context/databaseContext";
import { showToast } from "@/utils/showToast";
import { Ionicons } from "@expo/vector-icons";
import type { useDownloadManager } from "@/hooks/useDownloadManager";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { use$ } from "@legendapp/state/react";
import { downloadState$ } from "@/state/downloadState";
import ProgressBar from "./home/footer/ProgressBar";
import Icon from "./Icon";
import { Text, View } from "./Themed";
import { storedData$ } from "@/context/LocalstoreContext";

// Type definitions
type TTheme = {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
};

type DownloadBibleItem = {
  name: string;
  url: string;
  key: string;
  storedName: string;
  size: number;
  disabled?: boolean;
};

type DatabaseDownloadItemProps = {
  item: DownloadBibleItem;
  theme: TTheme;
  isConnected: boolean | null;
  onDownloadComplete?: (storedName: string) => void;
  onError?: (error: string) => void;
  downloadManager: ReturnType<typeof useDownloadManager>;
};

const DatabaseDownloadItem = ({
  item,
  theme,
  isConnected,
  onDownloadComplete,
  onError,
  downloadManager,
}: DatabaseDownloadItemProps) => {
  // State management
  const [expandDetails, setExpandDetails] = useState(false);
  const [downloadedDate, setDownloadedDate] = useState<Date | null>(null);
  const [animation] = useState(new Animated.Value(0));

  // Extract properties from item
  const { size, url, storedName, name } = item;

  // Context hooks
  const { refreshDatabaseList } = useDBContext();
  const { selectBibleVersion, currentBibleVersion } = useBibleContext();

  // ✅ Get download manager functions from props instead of calling the hook
  const { addDownload, cancelDownload, retryDownload, removeCompleted } = downloadManager;

  // ✅ Use selective Legend State subscription - only re-render when THIS download changes
  const downloadStatus = use$(downloadState$.downloads[storedName]);

  // ✅ Memoize computed values to prevent unnecessary recalculations
  const isLoading = useMemo(
    () =>
      downloadStatus?.status === "downloading" ||
      downloadStatus?.status === "unzipping",
    [downloadStatus?.status]
  );

  const progress = useMemo(
    () => downloadStatus?.progress || 0,
    [downloadStatus?.progress]
  );

  const unzipProgress = useMemo(
    () => downloadStatus?.unzipProgress || "",
    [downloadStatus?.unzipProgress]
  );

  const downloadError = useMemo(
    () => downloadStatus?.error || null,
    [downloadStatus?.error]
  );

  // ✅ Initialize as false - will be checked properly in useEffect
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Paths and URLs
  const styles = getStyles(theme);

  // Check if this is the currently selected Bible
  const isCurrentBible = currentBibleVersion === storedName + dbFileExt;

  // Check download status on mount and when download status changes
  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      if (isMounted) {
        await checkDownloadStatus();
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, [downloadStatus?.status]);


  // Monitor download completion
  useEffect(() => {
    let isMounted = true;

    const handleStatusChange = async () => {
      if (downloadStatus?.status === "completed" && isMounted) {
        setIsDownloaded(true);
        setDownloadedDate(new Date(downloadStatus.completedAt || Date.now()));

        if (isMounted) {
          await refreshDatabaseList();
          onDownloadComplete?.(storedName);
          await checkFirstDownload();
        }
      } else if (downloadStatus?.status === "failed" && isMounted) {
        onError?.(downloadStatus.error || "Error desconocido");
      }
    };

    handleStatusChange();

    return () => {
      isMounted = false;
    };
  }, [downloadStatus?.status]);

  const checkFirstDownload = async () => {
    const allDatabases = (await refreshDatabaseList()) as any;
    if (allDatabases?.length === 1) {
      selectBibleVersion(storedName + dbFileExt);
    }
  };

  // Check if database exists and when it was downloaded
  const checkDownloadStatus = async () => {
    try {
      const needDownload = await getIfDatabaseNeedsDownload(
        storedName + dbFileExt
      );
      const fileDownloaded = !needDownload;

      // ✅ ONLY consider it downloaded if the file actually exists
      // Ignore download manager state if file doesn't exist (was deleted)
      setIsDownloaded(fileDownloaded);

      if (fileDownloaded) {
        // Get file info to check when it was downloaded
        const fileInfo = await FileSystem.getInfoAsync(
          `${SQLiteDirPath}/${storedName}${dbFileExt}`
        );
        if (fileInfo.exists && fileInfo.modificationTime) {
          setDownloadedDate(new Date(fileInfo.modificationTime * 1000));
        }
      } else {
        // File doesn't exist, ensure it's marked as not downloaded
        setDownloadedDate(null);
      }
    } catch (error) {
      console.error("Error checking download status:", error);
      setIsDownloaded(false);
    }
  };

  // ✅ Optimistic UI updates for better UX
  const [localProgress, setLocalProgress] = useState(0);
  const [optimisticDownloading, setOptimisticDownloading] = useState(false);

  // ✅ Memoize callback functions to prevent unnecessary re-renders
  const downloadBible = useCallback(async () => {
    if (!isConnected) {
      showToast("Por favor, revisa tu conexión e inténtalo de nuevo.");
      return;
    }

    const needDownload = await getIfDatabaseNeedsDownload(
      storedName + dbFileExt
    );
    if (needDownload) {
      // ✅ Show downloading state immediately (optimistic update)
      setOptimisticDownloading(true);
      setLocalProgress(0.01);

      try {
        await addDownload({
          storedName,
          name,
          url,
          size,
        });
      } catch (error) {
        // Rollback optimistic update on error
        setOptimisticDownloading(false);
        setLocalProgress(0);
        showToast("Error al iniciar descarga");
      }
    } else {
      showToast("Esta versión ya está descargada.");
    }
  }, [isConnected, storedName, name, url, size, addDownload]);

  // Reset optimistic state when actual download starts
  useEffect(() => {
    if (isLoading && optimisticDownloading) {
      setOptimisticDownloading(false);
      setLocalProgress(0);
    }
  }, [isLoading]);

  // Cancel download if in progress
  const handleCancelDownload = useCallback(async () => {
    await cancelDownload(storedName);
    showToast("Descarga cancelada.");
  }, [storedName, cancelDownload]);

  // Retry failed download
  const handleRetryDownload = useCallback(async () => {
    await retryDownload(storedName);
  }, [storedName, retryDownload]);

  // Delete Bible file
  const deleteBibleFile = async () => {
    if (isCurrentBible) {
      Alert.alert(
        "Versión en uso",
        "No se puede eliminar la versión que está en uso actualmente. Por favor, selecciona otra versión primero.",
        [{ text: "Entendido", style: "cancel" }]
      );
      return;
    }

    Alert.alert(
      "Eliminar versión",
      `¿Estás seguro que deseas eliminar ${name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const bibleObject = new DownloadedDatabase(
                storedName + dbFileExt
              );
              const deleted = await bibleObject.delete();

              if (!deleted) {
                showToast("No se pudo eliminar el archivo.");
                return;
              }

              // Clear download manager state first
              removeCompleted(storedName);

              const dbTableCreated = storedData$.dbTableCreated.get();
              storedData$.dbTableCreated.set(
                dbTableCreated.filter((db: string) => db !== storedName)
              );

              // Update UI state
              setIsDownloaded(false);
              setDownloadedDate(null);

              // Refresh database list
              refreshDatabaseList();

              // Force recheck after a small delay to ensure state has updated
              setTimeout(() => {
                checkDownloadStatus();
              }, 100);

              showToast(`${name} ha sido eliminado.`);
            } catch (error) {
              console.error("Error deleting file:", error);
              showToast("Error al eliminar el archivo.");
            }
          },
        },
      ]
    );
  };

  // Format file size display
  const formatFileSize = (bytes: number) => {
    const sizeInMB = bytes / (1024 * 1024);
    if (sizeInMB >= 1) {
      return `${sizeInMB.toFixed(2)} MB`;
    } else {
      const sizeInKB = bytes / 1024;
      return `${sizeInKB.toFixed(2)} KB`;
    }
  };

  // Format date display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const toggleExpandDetails = () => {
    setExpandDetails(!expandDetails);
  };

  const isBible = !item.storedName.split(".")[1];

  return (
    <Animated.View
      style={[
        styles.itemContainer,
        isDownloaded && styles.downloadedItem
      ]}
    >
      <Pressable
        onPress={() => toggleExpandDetails()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
          justifyContent: "space-between",
        }}
      >
        <View style={styles.itemIconContainer}>
          <Ionicons
            name={isBible ? "book-outline" : "library-outline"}
            size={22}
            color={theme.colors.notification}
          />
        </View>

        <View style={styles.itemContent}>
          <Text
            style={[styles.itemSubTitle]}
          >
            {item?.name || "-"}
          </Text>

          <View style={styles.defaultBadge}>
            <Icon name="ChartPie" color={theme.colors.notification} size={16} />
            <Text style={styles.defaultBadgeText}>{formatFileSize(size)}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {item.disabled ? (
            <View style={styles.disabledButton}>
              <Icon name="Lock" size={18} color={theme.colors.text + "50"} />
            </View>
          ) : isLoading || optimisticDownloading ? (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelDownload}
            >
              <Icon name="X" size={18} color="#FF0000" />
            </TouchableOpacity>
          ) : downloadStatus?.status === "failed" ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.retryButton]}
              onPress={handleRetryDownload}
            >
              <Icon
                name="RotateCcw"
                size={18}
                color={theme.colors.notification}
              />
            </TouchableOpacity>
          ) : isDownloaded ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={deleteBibleFile}
              disabled={isCurrentBible}
            >
              <Icon name="Trash2" size={18} color="#FF0000" />
            </TouchableOpacity>
          ) : downloadStatus?.status === "queued" ? (
            <View style={styles.queuedIndicator}>
              <Text style={styles.queuedText}>En cola...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton]}
              onPress={downloadBible}
              disabled={!isConnected || isLoading}
            >
              <Icon name="Download" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </Pressable>

      {/* Progress bar for download */}
      {(!!progress || optimisticDownloading) && !isDownloaded && (
        <View style={styles.progressContainer}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <ProgressBar
              height={8}
              color={theme.colors.primary}
              barColor={theme.colors.border}
              progress={optimisticDownloading ? localProgress : progress}
              circleColor={theme.colors.notification}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(
              (optimisticDownloading ? localProgress : progress) * 100
            )}
            %
          </Text>
        </View>
      )}

      {/* Download status text */}
      {isLoading && (
        <View
          style={{
            marginTop: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "transparent",
          }}
        >
          {unzipProgress ? (
            <Text style={styles.unzipText}>{unzipProgress}</Text>
          ) : (
            <Text style={styles.unzipText}>
              {downloadStatus?.status === "downloading"
                ? "Descargando..."
                : "Preparando..."}
            </Text>
          )}
        </View>
      )}

      {/* Error message */}
      {downloadError && (
        <View style={styles.errorContainer}>
          <Icon name="OctagonAlert" size={16} color="#FF0000" />
          <Text style={styles.errorText}>{downloadError}</Text>
        </View>
      )}
    </Animated.View>
  );
};

export default DatabaseDownloadItem;

const getStyles = ({ colors, dark = false }: TTheme) =>
  StyleSheet.create({
    itemContainer: {
      padding: 12,
      borderRadius: 12,
      marginVertical: 4,
      backgroundColor: colors.card + "80",
      borderWidth: 1,
      borderColor: colors.notification + "50",
      gap: 2,
    },
    downloadedItem: {
      borderColor: colors.notification,
      borderWidth: 1,
    },
    disabledContainer: {
      opacity: 0.6,
      backgroundColor: colors.card + "40",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
      backgroundColor: "transparent",
    },
    itemIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.notification + "20",
      marginRight: 12,
    },
    // itemContent: {
    //   flex: 1,
    //   justifyContent: "center",
    //   backgroundColor: "transparent",
    // },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      backgroundColor: "transparent",
      gap: 5,
    },
    storedName: {
      color: colors.notification,
      fontWeight: "600",
      fontSize: 15,
    },
    currentBibleText: {
      color: colors.primary,
      fontWeight: "700",
    },
    expandButton: {
      padding: 4,
      alignSelf: "flex-end",
    },
    itemContent: {
      display: "flex",
      justifyContent: "space-between",
      flex: 1,
      marginBottom: 8,
      backgroundColor: "transparent",
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: "600",
      textTransform: "uppercase",
    },
    itemSubTitle: {
      fontSize: 14,
      color: colors.primary,
      marginTop: 2,
    },

    redownloadButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.notification + "20",
      marginLeft: "auto",
      marginHorizontal: 8,
    },
    bibleName: {
      paddingRight: 10,
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
    },
    defaultBadge: {
      backgroundColor: colors.notification + "20",
      paddingRight: 8,
      paddingVertical: 2,
      borderRadius: 12,
      alignSelf: "flex-start",
      marginTop: 4,
      flexDirection: "row",
      gap: 4,
      alignItems: "center",
    },
    defaultBadgeText: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.notification,
    },
    versionBadge: {
      backgroundColor: colors.notification + "20",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginRight: 8,
    },
    versionText: {
      fontSize: 12,
      color: colors.notification,
      fontWeight: "600",
    },
    badgeIcon: {
      fontWeight: "700",
      color: "#4ec9b0", // Success color from original code
      fontSize: 18,
    },
    currentBadge: {
      backgroundColor: colors.primary + "30",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginLeft: 8,
    },
    currentBadgeText: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: "700",
    },
    comingSoonBadge: {
      backgroundColor: "#FFA500" + "30",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginLeft: 8,
    },
    comingSoonText: {
      color: "#FFA500",
      fontSize: 9,
      fontWeight: "700",
    },
    disabledButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 8,
      borderRadius: 8,
      marginLeft: "auto",
      marginHorizontal: 8,
    },
    buttonContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      backgroundColor: "transparent",
      marginLeft: 4,
    },
    actionButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      padding: 8,
      borderRadius: 8,
      marginLeft: "auto",
      marginHorizontal: 8,
    },
    downloadButton: {
      borderColor: colors.primary + "50",
      backgroundColor: colors.notification + "20",
    },
    deleteButton: {
      borderColor: "#FF000050", // Error with opacity
    },
    cancelButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FF000010", // Error with opacity
      borderWidth: 1,
      borderColor: "#FF000030", // Error with opacity

      padding: 8,
      borderRadius: 8,
      marginLeft: "auto",
      marginHorizontal: 8,
    },
    retryButton: {
      borderColor: colors.notification + "50",
      backgroundColor: colors.notification + "20",
    },
    queuedIndicator: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.notification + "20",
      borderRadius: 8,
    },
    queuedText: {
      fontSize: 12,
      color: colors.notification,
      fontWeight: "600",
    },
    sizeContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      marginBottom: 8,
      backgroundColor: "transparent",
    },
    sizeText: {
      color: colors.text + "80",
      fontSize: 14,
      marginLeft: 6,
    },
    progressContainer: {
      marginVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    progressText: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.primary,
      fontWeight: "600",
    },
    unzipText: {
      marginTop: 8,
      color: colors.text + "80",
      fontSize: 14,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FF000015", // Error background with opacity
      padding: 10,
      borderRadius: 8,
      marginTop: 8,
    },
    errorText: {
      color: "#FF0000", // Error color
      marginLeft: 8,
      flex: 1,
      fontSize: 14,
    },
    detailsContainer: {
      marginTop: 12,
      padding: 12,
      backgroundColor: colors.background + "50",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    descriptionContainer: {
      marginBottom: 12,
    },
    descriptionText: {
      color: colors.text + "90",
      fontSize: 14,
      lineHeight: 20,
    },
    detailRow: {
      flexDirection: "row",
      marginVertical: 4,
      alignItems: "center",
      backgroundColor: "transparent",
    },
    detailLabel: {
      color: colors.text + "70",
      width: 90,
      fontSize: 14,
      fontWeight: "500",
    },
    detailValue: {
      color: colors.text,
      flex: 1,
      fontSize: 14,
    },
  });
