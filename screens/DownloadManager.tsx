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
  const dbNames = Object.values(DBName);

  // useEffect(() => {
  //   (async () => {
  //     if (!myBibleDB || !executeSql) return;
  //     const verses = await executeSql(myBibleDB, GET_ALL_FAVORITE_VERSES, []);
  //     setData(verses ?? []);
  //   })();

  //   return () => {};
  // }, [myBibleDB]);

  const getIfDatabaseNeedsDownload = async (name: string) => {
    const path = `${SQLiteDirPath}/${name}`;
    await initSQLiteDir();
    const file = await FileSystem.getInfoAsync(path);

    if (!file.exists) {
      return true;
    }

    return false;
  };

  const downloadBible = (item: DownloadBibleItem) => {
    const downloadFrom = `${baseDownloadUrl}/${item.url}`;
    const needDownload = getIfDatabaseNeedsDownload(item.name);
    console.log(item, { needDownload });
  };

  const FileSizeText = (size: number) => {
    const sizeInMB = size / (1024 * 1024);

    if (sizeInMB >= 1) {
      return <Text style={styles.sizeText}>{sizeInMB.toFixed(2)} MB</Text>;
    } else {
      const sizeInKB = size / 1024;
      return <Text style={styles.sizeText}>{sizeInKB.toFixed(2)} KB</Text>;
    }
  };

  const renderItem: ListRenderItem<DownloadBibleItem> = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Text style={{ color: theme.colors.notification }}>
          {item.storedName}
        </Text>
        <View style={styles.itemContent}>
          <Text style={{ paddingRight: 10, width: "90%" }}>{item.name}</Text>
          <TouchableOpacity onPress={() => downloadBible(item)}>
            <MaterialCommunityIcons
              style={styles.icon}
              name="download"
              // name={item.needDownload ? "download" : "check"}
              size={30}
              color={theme.colors.notification}
            />
          </TouchableOpacity>
        </View>
        {FileSizeText(item.size)}
      </View>
    );
  };

  return (
    <View style={{ paddingHorizontal: 20, flex: 1 }}>
      <FlashList
        ListHeaderComponent={
          <Text style={{ fontSize: 28, marginBottom: 10 }}>Bibles</Text>
        }
        contentContainerStyle={{ paddingVertical: 10 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        estimatedItemSize={10}
        renderItem={renderItem}
        data={databasesToDownload}
        keyExtractor={(item: any, index: any) => `download-${index}`}
      />
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
      fontSize: 24,
    },
    sizeText: {
      color: colors.notification,
      alignSelf: "flex-end",
      fontSize: 18,
    },
  });

export default DownloadManager;
