import * as SQLite from "expo-sqlite";
import React, { createContext, useContext } from "react";
import { DBName } from "../enums";
import useDatabase from "../hooks/useDatabase";
import { useStorage } from "./LocalstoreContext";
import getCurrentDbName from "utils/getCurrentDB";

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
  strongDB?: SQLite.SQLiteDatabase | null;
  strongExecuteSql?: ((sql: string, params?: any[]) => Promise<Row[]>) | null;
  subTitleDB?: SQLite.SQLiteDatabase | null;
  subtitleExecuteSql?: ((sql: string, params?: any[]) => Promise<Row[]>) | null;
};

enum DBs {
  MYBIBLE,
  NTV,
}

const initialContext = {
  myBibleDB: null,
  executeSql: null,
  strongDB: null,
  strongExecuteSql: null,

  subtitleDB: null,
  subtitleExecuteSql: null,
};

export const DatabaseContext =
  createContext<DatabaseContextType>(initialContext);

const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    storedData: { currentBibleVersion },
  } = useStorage();
  const isNTV = getCurrentDbName(currentBibleVersion) === DBName.NTV;
  const { databases, executeSql } = useDatabase({
    dbNames: [DBName.BIBLE, DBName.NTV],
  });

  const myBibleDB = databases[!isNTV ? DBs.MYBIBLE : DBs.NTV];

  const dbContextValue = {
    myBibleDB,
    executeSql,
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
