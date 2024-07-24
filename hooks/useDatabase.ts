import { CREATE_FAVORITE_VERSES_TABLE, CREATE_NOTE_TABLE } from "constants/Queries";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import { ToastAndroid } from "react-native";
import { DBName } from "../enums";

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

function useDatabase({ dbNames }: TUseDatabase): UseDatabase {
  const [_databases, setDatabases] = useState<SQLite.SQLiteDatabase[] | null[]>(
    []
  );

  const executeSql = async (
    database: SQLite.SQLiteDatabase,
    sql: string,
    params: any[] = []
  ): Promise<Row[]> => {
    if (!database) {
      throw new Error("Database not initialized");
    }
    const statement = await database.prepareAsync(sql);
    try {
      const result = await statement.executeAsync(params);

      const response = await result.getAllAsync()
      return response as Row[];
    } finally {
      await statement.finalizeAsync();
    }
  };

  async function createTable(database: SQLite.SQLiteDatabase, createTableQuery: string) {
    try {
      await database.execAsync(createTableQuery);
    } catch (error) {
      console.error(`Error creating table ${createTableQuery}:`, error);
    }
  }

  useEffect(() => {
    async function openDatabase(databaseName: string) {
      const localFolder = FileSystem.documentDirectory + "SQLite";
      const dbName = databaseName;
      const localURI = localFolder + "/" + dbName;

      if (!(await FileSystem.getInfoAsync(localFolder)).exists) {
        await FileSystem.makeDirectoryAsync(localFolder);
      }

      let asset =
        dbName === DBName.BIBLE
          ? Asset.fromModule(require("../assets/db/bible.db"))
          : Asset.fromModule(require("../assets/db/ntv-bible.db"));

      if (!asset.downloaded) {
        await asset.downloadAsync();
        let remoteURI = asset.localUri;

        if (!(await FileSystem.getInfoAsync(localURI)).exists) {
          await FileSystem.copyAsync({
            from: remoteURI as string,
            to: localURI,
          }).catch((error) => {
            console.log("asset copyDatabase - finished with error: " + error);
          });
        }
      } else {
        if (
          asset.localUri ||
          asset.uri.startsWith("asset") ||
          asset.uri.startsWith("file")
        ) {
          let remoteURI = asset.localUri || asset.uri;

          if (!(await FileSystem.getInfoAsync(localURI)).exists) {
            await FileSystem.copyAsync({
              from: remoteURI,
              to: localURI,
            }).catch((error) => {
              console.log("local copyDatabase - finished with error: " + error);
            });
          }
        } else if (
          asset.uri.startsWith("http") ||
          asset.uri.startsWith("https")
        ) {
          let remoteURI = asset.uri;

          if (!(await FileSystem.getInfoAsync(localURI)).exists) {
            await FileSystem.downloadAsync(remoteURI, localURI).catch(
              (error) => {
                console.log(
                  "local downloadAsync - finished with error: " + error
                );
              }
            );
          }
        }
      }

      return await SQLite.openDatabaseAsync(dbName);
    }

    async function openDatabases() {
      const databases: SQLite.SQLiteDatabase[] = [];
      for (const dbName of dbNames) {
        const db = await openDatabase(dbName);
        await createTable(db, CREATE_FAVORITE_VERSES_TABLE);
        await createTable(db, CREATE_NOTE_TABLE);
        databases.push(db);
      }
      return databases;
    }

    openDatabases()
      .then((resultDatabases: SQLite.SQLiteDatabase[] | string) => {
        if (Array.isArray(resultDatabases)) {
          setDatabases(resultDatabases);
        }
      })
      .catch(console.log);
  }, []);

  return { executeSql, databases: _databases };
}

export default useDatabase;