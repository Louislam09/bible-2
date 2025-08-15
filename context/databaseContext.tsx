import useInstalledBibles, { VersionItem } from "@/hooks/useInstalledBible";
import {
  UseInterlinearDatabase,
  useInterlinearDB,
} from "@/hooks/useInterlinearDB";
import useLoadDatabase, { UseLoadDB } from "@/hooks/useLoadDatabase";
import { DEFAULT_DATABASE, EBibleVersions } from "@/types";
import { showToast } from "@/utils/showToast";
import { use$ } from "@legendapp/state/react";
import * as SQLite from "expo-sqlite";
import React, { createContext, useContext, useEffect, useMemo } from "react";
import { storedData$ } from "./LocalstoreContext";

type DatabaseContextType = {
  myBibleDB?: SQLite.SQLiteDatabase | null;
  executeSql: <T = any>(
    sql: string,
    params?: any[],
    queryName?: string
  ) => Promise<T[]>;
  installedBibles: VersionItem[];
  installedDictionary: VersionItem[];
  isInstallBiblesLoaded: boolean;
  isMyBibleDbLoaded: boolean;
  refreshDatabaseList: () => void;
  reDownloadDatabase: (
    _dbName?: VersionItem
  ) => Promise<SQLite.SQLiteDatabase | undefined>;
  interlinearService: UseInterlinearDatabase;
  mainBibleService: UseLoadDB;
  openDatabaseFromZip(
    databaseItem: VersionItem,
    isReDownload?: boolean
  ): Promise<SQLite.SQLiteDatabase | undefined>;
};

const initialContext: DatabaseContextType = {
  myBibleDB: null,
  executeSql: async (sql: string, params?: any[], queryName?: string) => [],
  installedBibles: [],
  installedDictionary: [],
  isInstallBiblesLoaded: false,
  isMyBibleDbLoaded: false,
  refreshDatabaseList: () => {},
  reDownloadDatabase: (_dbName?: VersionItem) => Promise.resolve(undefined),
  openDatabaseFromZip: (databaseItem: VersionItem, isReDownload?: boolean) =>
    Promise.resolve(undefined as any),
  interlinearService: {
    database: null,
    isLoaded: false,
    error: null,
    executeSql: async (sql: string, params?: any[], queryName?: string) => [],
  },
  mainBibleService: {
    database: null,
    executeSql: async (sql: string, params?: any[], queryName?: string) => [],
    isLoaded: false,
  },
};

export const DatabaseContext =
  createContext<DatabaseContextType>(initialContext);

const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentBibleVersion, isDataLoaded } = use$(() => ({
    currentBibleVersion: storedData$.currentBibleVersion.get(),
    isDataLoaded: storedData$.isDataLoaded.get(),
  }));
  const {
    installedBibles,
    isLoaded,
    refreshDatabaseList,
    installedDictionary,
  } = useInstalledBibles();

  const currentDbName = useMemo(
    () => installedBibles?.find((x) => x.id === currentBibleVersion),
    [installedBibles, currentBibleVersion]
  );

  const isInterlinear = useMemo(
    () =>
      [EBibleVersions.INT, EBibleVersions.INTERLINEAL].includes(
        currentBibleVersion as EBibleVersions
      ),
    [currentBibleVersion]
  );

  const mainBibleService = useLoadDatabase({
    currentBibleVersion: isDataLoaded && isLoaded ? currentDbName : undefined,
    isInterlinear,
  });

  const interlinearService = useInterlinearDB({
    databaseId: DEFAULT_DATABASE.INTERLINEAR,
    isInterlinear,
    onProgress: (msg) => {
      showToast(msg, "SHORT");
    },
    enabled: mainBibleService.isLoaded,
  });

  const reDownloadDatabase: any = () => {
    console.log("reDownloadDatabase");
  };

  const openDatabaseFromZip: any = () => {
    console.log("openDatabaseFromZip");
  };

  const dbContextValue = {
    myBibleDB: mainBibleService.database,
    executeSql: mainBibleService.executeSql,
    installedBibles,
    installedDictionary,
    isInstallBiblesLoaded: isLoaded,
    refreshDatabaseList,
    isMyBibleDbLoaded: mainBibleService.isLoaded,
    reDownloadDatabase,
    openDatabaseFromZip,
    interlinearService,
    mainBibleService,
  };

  return (
    <DatabaseContext.Provider value={dbContextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDBContext = (): DatabaseContextType =>
  useContext(DatabaseContext);

export default DatabaseProvider;
