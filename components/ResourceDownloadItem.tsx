import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DownloadedDatabase } from "classes/Database";
import {
  baseDownloadUrl,
  dbFileExt,
  defaultDatabases,
  getIfDatabaseNeedsDownload,
  SQLiteDirPath,
} from "constants/databaseNames";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { DownloadBibleItem, TTheme } from "types";
import ProgressBar from "./home/footer/ProgressBar";
import { Text, View } from "./Themed";
import { useBibleContext } from "context/BibleContext";
import { useDBContext } from "context/databaseContext";
import unzipFile from "utils/unzipFile";
import DownloadButton from "./DatabaseDownloadButton";

type DatabaseDownloadItemProps = {
  item: DownloadBibleItem;
  theme: TTheme;
};

const ResourceDownloadItem = ({ item, theme }: DatabaseDownloadItemProps) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [unzipProgress, setUnzipProgress] = useState("");
  const { size, url, storedName, name } = item;
  const styles = getStyles(theme);
  const downloadFrom = `${baseDownloadUrl}/${url}`;
  const fileUri = `${SQLiteDirPath}/${storedName}`;
  const { refreshDatabaseList } = useDBContext();
  const { selectBibleVersion } = useBibleContext();

  useEffect(() => {
    async function needD() {
      return await getIfDatabaseNeedsDownload(storedName + dbFileExt);
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
      // console.log(`Downloading ${storedName}`);

      await FileSystem.createDownloadResumable(
        uri,
        downloadDest,
        {},
        calculateProgress
      ).downloadAsync();

      const progressCallback = (progress: string) => {
        setUnzipProgress(progress);
      };

      await unzipFile({
        zipFileUri: downloadDest,
        onProgress: progressCallback,
      });
      setIsLoading(false);
      refreshDatabaseList();
    } catch (error) {
      console.error(error);
    }
  };

  const downloadBible = async () => {
    const needDownload = await getIfDatabaseNeedsDownload(storedName);
    if (needDownload) {
      setIsLoading(true);
      startDownload();
    }
  };

  const FileSizeText = (size: number) => {
    const sizeInMB = size / (1024 * 1024);

    if (sizeInMB >= 1) {
      return (
        <Text
          style={[
            styles.sizeText,
            item?.disabled && { color: theme.colors.text + "70" },
          ]}
        >
          ⚠️ {sizeInMB.toFixed(2)} MB
        </Text>
      );
    } else {
      const sizeInKB = size / 1024;
      return (
        <Text
          style={[
            styles.sizeText,
            item?.disabled && { color: theme.colors.text + "70" },
          ]}
        >
          ⚠️ {sizeInKB.toFixed(2)} KB
        </Text>
      );
    }
  };

  const deleteBibleFile = async () => {
    const bibleObject = new DownloadedDatabase(storedName + dbFileExt);
    const deleted = await bibleObject.delete();
    if (!deleted) return;
    setIsDownloaded(false);
    setProgress(0);
    refreshDatabaseList();
    selectBibleVersion(defaultDatabases[0]);
  };

  return (
    <View style={styles.itemContainer}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text
          style={[
            { color: theme.colors.notification },
            item?.disabled && { color: theme.colors.notification + "70" },
          ]}
        >
          {storedName}
        </Text>
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
          style={[
            {
              paddingRight: 10,
              flex: 1,
            },
            item?.disabled && { color: theme.colors.text + "70" },
          ]}
        >
          {name}
        </Text>
        <View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              flex: 0.3,
            },
            item?.disabled && { display: "none" },
          ]}
        >
          <DownloadButton
            {...{
              deleteFile: deleteBibleFile,
              downloadFile: downloadBible,
              isDownloaded,
              progress: isLoading,
              theme,
            }}
          />
        </View>
      </View>
      {FileSizeText(item.size)}
      {isDownloaded && unzipProgress && (
        <Text style={{ marginVertical: 15, color: theme.colors.text }}>
          {unzipProgress}
        </Text>
      )}
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

export default ResourceDownloadItem;

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
