import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { Text, View } from "./Themed";

// Component to render a list of saved files with delete functionality
const FileList = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Define the directory where files are saved
  const extractionPath = `${FileSystem.documentDirectory}SQLite/`;

  // Function to fetch files from the directory
  const fetchFiles = async () => {
    try {
      // List files in the extraction directory
      const fileList = await FileSystem.readDirectoryAsync(extractionPath);
      setFiles(fileList);
    } catch (err) {
      setError("Error fetching files");
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a file
  const deleteFile = async (fileName: string) => {
    try {
      const fileUri = `${extractionPath}${fileName}`;
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      setFiles(files.filter((file) => file !== fileName)); // Remove file from state
      console.log("File deleted:", fileUri);
    } catch (err) {
      setError("Error deleting file");
      console.error("Error deleting file:", err);
    }
  };

  // Fetch files when component mounts
  useEffect(() => {
    fetchFiles();
  }, []);

  // Render each file item with delete button
  const renderItem = ({ item }: { item: string }) => (
    <View style={styles.itemContainer}>
      <Text style={[styles.itemText]}>{item}</Text>
      {!item.includes("bible") && (
        <TouchableOpacity
          disabled={item.includes("bible")}
          onPress={() => deleteFile(item)}
          style={styles.deleteButton}
        >
          <Text style={[styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <FlatList
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
    borderBottomColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
    flex: 1,
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
