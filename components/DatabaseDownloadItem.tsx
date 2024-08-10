import { StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TTheme } from "types";
import * as FileSystem from "expo-file-system";
import {
  baseDownloadUrl,
  getIfDatabaseNeedsDownload,
  SQLiteDirPath,
} from "constants/databaseNames";
import { Text, View } from "./Themed";
import { DownloadedDatabase } from "classes/Database";
import ProgressBar from "./home/footer/ProgressBar";
// import { unzip } from "react-native-zip-archive";
import JSZip from "jszip";
// @ts-ignore
import { decode as atob, encode as btoa } from "base-64";
import unzipFile from "utils/unzipFile";

type DownloadBibleItem = {
  name: string;
  url: string;
  key: string;
  storedName: string;
  size: number;
};

type DatabaseDownloadItemProps = {
  item: DownloadBibleItem;
  theme: TTheme;
};

const DatabaseDownloadItem = ({ item, theme }: DatabaseDownloadItemProps) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [unzipProgress, setUnzipProgress] = useState("");
  const { size, url, storedName, name } = item;
  const styles = getStyles(theme);
  const downloadFrom = `${baseDownloadUrl}/${url}`;
  const fileUri = `${SQLiteDirPath}/${storedName}`;

  useEffect(() => {
    async function needD() {
      return await getIfDatabaseNeedsDownload(storedName + ".SQLite3");
    }
    needD().then((res) => {
      setIsDownloaded(!res);
    });
  }, []);

  const calculateProgress = ({
    totalBytesExpectedToWrite,
    totalBytesWritten,
  }: FileSystem.DownloadProgressData) => {
    const fileProgress = Math.floor((totalBytesWritten / size) * 100) / 100;
    if (fileProgress === 1) {
      setProgress(0);
      setIsDownloaded(true);
    }
    setProgress(fileProgress);
  };

  const startDownload = async () => {
    try {
      const uri = downloadFrom;
      const downloadDest = `${fileUri}.zip`;
      console.log(`Downloading ${storedName}`);

      await FileSystem.createDownloadResumable(
        uri,
        downloadDest,
        {},
        calculateProgress
      ).downloadAsync();
      // Progress callback function
      const progressCallback = (progress: string) => {
        setUnzipProgress(progress);
        console.log(progress); // Update UI or state here with progress
      };

      await unzipFile({
        zipFileUri: downloadDest,
        onProgress: progressCallback,
      });
      // await unzipFile(downloadDest);
    } catch (error) {
      console.error(error);
    }
  };

  const downloadBible = async () => {
    const needDownload = await getIfDatabaseNeedsDownload(storedName);
    if (needDownload) {
      startDownload();
    }
    console.log(storedName, { needDownload });
  };

  const FileSizeText = (size: number) => {
    const sizeInMB = size / (1024 * 1024);

    if (sizeInMB >= 1) {
      return <Text style={styles.sizeText}>⚠️ {sizeInMB.toFixed(2)} MB</Text>;
    } else {
      const sizeInKB = size / 1024;
      return <Text style={styles.sizeText}>⚠️ {sizeInKB.toFixed(2)} KB</Text>;
    }
  };

  const deleteBibleFile = async () => {
    const bibleObject = new DownloadedDatabase(storedName + ".zip");
    const deleted = await bibleObject.delete();
    console.log({ deleted });
    setIsDownloaded(false);
    setProgress(0);
  };

  return (
    <View style={styles.itemContainer}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: theme.colors.notification }}>{storedName}</Text>
        {isDownloaded && (
          <MaterialCommunityIcons
            style={[
              styles.icon,
              { color: theme.colors.notification, fontSize: 20 },
            ]}
            name="check"
            color={theme.colors.notification}
          />
        )}
      </View>
      <View style={styles.itemContent}>
        <Text
          style={{
            paddingRight: 10,
            flex: 1,
          }}
        >
          {name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            flex: 0.3,
          }}
        >
          {isDownloaded ? (
            <TouchableOpacity onPress={() => deleteBibleFile()}>
              <MaterialCommunityIcons
                style={[styles.icon, { color: "#e74856" }]}
                name="delete"
                // name={item.needDownload ? "download" : "check"}
                size={30}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => downloadBible()}>
              <MaterialCommunityIcons
                style={[styles.icon, { color: theme.colors.notification }]}
                name="download"
                size={30}
                color={theme.colors.notification}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {FileSizeText(item.size)}
      <Text style={{ marginVertical: 15, color: theme.colors.text }}>
        {unzipProgress}
      </Text>
      {!!progress && !isDownloaded && (
        <View style={{ marginVertical: 15 }}>
          <ProgressBar
            height={8}
            color={theme.colors.notification}
            barColor={theme.colors.text}
            progress={progress}
            circleColor={theme.colors.notification}
          />
        </View>
      )}
    </View>
  );
};

export default DatabaseDownloadItem;

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
      flex: 1,
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
