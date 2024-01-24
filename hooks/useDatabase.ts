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
  databases: SQLite.SQLiteDatabase[] | null[];
  executeSql: (
    database: SQLite.SQLiteDatabase,
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
  [DBName.BIBLE]: async () => {
    await FileSystem.downloadAsync(
      Asset.fromModule(require(`../assets/db/bible.db`)).uri,
      FileSystem.documentDirectory + "SQLite/bible.db"
    );
  },
  [DBName.NTV]: async () => {
    await FileSystem.downloadAsync(
      Asset.fromModule(require(`../assets/db/ntv-bible.db`)).uri,
      FileSystem.documentDirectory + "SQLite/ntv-bible.db"
    );
  },
};

async function copyDatabases(dbNames: DBName[]) {
  for (const dbName of dbNames) {
    await databases[dbName]();
  }
  ToastAndroid.show("bible downloaded", ToastAndroid.SHORT);
  console.log("---------- Databases downloaded ------------");
}

function useDatabase({ dbNames }: TUseDatabase): UseDatabase {
  const [_databases, setDatabases] = useState<SQLite.SQLiteDatabase[] | null[]>(
    []
  );
  const [isDbCreated, setDbCreated] = useState(false);

  const executeSql = (
    database: SQLite.SQLiteDatabase,
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
    // deleteDatabaseFile("ntv-bible.db");
    // return;
    const isDB = async () => {
      const dbFolder = `${FileSystem.documentDirectory}SQLite`;
      if (
        !(
          await FileSystem.getInfoAsync(FileSystem.documentDirectory + "SQLite")
        ).exists
      ) {
        await FileSystem.makeDirectoryAsync(
          FileSystem.documentDirectory + "SQLite"
        );
      }

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

      const databases: SQLite.SQLiteDatabase[] = [];
      for (const dbName of dbNames) {
        const dbPromise = new Promise<SQLite.SQLiteDatabase>(
          (resolve, reject) => {
            // const db = SQLite.openDatabase(
            //   dbName,
            //   undefined,
            //   undefined,
            //   undefined,
            //   (result) => {
            //     if (result) {
            //       console.log(`Database ${dbName} opened successfully.`);
            //       resolve(db);
            //     } else {
            //       console.error(`Error opening database ${dbName}.`);
            //       reject(new Error(`Error opening database ${dbName}.`));
            //     }
            //   }
            // );
            const db = SQLite.openDatabase(dbName);
            if (!db) {
              reject(new Error(`Error opening database ${dbName}.`));
              return;
            }
            resolve(db);
          }
        );

        databases.push(await dbPromise);
      }

      return databases;
    };

    openDB()
      .then((resultDatabases: SQLite.SQLiteDatabase[] | string) => {
        if (Array.isArray(resultDatabases)) {
          setDatabases(resultDatabases);
        }
      })
      .catch(console.log);
  }, [isDbCreated]);

  return { executeSql, databases: _databases };
}

export default useDatabase;
