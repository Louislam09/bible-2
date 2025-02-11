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
  executeSql: (sql: string, params?: any[]) => Promise<Row[]>;
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
    storedData: { currentBibleVersion },
  } = useStorage();
  const { installedBibles, loading, refreshDatabaseList, installedDictionary } =
    useInstalledBibles();
  const currentDbName = useMemo(
    () =>
      installedBibles?.find((x) => x.id === currentBibleVersion) ||
      installedBibles[0],
    [installedBibles, currentBibleVersion]
  );

  // const {
  //   databases,
  //   executeSql,
  //   loading: isMyBibleDbLoaded,
  // } = useDatabase({
  //   dbNames: installedBibles,
  //   currentBibleVersion: currentBibleVersion,
  // });
  const {
    database: myBibleDB,
    executeSql,
    loading: isMyBibleDbLoaded,
  } = useDB({ dbName: currentDbName });

  const getCurrentDB = (
    _databases: SQLite.SQLiteDatabase[] | null[],
    currentSelectedDB: string
  ) => {
    const separator = defaultDatabases.includes(currentSelectedDB)
      ? '.'
      : '-bible.db';
    return _databases?.find(
      (db) => db?.databaseName?.split(separator)[0] === currentSelectedDB
    );
  };

  // const myBibleDB =
  //   getCurrentDB(databases, currentBibleVersion) || databases[0];

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
