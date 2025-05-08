import useDB from "@/hooks/useDB";
import useInstalledBibles, { VersionItem } from "@/hooks/useInstalledBible";
import { use$ } from "@legendapp/state/react";
import * as SQLite from "expo-sqlite";
import React, { createContext, useContext, useMemo } from "react";
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
  reDownloadDatabase: (_dbName?: VersionItem) => Promise<SQLite.SQLiteDatabase | undefined>
};

const initialContext: DatabaseContextType = {
  myBibleDB: null,
  executeSql: async (sql: string, params?: any[], queryName?: string) => [],
  installedBibles: [],
  installedDictionary: [],
  isInstallBiblesLoaded: false,
  isMyBibleDbLoaded: false,
  refreshDatabaseList: () => { },
  reDownloadDatabase: (_dbName?: VersionItem) => Promise.resolve(undefined),
};

export const DatabaseContext =
  createContext<DatabaseContextType>(initialContext);

const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentBibleVersion, isDataLoaded } = use$(() => ({
    currentBibleVersion: storedData$.currentBibleVersion.get(),
    isDataLoaded: storedData$.isDataLoaded.get(),
  }));
  const { installedBibles, isLoaded, refreshDatabaseList, installedDictionary } = useInstalledBibles();
  const currentDbName = useMemo(
    () => installedBibles?.find((x) => x.id === currentBibleVersion),
    [installedBibles, currentBibleVersion]
  );

  const {
    database: myBibleDB,
    executeSql,
    loading: isMyBibleDbLoaded,
    reDownloadDatabase
  } = useDB({ dbName: (isDataLoaded && isLoaded) ? currentDbName : undefined });

  const dbContextValue = {
    myBibleDB,
    executeSql,
    installedBibles,
    installedDictionary,
    isInstallBiblesLoaded: isLoaded,
    refreshDatabaseList,
    isMyBibleDbLoaded,
    reDownloadDatabase
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
