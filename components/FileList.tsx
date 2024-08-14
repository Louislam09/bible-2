import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { defaultDatabases } from "constants/databaseNames";
import { useBibleContext } from "context/BibleContext";
import { useDBContext } from "context/databaseContext";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Text, View } from "./Themed";

const FileList = () => {
  const theme = useTheme();
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshDatabaseList, installedBibles, installedDictionary } =
    useDBContext();
  const { selectBibleVersion, fontSize } = useBibleContext();

  const extractionPath = `${FileSystem.documentDirectory}SQLite/`;

  const fetchFiles = async () => {
    try {
      const fileList = await FileSystem.readDirectoryAsync(extractionPath);
      setFiles(fileList);
    } catch (err) {
      setError("Error fetching files");
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileName: string) => {
    try {
      const fileUri = `${extractionPath}${fileName}`;
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      setFiles(files.filter((file) => file !== fileName));
      refreshDatabaseList();
      selectBibleVersion(defaultDatabases[0]);
    } catch (err) {
      setError("Error deleting file");
      console.error("Error deleting file:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const withTitle = (indexes: number[], index: number) => {
    const addTitle = indexes.includes(index);
    const text = index === 0 ? "Biblias" : "Diccionarios";

    return addTitle ? (
      <Text
        style={{
          fontSize,
          paddingVertical: 10,
          color: theme.colors.notification,
        }}
      >
        {text}
      </Text>
    ) : (
      <></>
    );
  };

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    const versionItem = [...installedBibles, ...installedDictionary].find(
      (version) => version.path.includes(item)
    );
    const allowDelete = !defaultDatabases.includes(versionItem?.id as string);
    return (
      <View>
        {withTitle([0, installedBibles.length], index)}
        <View style={[styles.itemContainer]}>
          <View style={{ justifyContent: "center", flex: 1 }}>
            <Text
              style={[
                styles.itemText,
                !allowDelete && { color: theme.colors.notification + "70" },
              ]}
            >
              {versionItem?.shortName}
            </Text>
            <Text
              style={[
                styles.itemText,
                !allowDelete && { color: theme.colors.text + "70" },
              ]}
            >
              {versionItem?.name || item}
            </Text>
          </View>
          {allowDelete && (
            <MaterialCommunityIcons
              onPress={() => deleteFile(item)}
              style={{
                color: "#e74856",
              }}
              name="delete"
              size={30}
            />
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <FlashList
      estimatedItemSize={50}
      data={files}
      renderItem={renderItem}
      keyExtractor={(item) => item}
      ListEmptyComponent={<Text>No files found</Text>}
    />
  );
};

// Styles for the component
const styles = StyleSheet.create({
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee40",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default FileList;
