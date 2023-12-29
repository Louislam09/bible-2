import React, { createContext, useContext, useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";
import useDatabase from "../hooks/useDatabase";
import { DBName } from "../enums";

interface Row {
  [key: string]: any;
}

type DatabaseContextType = {
  database: SQLite.WebSQLDatabase | null;
  executeSql: ((sql: string, params?: any[]) => Promise<Row[]>) | null;
  strongDB: SQLite.WebSQLDatabase | null;
  strongExecuteSql: ((sql: string, params?: any[]) => Promise<Row[]>) | null;
};

const initialContext = {
  database: null,
  executeSql: null,
  strongDB: null,
  strongExecuteSql: null,
};

export const DatabaseContext =
  createContext<DatabaseContextType>(initialContext);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { database, executeSql } = useDatabase({ dbName: DBName.BIBLE });
  const { database: strongDB, executeSql: strongExecuteSql } = useDatabase({
    dbName: DBName.MULTI,
  });
  // const { database, executeSql } = useDatabase({ dbName: DBName.BIBLE });
  // const { database: strongDB, executeSql: strongExecuteSql } = useDatabase({ dbName: DBName.MULTI });
  // let strongDB: any, strongExecuteSql: any;
  return (
    <DatabaseContext.Provider
      value={{ database, executeSql, strongDB, strongExecuteSql }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDBContext = (): DatabaseContextType =>
  useContext(DatabaseContext);
