import { useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { DBName } from "../enums";
import { ToastAndroid } from "react-native";

interface Row {
  [key: string]: any;
}

interface UseDatabase {
  databases: SQLite.WebSQLDatabase[] | null[];
  executeSql: (
    database: SQLite.WebSQLDatabase,
    sql: string,
    params?: any[]
  ) => Promise<Row[]>;
}

const deleteDatabaseFile = async (dbName: string) => {
  const fileName = `SQLite/${dbName}`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;
  try {
    await FileSystem.deleteAsync(filePath);
    console.log(`File ${fileName} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting file ${fileName}:`, error);
  }
};

type TUseDatabase = {
  dbNames: DBName[];
};

const databases: any = {
  [DBName.BIBLE]: async (dbFolder: any, dbPath: any) => {
    await FileSystem.makeDirectoryAsync(dbFolder, { intermediates: true });
    const asset = Asset.fromModule(require(`../assets/db/myBible.db`));
    await FileSystem.downloadAsync(asset.uri, dbPath);
  },
  [DBName.NTV]: async (dbFolder: any, dbPath: any) => {
    await FileSystem.makeDirectoryAsync(dbFolder, { intermediates: true });
    const asset = Asset.fromModule(require(`../assets/db/ntv.db`));
    await FileSystem.downloadAsync(asset.uri, dbPath);
  },
};

async function copyDatabases(dbNames: DBName[]) {
  const dbFolder = `${FileSystem.documentDirectory}SQLite`;

  for (const dbName of dbNames) {
    const dbPath = `${dbFolder}/${dbName}`;
    await databases[dbName](dbFolder, dbPath);
  }
  ToastAndroid.show("bible downloaded", ToastAndroid.SHORT);
  console.log("---------- Databases downloaded ------------");
}

function useDatabase({ dbNames }: TUseDatabase): UseDatabase {
  const [databases, setDatabases] = useState<SQLite.WebSQLDatabase[] | null[]>(
    []
  );
  const [isDbCreated, setDbCreated] = useState(false);

  const executeSql = (
    database: SQLite.WebSQLDatabase,
    sql: string,
    params: any[] = []
  ): Promise<Row[]> => {
    return new Promise((resolve, reject) => {
      if (!database) {
        reject(new Error("Database not initialized"));
      } else {
        database.transaction((tx) => {
          tx.executeSql(
            sql,
            params,
            (_, { rows }) => {
              resolve(rows._array);
            },
            (tx, error) => {
              reject(error);
              return true;
            }
          );
        });
      }
    });
  };

  useEffect(() => {
    // deleteDatabaseFile("ntv.db");
    // return;
    const isDB = async () => {
      const dbFolder = `${FileSystem.documentDirectory}SQLite`;
      await FileSystem.makeDirectoryAsync(dbFolder, { intermediates: true });

      for (const dbName of dbNames) {
        const dbPath = `${dbFolder}/${dbName}`;
        const dbFile = await FileSystem.getInfoAsync(dbPath);
        if (!dbFile.exists) {
          return false;
        }
      }

      return true;
    };

    const openDB = async () => {
      const _isDB = await isDB();
      if (!_isDB) {
        await copyDatabases(dbNames);
        setDbCreated(true);
        return "";
      }

      const databases: SQLite.WebSQLDatabase[] = [];
      for (const dbName of dbNames) {
        const dbPromise = new Promise<SQLite.WebSQLDatabase>(
          (resolve, reject) => {
            const db = SQLite.openDatabase(
              dbName,
              undefined,
              undefined,
              undefined,
              (result) => {
                if (result) {
                  console.log(`Database ${dbName} opened successfully.`);
                  resolve(db);
                } else {
                  console.error(`Error opening database ${dbName}.`);
                  reject(new Error(`Error opening database ${dbName}.`));
                }
              }
            );
          }
        );

        databases.push(await dbPromise);
      }

      return databases;
    };

    openDB()
      .then((resultDatabases: SQLite.WebSQLDatabase[] | string) => {
        if (Array.isArray(resultDatabases)) {
          setDatabases(resultDatabases);
        }
      })
      .catch(console.log);
  }, [isDbCreated]);

  return { executeSql, databases };
}

export default useDatabase;
