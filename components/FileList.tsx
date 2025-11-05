import { defaultDatabases, SQLiteDirPath } from "@/constants/databaseNames";
import { useBibleContext } from "@/context/BibleContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import type { useDownloadManager } from "@/hooks/useDownloadManager";
import useInstalledModules, { ModuleWithStatus } from "@/hooks/useInstalledModules";
import { TTheme } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import * as FileSystem from "expo-file-system";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import ProgressBar from "./home/footer/ProgressBar";
import Icon from "./Icon";
import { Text, View } from "./Themed";
import AllDatabases from "@/constants/AllDatabases";

type FileListProps = {
  downloadManager: ReturnType<typeof useDownloadManager>;
  isActive?: boolean;
};

const FileList: React.FC<FileListProps> = ({ downloadManager, isActive = true }) => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [listRevision, setListRevision] = useState<number>(0);

  // ✅ Use combined hook for modules with download status
  const {
    downloadedModules,
    isLoaded,
    refreshDatabaseList,
  } = useInstalledModules();

  const { selectBibleVersion } = useBibleContext();

  // ✅ Get download manager functions from props
  const { removeCompleted } = downloadManager;

  // ✅ Refresh when tab becomes active
  const prevActiveRef = useRef<boolean>(false);


  useEffect(() => {
    // Only refresh when transitioning from inactive to active
    if (isActive && !prevActiveRef.current) {
      const refreshOnActivate = async () => {
        await refreshDatabaseList();
        setListRevision((prev) => prev + 1);
      };
      refreshOnActivate();
    }
    prevActiveRef.current = isActive;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]); // Only trigger when isActive changes

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshDatabaseList();
      setListRevision((prev) => prev + 1);
    } finally {
      setRefreshing(false);
    }
  }, [refreshDatabaseList]);

  const deleteFile = async (item: ModuleWithStatus) => {
    // Check if file is currently being downloaded
    const isCurrentlyDownloading = item.downloadStatus === "downloading" || item.downloadStatus === "unzipping";

    if (isCurrentlyDownloading) {
      Alert.alert(
        "Descarga en progreso",
        "No se puede eliminar un archivo que se está descargando. Por favor, cancela la descarga primero.",
        [{ text: "Entendido", style: "cancel" }]
      );
      return;
    }

    Alert.alert(
      "Eliminar módulo",
      `¿Estás seguro que deseas eliminar "${item.name}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const fileUri = item.path;
              const storedNameWithoutExt = item.shortName.replace(/.db$/, "");
              const baseName = item.baseDownloadName || storedNameWithoutExt;

              // Check if there are any other files from the same base download BEFORE deleting
              const relatedFiles = downloadedModules.filter(f =>
                f.baseDownloadName === baseName &&
                f.shortName !== item.shortName // Not the file we're deleting
              );

              console.log(`Deleting ${storedNameWithoutExt}, found ${relatedFiles.length} related files from base: ${baseName}`);

              // Delete all database files
              await FileSystem.deleteAsync(fileUri, { idempotent: true });
              await FileSystem.deleteAsync(`${fileUri}-wal`, {
                idempotent: true,
              });
              await FileSystem.deleteAsync(`${fileUri}-shm`, {
                idempotent: true,
              });

              // Update stored data
              const dbTableCreated = storedData$.dbTableCreated.get();
              storedData$.dbTableCreated.set(
                dbTableCreated.filter((db: string) => db !== item.shortName)
              );

              // Clear download manager state for this file
              // Try to remove the exact match first (for extracted files like commentaries)
              removeCompleted(storedNameWithoutExt);

              // Only remove the base download entry if no related files remain
              if (relatedFiles.length === 0 && baseName !== storedNameWithoutExt) {
                console.log(`Removing base download entry: ${baseName} (no related files remaining)`);
                removeCompleted(baseName);
              }

              // Refresh the database list and wait for it to complete
              await refreshDatabaseList();

              // Increment list revision to force re-render
              setListRevision((prev) => prev + 1);

              // Select default bible if needed
              selectBibleVersion(defaultDatabases[0]);

              console.log("File deleted and list refreshed:", item.shortName);
            } catch (err) {
              setError("Error deleting file");
              console.error("Error deleting file:", err);
            }
          },
        },
      ]
    );
  };

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="folder-open-outline"
        size={80}
        color={theme.colors.border}
      />
      <Text style={styles.emptyTitle}>No tienes módulos instalados</Text>
      <Text style={styles.emptySubtitle}>
        Descarga módulos bíblicos y diccionarios desde la pestaña "Módulos"
      </Text>
    </View>
  );

  const ErrorComponent = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={60} color="#e74856" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  const refreshDatabase = async (dbName: ModuleWithStatus) => {
    Alert.alert(
      "Actualizar módulo",
      `La función de actualizar módulo requiere acceso a servicios de base de datos. Esta característica estará disponible próximamente.`,
      [{ text: "OK", style: "cancel" }]
    );
  };

  const listData = useMemo(() => {
    return downloadedModules;
  }, [downloadedModules]);

  const keyExtractor = useCallback(
    (item: ModuleWithStatus) => `downloaded-${item.path}`,
    []
  );

  // ✅ Get item type for recycling optimization
  const getItemType = useCallback((item: ModuleWithStatus) => {
    if (item.shortName.includes(".dictionary")) return "dictionary";
    if (item.shortName.includes(".commentaries")) return "commentary";
    return "bible";
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: ModuleWithStatus; index: number }) => {
      const versionItem = item;
      const allowDelete = !item.isDefault;
      const isBible = !item.shortName.includes(".dictionary") && !item.shortName.includes(".commentaries");

      // Download status is already in the item
      const isCurrentlyDownloading =
        item.downloadStatus === "downloading" ||
        item.downloadStatus === "unzipping";

      const suffix = versionItem.id.includes('commentaries') ? ' - Comentarios' : versionItem.id.includes('dictionary') ? ' - Diccionario' : '';

      return (
        <View >
          <View style={[styles.itemContainer, styles.defaultItem]}>
            <View style={styles.itemIconContainer}>
              <Ionicons
                name={isBible ? "book-outline" : "library-outline"}
                size={22}
                color={theme.colors.notification}
              />
            </View>

            <View style={styles.itemContent}>
              <Text
                style={[
                  styles.itemSubTitle,
                  !allowDelete && { color: theme.colors.primary },
                ]}
              >
                {versionItem?.name || "-"}{suffix}
              </Text>

              {isCurrentlyDownloading && item.downloadProgress !== undefined && (
                <View style={styles.progressContainer}>
                  <ProgressBar
                    height={4}
                    color={theme.colors.primary}
                    barColor={theme.colors.border}
                    progress={item.downloadProgress}
                    circleColor={theme.colors.notification}
                  />
                </View>
              )}
            </View>

            {!allowDelete && !isCurrentlyDownloading && (
              <TouchableOpacity
                style={styles.redownloadButton}
                onPress={() => refreshDatabase(versionItem!)}
              >
                <Icon
                  name="RefreshCcw"
                  size={20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            )}

            {!isCurrentlyDownloading && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteFile(item)}
              >
                <Icon name="Trash2" size={20} color="#e74856" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    },
    [theme, refreshDatabase]
  );

  // Conditional rendering without early returns to avoid breaking Rules of Hooks
  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando módulos...</Text>
      </View>
    );
  }

  if (error) {
    return <ErrorComponent />;
  }

  // console.log("listData", listData);

  return (
    <FlashList
      key={`file-list-${listData.length}-${listRevision}`}
      data={listData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType} // Enable item recycling for better performance
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<EmptyComponent />}
      ListHeaderComponent={
        <View style={[styles.sectionHeader]}>
          <Text style={styles.sectionTitle}>Módulos descargados</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{listData.length}</Text>
          </View>
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    />
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    listContent: {
      // flexGrow: 1,
      paddingBottom: 20,
    },
    itemContainer: {
      padding: 12,
      borderRadius: 12,
      marginVertical: 4,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
    },
    defaultItem: {
      backgroundColor: colors.card + "80",
      borderWidth: 1,
      borderColor: colors.notification + "30",
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
    itemContent: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: "600",
    },
    itemSubTitle: {
      fontSize: 14,
      color: colors.primary,
      marginTop: 2,
    },
    deleteButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: "#e7485620",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.text + "90",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 60,
      paddingHorizontal: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      marginTop: 16,
      color: colors.text,
    },
    emptySubtitle: {
      fontSize: 16,
      textAlign: "center",
      marginTop: 8,
      color: colors.text + "70",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      textAlign: "center",
      marginTop: 12,
      color: "#e74856",
    },
    retryButton: {
      marginTop: 16,
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: colors.notification + "30",
      borderRadius: 20,
    },
    retryButtonText: {
      fontWeight: "600",
      color: colors.notification,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 10,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.notification,
    },
    countBadge: {
      backgroundColor: colors.notification + "30",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginLeft: 8,
    },
    countText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.notification,
    },
    defaultBadge: {
      backgroundColor: colors.notification + "20",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      alignSelf: "flex-start",
      marginTop: 4,
    },
    defaultBadgeText: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.notification,
    },
    redownloadButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.notification + "20",
      marginLeft: "auto",
      marginHorizontal: 8,
    },
    downloadingBadge: {
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
    downloadingBadgeText: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.primary,
    },
    progressContainer: {
      marginTop: 8,
      width: "100%",
    },
  });

export default FileList;
