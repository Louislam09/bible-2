import * as SQLite from "expo-sqlite";
import React, { createContext, useContext, useEffect } from "react";
import { DBName } from "../enums";
import useDatabase from "../hooks/useDatabase";
import { useStorage } from "./LocalstoreContext";
import useInstalledBibles, { VersionItem } from "hooks/useInstalledBible";

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
  const { databases, executeSql } = useDatabase({
    dbNames: installedBibles,
  });

  const myBibleDB =
    databases?.find(
      (version) => version?.databaseName.split(".")[0] === currentBibleVersion
    ) || databases[0];

  const dbContextValue = {
    myBibleDB,
    executeSql,
    installedBibles,
    installedDictionary,
    isInstallBiblesLoaded: !loading,
    refreshDatabaseList,
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
