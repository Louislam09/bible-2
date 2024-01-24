import { useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { DBName } from "../enums";
import { ToastAndroid } from "react-native";
import { CHECK_DB } from "constants/Queries";

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

export const deleteDatabaseFile = async (dbName: string) => {
  const fileName = `SQLite/${dbName}`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;
  try {
    await FileSystem.deleteAsync(filePath);
    ToastAndroid.show(
      `File ${fileName} deleted successfully.`,
      ToastAndroid.SHORT
    );
  } catch (error) {
    console.error(`Error deleting file ${fileName}:`, error);
  }
};

type TUseDatabase = {
  dbNames: DBName[];
};

const databases: any = {
  [DBName.BIBLE]: async () => {
    const uri = Asset.fromModule(require(`../assets/db/bible.db`)).uri;
    await FileSystem.downloadAsync(
      uri,
      FileSystem.documentDirectory + "SQLite/bible.db"
    );
  },
  [DBName.NTV]: async () => {
    const uri = Asset.fromModule(require(`../assets/db/ntv-bible.db`)).uri;
    await FileSystem.downloadAsync(
      uri,
      FileSystem.documentDirectory + "SQLite/ntv-bible.db"
    );
  },
};

async function copyDatabases(dbNames: DBName[]) {
  for (const dbName of dbNames) {
    await databases[dbName]();
  }
  ToastAndroid.show("Downloaded", ToastAndroid.SHORT);
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
    if (!Array.isArray(dbNames)) return;
    const dbExists = async (dbName: string) => {
      return new Promise((resolve, reject) => {
        const db = SQLite.openDatabase(dbName);
        db.transaction(
          (tx) => {
            tx.executeSql(CHECK_DB, [], (_, result) => {
              resolve(result.rows.length > 0);
            });
          },
          () => {
            resolve(false);
            return false;
          },
          () => {
            db.closeAsync();
          }
        );
      });
    };

    const isDB = async () => {
      const dbFolder = `${FileSystem.documentDirectory}SQLite`;
      if (!(await FileSystem.getInfoAsync(dbFolder)).exists) {
        await FileSystem.makeDirectoryAsync(dbFolder);
      }

      for (const dbName of dbNames) {
        if (!dbName) return;
        const exists = await dbExists(dbName);
        if (!exists) {
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
        const db = await new Promise<SQLite.SQLiteDatabase>(
          (resolve, reject) => {
            const database = SQLite.openDatabase(
              dbName,
              undefined,
              undefined,
              undefined,
              (result) => {
                if (result) {
                  console.log(`Database ${dbName} opened successfully.`);
                  resolve(database);
                } else {
                  console.error(`Error opening database ${dbName}.`);
                  reject(new Error(`Error opening database ${dbName}.`));
                }
              }
            );
          }
        );

        databases.push(db);
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
