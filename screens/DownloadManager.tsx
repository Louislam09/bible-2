import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { Text, View } from "components/Themed";
import { GET_ALL_FAVORITE_VERSES } from "constants/Queries";
import { useDBContext } from "context/databaseContext";
import { DBName } from "enums";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { RootStackScreenProps, TTheme } from "types";
import * as FileSystem from "expo-file-system";
import { baseDownloadUrl, SQLiteDirPath } from "constants/databaseNames";
import bibleDatabases from "constants/bibleDatabases";
import DatabaseDownloadItem from "components/DatabaseDownloadItem";
import FileList from "components/FileList";
import TabNavigation from "components/DownloadManagerTab";

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

const DownloadManager: React.FC<RootStackScreenProps<"DownloadManager">> = (
  props
) => {
  const { myBibleDB, executeSql } = useDBContext();
  const theme = useTheme();
  const styles = getStyles(theme);
  const databasesToDownload: DownloadBibleItem[] = bibleDatabases;
  const [isMyDownloadTab, setIsMyDownloadTab] = useState(false);

  return (
    <View style={{ paddingHorizontal: 20, flex: 1 }}>
      <TabNavigation {...{ isMyDownloadTab, setIsMyDownloadTab, theme }} />
      {!isMyDownloadTab ? (
        <FlashList
          ListHeaderComponent={
            <Text style={{ fontSize: 28, marginBottom: 10 }}>Bibles</Text>
          }
          contentContainerStyle={{ paddingVertical: 10 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          estimatedItemSize={10}
          renderItem={(props) => (
            <DatabaseDownloadItem {...{ theme, ...props }} />
          )}
          data={databasesToDownload}
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
  });

export default DownloadManager;
