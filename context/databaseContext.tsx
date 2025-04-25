import useDB from "@/hooks/useDB";
import useInstalledBibles, { VersionItem } from "@/hooks/useInstalledBible";
import { use$ } from "@legendapp/state/react";
import * as SQLite from "expo-sqlite";
import React, { createContext, useContext, useMemo } from "react";
import { storedData$ } from "./LocalstoreContext";

interface Row {
  [key: string]: any;
}

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
};

enum DBs {
  MYBIBLE,
  NTV,
}

const initialContext: DatabaseContextType = {
  myBibleDB: null,
  executeSql: async (sql: string, params?: any[], queryName?: string) => [],
  installedBibles: [],
  installedDictionary: [],
  isInstallBiblesLoaded: false,
  isMyBibleDbLoaded: false,
  refreshDatabaseList: () => { },
};

export const DatabaseContext =
  createContext<DatabaseContextType>(initialContext);

const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // const {
  //   isDataLoaded,
  //   storedData: { currentBibleVersion },
  // } = useStorage();
  const { currentBibleVersion, isDataLoaded } = use$(() => ({
    currentBibleVersion: storedData$.currentBibleVersion.get(),
    isDataLoaded: storedData$.isDataLoaded.get(),
  }));
  const { installedBibles, loading, refreshDatabaseList, installedDictionary } =
    useInstalledBibles();
  const currentDbName = useMemo(
    () => installedBibles?.find((x) => x.id === currentBibleVersion),
    [installedBibles, currentBibleVersion]
  );

  const {
    database: myBibleDB,
    executeSql,
    loading: isMyBibleDbLoaded,
  } = useDB({ dbName: isDataLoaded ? currentDbName : undefined });

  const dbContextValue = {
    myBibleDB,
    executeSql,
    installedBibles,
    installedDictionary,
    isInstallBiblesLoaded: !loading,
    refreshDatabaseList,
    isMyBibleDbLoaded,
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
