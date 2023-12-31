import * as SQLite from "expo-sqlite";
import React, { createContext, useContext } from "react";
import { DBName } from "../enums";
import useDatabase from "../hooks/useDatabase";

interface Row {
  [key: string]: any;
}

type DatabaseContextType = {
  myBibleDB?: SQLite.WebSQLDatabase | null;
  executeSql?:
    | ((
        db: SQLite.WebSQLDatabase,
        sql: string,
        params?: any[]
      ) => Promise<Row[]>)
    | null;
  strongDB?: SQLite.WebSQLDatabase | null;
  strongExecuteSql?: ((sql: string, params?: any[]) => Promise<Row[]>) | null;
  subTitleDB?: SQLite.WebSQLDatabase | null;
  subtitleExecuteSql?: ((sql: string, params?: any[]) => Promise<Row[]>) | null;
};

enum DBs {
  MYBIBLE,
  SUBTITLE,
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

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { databases, executeSql } = useDatabase({
    dbNames: [DBName.BIBLE, DBName.SUBTITLE],
  });

  const myBibleDB = databases[DBs.MYBIBLE];
  const subTitleDB = databases[DBs.SUBTITLE];

  const dbContextValue = {
    myBibleDB,
    subTitleDB,
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
