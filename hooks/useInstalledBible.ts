import { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { databaseNames, SQLiteDirPath } from "constants/databaseNames";
import bibleDatabases from "constants/bibleDatabases";

export type VersionItem = {
  id: string;
  name: string;
  description: string;
  size: number;
  path: string;
  shortName: string;
};

const useInstalledBibles = () => {
  const [bible, ntvBible] = databaseNames;
  const defaultDBs = [bible, ntvBible];
  const [installedBibles, setInstalledBibles] =
    useState<VersionItem[]>(defaultDBs);
  const [refreshList, setRefreshList] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const bibleDirectory = `${SQLiteDirPath}/`;

  const refreshDatabaseList = () => {
    setRefreshList((prev) => !prev);
  };

  useEffect(() => {
    const checkInstalledBible = async () => {
      try {
        const files = await FileSystem.readDirectoryAsync(bibleDirectory);

        const bibleFiles = files.filter((file) => file.endsWith(".db"));
        const currentDownloadedModules = bibleFiles
          .map((file) => {
            const findBible = bibleDatabases.find((version) =>
              file.includes(version.storedName)
            );

            return findBible
              ? {
                  id: findBible.storedName,
                  name: findBible.name,
                  description: findBible.key,
                  size: findBible.size,
                  path: `${bibleDirectory}${file}`,
                  shortName: findBible.storedName,
                }
              : null;
          })
          .filter((x) => x) as any;

        setInstalledBibles(() => [...defaultDBs, ...currentDownloadedModules]);
      } catch (error) {
        console.error("Error checking installed Bible:", error);
      } finally {
        setLoading(false);
      }
    };

    checkInstalledBible();
  }, [refreshList]);

  return { installedBibles, loading, refreshDatabaseList };
};

export default useInstalledBibles;