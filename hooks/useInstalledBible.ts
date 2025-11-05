import AllDatabases from "@/constants/AllDatabases";
import {
  databaseNames,
  getDatabaseExt,
  initSQLiteDir,
  SQLiteDirPath,
} from "@/constants/databaseNames";
import { DATABASE_TYPE } from "@/types";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";

export type VersionItem = {
  id: string;
  name: string;
  description: string;
  size: number;
  path: string;
  shortName: string;
};

const useInstalledBibles = () => {

  const [installedBibles, setInstalledBibles] =
    useState<VersionItem[]>(databaseNames);
  const [installedDictionary, setInstalledDictionary] =
    useState<VersionItem[]>([]);
  const [installedCommentary, setInstalledCommentary] =
    useState<VersionItem[]>([]);
  const [refreshList, setRefreshList] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const bibleDirectory = `${SQLiteDirPath}/`;
  const bibleExt = getDatabaseExt(DATABASE_TYPE.BIBLE).replace("-", "");
  const dicExt = getDatabaseExt(DATABASE_TYPE.DICTIONARY);
  const commentaryExt = getDatabaseExt(DATABASE_TYPE.COMMENTARY);

  const refreshDatabaseList = () => {
    setRefreshList((prev) => !prev);
  };

  const formatArray = (arr: string[]) => {
    return arr
      .map((file) => {
        const findBible = AllDatabases.find((version) =>
          file.includes(version.storedName)
        );

        return findBible
          ? {
            id: file.split('-').shift() || '',
            // id: findBible.storedName,
            name: findBible.name,
            description: findBible.key,
            size: findBible.size,
            path: `${bibleDirectory}${file}`,
            shortName: findBible.storedName,
          }
          : null;
      })
      .filter((x) => x) as any;
  };

  useEffect(() => {
    const checkInstalledBible = async () => {
      try {
        await initSQLiteDir();
        const files = await FileSystem.readDirectoryAsync(bibleDirectory);

        const bibleFiles = files.filter((file) => file.endsWith(bibleExt));
        const dicFiles = files.filter((file) => file.endsWith(dicExt));
        const commentaryFiles = files.filter((file) => file.endsWith(commentaryExt));

        setInstalledBibles((prev) => [...databaseNames, ...formatArray(bibleFiles)]);
        setInstalledDictionary(() => [...formatArray(dicFiles)]);
        setInstalledCommentary(() => [...formatArray(commentaryFiles)]);
      } catch (error) {
        console.error("Error checking installed Bible:", error);
      } finally {
        setLoading(false);
      }
    };

    checkInstalledBible();
  }, [refreshList]);

  return { installedBibles, installedDictionary, installedCommentary, isLoaded: !loading, refreshDatabaseList };
};

export default useInstalledBibles;
