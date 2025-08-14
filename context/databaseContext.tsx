import useDB from "@/hooks/useDB";
import useInstalledBibles, { VersionItem } from "@/hooks/useInstalledBible";
import { use$ } from "@legendapp/state/react";
import * as SQLite from "expo-sqlite";
import React, { createContext, useContext, useMemo } from "react";
import { storedData$ } from "./LocalstoreContext";
import {
  UseInterlinearDatabase,
  useInterlinearDB,
} from "@/hooks/useInterlinearDB";
import { showToast } from "@/utils/showToast";
import { EBibleVersions } from "@/types";
import useBibleDb, { UseBibleDb } from "@/hooks/useBibleDb";
import useLoadDatabase from "@/hooks/useLoadDatabase";

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
  mainBibleService: UseBibleDb;
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
    db: null,
    executeSql: async (sql: string, params?: any[], queryName?: string) => [],
    isLoaded: false,
    error: null,
    reopen: () => Promise.resolve(),
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

  const {
    database: myBibleDB,
    executeSql,
    loading: isMyBibleDbLoaded,
  } = useLoadDatabase({
    dbName: isDataLoaded && isLoaded ? currentDbName : undefined,
  });

  const {
    // database: myBibleDB,
    // executeSql,
    // loading: isMyBibleDbLoaded,
    reDownloadDatabase,
    openDatabaseFromZip,
  } = useDB({ dbName: isDataLoaded && isLoaded ? currentDbName : undefined });

  const isInterlinear = useMemo(
    () =>
      [EBibleVersions.INT, EBibleVersions.INTERLINEAL].includes(
        currentBibleVersion as EBibleVersions
      ),
    [currentBibleVersion]
  );

  const interlinearService = useInterlinearDB({
    isInterlinear,
    onProgress: (msg) => {
      showToast(msg, "SHORT");
    },
  });

  const mainBibleService = useBibleDb({ databaseId: "bible", isInterlinear });

  const dbContextValue = {
    myBibleDB,
    executeSql,
    installedBibles,
    installedDictionary,
    isInstallBiblesLoaded: isLoaded,
    refreshDatabaseList,
    isMyBibleDbLoaded,
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
