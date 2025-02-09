import { defaultDatabases } from "@/constants/databaseNames";
import * as SQLite from "expo-sqlite";
import useInstalledBibles, { VersionItem } from "@/hooks/useInstalledBible";
import React, { createContext, useContext } from "react";
import useDatabase from "../hooks/useDatabase";
import { useStorage } from "./LocalstoreContext";

interface Row {
  [key: string]: any;
}

type DatabaseContextType = {
  myBibleDB?: SQLite.SQLiteDatabase | null;
  executeSql?:
    | ((
        db: SQLite.SQLiteDatabase,
        sql: string,
        params?: any[]
      ) => Promise<Row[]>)
    | null;
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

const initialContext = {
  myBibleDB: null,
  executeSql: null,
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
  const {
    databases,
    executeSql,
    loading: isMyBibleDbLoaded,
  } = useDatabase({
    dbNames: installedBibles,
  });

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

  const myBibleDB =
    getCurrentDB(databases, currentBibleVersion) || databases[0];

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
