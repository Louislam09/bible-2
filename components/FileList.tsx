import { defaultDatabases } from "@/constants/databaseNames";
import { useBibleContext } from "@/context/BibleContext";
import { useDBContext } from "@/context/databaseContext";
import { useMyTheme } from "@/context/ThemeContext";
import { VersionItem } from "@/hooks/useInstalledBible";
import { TTheme } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import * as FileSystem from "expo-file-system";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Icon from "./Icon";
import { Text, View } from "./Themed";
import { storedData$ } from "@/context/LocalstoreContext";

const FileList = () => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const {
    refreshDatabaseList,
    installedBibles,
    installedDictionary,
    mainBibleService,
    interlinearService,
    interlinearGreekService,
  } = useDBContext();
  const { selectBibleVersion } = useBibleContext();

  const extractionPath = `${FileSystem.documentDirectory}SQLite/`;

  const fetchFiles = async () => {
    const fileList = await FileSystem.readDirectoryAsync(extractionPath);
    // console.log({ fileList });

    try {
      setFiles(
        fileList.filter((file) => file.endsWith(".db") || file.endsWith(".zip"))
      );
    } catch (err) {
      setError("Error fetching files");
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log("Refreshing files...");
      refreshDatabaseList();
      await fetchFiles();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const deleteFile = async (item: VersionItem) => {
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
              await FileSystem.deleteAsync(fileUri, { idempotent: true });
              await FileSystem.deleteAsync(`${fileUri}-wal`, {
                idempotent: true,
              });
              await FileSystem.deleteAsync(`${fileUri}-shm`, {
                idempotent: true,
              });
              const dbTableCreated = storedData$.dbTableCreated.get();
              storedData$.dbTableCreated.set(
                dbTableCreated.filter((db: string) => db !== item.id)
              );
              refreshDatabaseList();
              await onRefresh();
              selectBibleVersion(defaultDatabases[0]);
            } catch (err) {
              setError("Error deleting file");
              console.error("Error deleting file:", err);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchFiles();
  }, []);

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
      <TouchableOpacity style={styles.retryButton} onPress={fetchFiles}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSection = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );

  const refreshDatabase = async (dbName: VersionItem) => {
    const isInterlinear = dbName.id.includes("interlinear");
    if (isInterlinear) {
      Alert.alert(
        "Actualizar módulo",
        `¿Quieres descargar de nuevo "${dbName.name}"? Esto reemplazará los datos actuales de la biblia, notas, favoritos, etc.`
      );
      interlinearService.reOpen(dbName);
      return;
    }

    const isGreekInterlinear = dbName.id.includes("greek");
    if (isGreekInterlinear) {
      Alert.alert(
        "Actualizar módulo",
        `¿Quieres descargar de nuevo "${dbName.name}"? Esto reemplazará los datos actuales de la biblia, notas, favoritos, etc.`
      );
      interlinearGreekService.reOpen(dbName);
      return;
    }

    Alert.alert(
      "Actualizar módulo",
      `¿Quieres descargar de nuevo "${dbName.name}"? Esto reemplazará los datos actuales de la biblia, notas, favoritos, etc.`,
      [
        {
          text: "No, cancelar",
          style: "cancel",
        },
        {
          text: "Sí, actualizar",
          onPress: async () => {
            console.log("Iniciando actualización de base de datos:", dbName);
            try {
              const db = await mainBibleService.reOpen(dbName);
              if (db) {
                selectBibleVersion(dbName.id);
                Alert.alert(
                  "Actualización exitosa",
                  `"${dbName.name}" se ha actualizado correctamente.`
                );
              } else {
                setError("Hubo un problema al descargar la base de datos.");
              }
            } catch (err) {
              setError("Hubo un problema al descargar la base de datos.");
              console.error("Error al descargar la base de datos:", err);
            }
          },
        },
      ]
    );
  };

  const renderItem = useCallback(
    ({ item, index }: { item: VersionItem; index: number }) => {
      const versionItem = item;
      const allowDelete = !defaultDatabases.includes(versionItem?.id as string);
      // const allowDelete = !defaultDatabases.includes(versionItem?.id as string);
      const isBible = index < installedBibles.length;

      return (
        <View>
          {index === 0 &&
            renderSection(
              "Biblias & Diccionarios",
              installedBibles.length + (installedDictionary.length || 0)
            )}

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
                  styles.itemTitle,
                  !allowDelete && { color: theme.colors.notification },
                ]}
              >
                {versionItem?.shortName || "-"}
              </Text>
              <Text
                style={[
                  styles.itemSubTitle,
                  !allowDelete && { color: theme.colors.primary },
                ]}
              >
                {versionItem?.name || "-"}
              </Text>
              {!allowDelete && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Predeterminado</Text>
                </View>
              )}
            </View>

            {!allowDelete && (
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

            {/* {allowDelete && ( */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteFile(item)}
            >
              <Icon name="Trash2" size={20} color="#e74856" />
            </TouchableOpacity>
            {/* )} */}
          </View>
        </View>
      );
    },
    [theme]
  );

  if (loading) {
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

  return (
    <FlashList
      data={[...installedBibles, ...installedDictionary]}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<EmptyComponent />}
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
  });

export default FileList;
