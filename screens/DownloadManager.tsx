import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { Text, View } from "components/Themed";
import { GET_ALL_FAVORITE_VERSES } from "constants/Queries";
import { useDBContext } from "context/databaseContext";
import { DBName } from "enums";
import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { RootStackScreenProps, TTheme } from "types";
import * as FileSystem from "expo-file-system";
import { baseDownloadUrl, SQLiteDirPath } from "constants/databaseNames";
import bibleDatabases from "constants/bibleDatabases";
import DatabaseDownloadItem from "components/DatabaseDownloadItem";
import FileList from "components/FileList";
import TabNavigation from "components/DownloadManagerTab";
import removeAccent from "utils/removeAccent";
import useDebounce from "hooks/useDebounce";

type DownloadBibleItem = {
  name: string;
  url: string;
  key: string;
  storedName: string;
  size: number;
};

const initSQLiteDir = async () => {
  const sqliteDir = await FileSystem.getInfoAsync(SQLiteDirPath);

  if (!sqliteDir.exists) {
    await FileSystem.makeDirectoryAsync(SQLiteDirPath);
  } else if (!sqliteDir.isDirectory) {
    throw new Error("SQLite dir is not a directory");
  }
};

const DownloadManager: React.FC<
  RootStackScreenProps<"DownloadManager">
> = () => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const databasesToDownload: DownloadBibleItem[] = bibleDatabases;
  const [isMyDownloadTab, setIsMyDownloadTab] = useState(false);
  const [searchText, setSearchText] = useState<any>(null);
  const debouncedSearchText = useDebounce(searchText, 500);

  const NoteHeader = () => {
    return (
      <View style={[styles.noteHeader]}>
        <Text style={[styles.noteListTitle]}>Gestor de Modulos</Text>
        {!isMyDownloadTab && (
          <View style={styles.searchContainer}>
            <Ionicons
              style={styles.searchIcon}
              name="search"
              size={24}
              color={theme.colors.notification}
            />
            <TextInput
              placeholder="Buscar un modulo..."
              style={[styles.noteHeaderSearchInput]}
              onChangeText={(text) => setSearchText(text)}
              value={searchText}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ paddingHorizontal: 20, flex: 1 }}>
      {NoteHeader()}
      <TabNavigation {...{ isMyDownloadTab, setIsMyDownloadTab, theme }} />
      {!isMyDownloadTab ? (
        <FlashList
          ListHeaderComponent={
            <Text style={{ fontSize: 28, marginBottom: 10 }}>Modulos</Text>
          }
          contentContainerStyle={{ paddingVertical: 10 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          estimatedItemSize={10}
          renderItem={(props) => (
            <DatabaseDownloadItem {...{ theme, ...props }} />
          )}
          data={
            debouncedSearchText
              ? databasesToDownload.filter(
                  (version) =>
                    removeAccent(version.name).indexOf(
                      debouncedSearchText.toLowerCase()
                    ) !== -1
                )
              : databasesToDownload
          }
          keyExtractor={(item: any, index: any) => `download-${index}`}
        />
      ) : (
        <FileList />
      )}
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    itemContainer: {
      display: "flex",
      paddingVertical: 10,
    },
    itemContent: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    separator: {
      height: 1,
      backgroundColor: colors.notification + "40",
      marginVertical: 8,
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.notification + "90",
      fontSize: 28,
    },
    sizeText: {
      color: colors.notification,
    },
    noteHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
      paddingTop: 10,
      backgroundColor: "transparent",
      // borderWidth: 1,
      // borderColor: "red",
    },
    noteListTitle: {
      fontSize: 30,
      marginVertical: 10,
      fontWeight: "bold",
      textAlign: "center",
      color: colors.notification,
    },
    noteHeaderSubtitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      alignSelf: "flex-start",
    },
    searchContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      borderRadius: 10,
      marginTop: 20,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.notification,
      borderStyle: "solid",
      width: "100%",
      fontWeight: "100",
      backgroundColor: colors.notification + "99",
    },
    searchIcon: {
      color: colors.text,
      paddingHorizontal: 15,
      borderRadius: 10,
      fontWeight: "bold",
    },
    noteHeaderSearchInput: {
      borderRadius: 10,
      padding: 10,
      paddingLeft: 15,
      fontSize: 18,
      flex: 1,
      fontWeight: "100",
      backgroundColor: "#ddd",
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
  });

export default DownloadManager;