import { CREATE_FAVORITE_VERSES_TABLE } from "constants/Queries";
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

  async function createFavoriteVerseTable(database: SQLite.SQLiteDatabase) {
    try {
      await executeSql(database, CREATE_FAVORITE_VERSES_TABLE);
      console.log(`- createFavoriteVerseTable`);
    } catch (error) {
      console.error(`Error creating table favorite_verses:`, error);
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
        await asset.downloadAsync().then((value) => {
          asset = value;
          console.log("asset downloadAsync - finished");
        });

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
        // for iOS - Asset is downloaded on call Asset.fromModule(), just copy from cache to local file
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

      return SQLite.openDatabase(dbName);
    }

    async function openDatabases() {
      const databases: SQLite.SQLiteDatabase[] = [];
      for (const dbName of dbNames) {
        const db = await openDatabase(dbName);
        createFavoriteVerseTable(db);
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
