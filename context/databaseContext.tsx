import { defaultDatabases } from "@/constants/databaseNames";
import * as SQLite from "expo-sqlite";
import useInstalledBibles, { VersionItem } from "@/hooks/useInstalledBible";
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import useDatabase from '../hooks/useDatabase';
import { useStorage } from './LocalstoreContext';
import useDB from '@/hooks/useDB';

interface Row {
  [key: string]: any;
}

type DatabaseContextType = {
  myBibleDB?: SQLite.SQLiteDatabase | null;
  executeSql: (sql: string, params?: any[]) => Promise<any[]>;
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
  executeSql: async (sql: string, params?: any[]) => [],
  installedBibles: [],
  installedDictionary: [],
  isInstallBiblesLoaded: false,
  isMyBibleDbLoaded: false,
  refreshDatabaseList: () => {},
};

export const DatabaseContext =
  createContext<DatabaseContextType>(initialContext);

const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    isDataLoaded,
    storedData: { currentBibleVersion },
  } = useStorage();
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
