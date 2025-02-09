import {
  CREATE_COLUMN_UPDATED_AT_IN_NOTE_TABLE,
  CREATE_FAVORITE_VERSES_TABLE,
  CREATE_MEMORIZATION_TABLE,
  CREATE_NOTE_TABLE,
  CREATE_STREAK_TABLE,
} from '@/constants/Queries';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ToastAndroid } from 'react-native';
// import { DBName } from "../enums";
import {
  dbFileExt,
  defaultDatabases,
  isDefaultDatabase,
  SQLiteDirPath,
} from '@/constants/databaseNames';
import { VersionItem } from './useInstalledBible';

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
  loading: boolean;
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
  dbNames: VersionItem[];
};

enum DEFAULT_DATABASE {
  BIBLE = 'bible',
  NTV = 'ntv-bible',
}

function useDatabase({ dbNames }: TUseDatabase): UseDatabase {
  const [_databases, setDatabases] = useState<SQLite.SQLiteDatabase[] | null[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const executeSql = async (
    database: SQLite.SQLiteDatabase,
    sql: string,
    params: any[] = []
  ): Promise<Row[]> => {
    try {
      const startTime = Date.now(); // Start timing
      if (!database) {
        throw new Error('Database not initialized');
      }
      const statement = await database.prepareAsync(sql);
      try {
        const result = await statement.executeAsync(params);

        const response = await result.getAllAsync();
        const endTime = Date.now(); // End timing
        const executionTime = endTime - startTime;

        console.log(`Query ${sql} executed in ${executionTime} ms.`);
        return response as Row[];
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      return await new Promise((resolve) => resolve([]));
    }
  };

  async function checkIfColumnExist(database: SQLite.SQLiteDatabase) {
    try {
      const data = await executeSql(database, `PRAGMA table_info(notes);`, []);
      return data.map((x) => x.name).includes('updated_at');
    } catch (error) {
      return await new Promise((resolve) => resolve([]));
    }
  }

  async function addColumnIfNotExists(
    database: SQLite.SQLiteDatabase,
    createColumnQuery: string
  ) {
    try {
      const hasColumn = await checkIfColumnExist(database);
      if (!hasColumn) {
        await database.execAsync(createColumnQuery);
      }
    } catch (error) {
      console.error(
        `Error creating column ${createColumnQuery} In ${database.databaseName} :`,
        error
      );
    }
  }
  async function createTable(
    database: SQLite.SQLiteDatabase,
    createTableQuery: string
  ) {
    try {
      await database.execAsync(createTableQuery);
    } catch (error) {
      console.error(
        `Error creating table ${createTableQuery} In ${database.databaseName} :`,
        error
      );
    }
  }

  useEffect(() => {
    setDatabases([]);
    async function openDatabase(databaseItem: VersionItem) {
      const localFolder = SQLiteDirPath;
      const dbID = databaseItem.id;
      const _isDefaultDatabase = isDefaultDatabase(dbID);
      const dbNameWithExt = _isDefaultDatabase
        ? `${databaseItem.id}.db`
        : `${databaseItem.id}${dbFileExt}`;
      const localURI = databaseItem.path;

      if (!(await FileSystem.getInfoAsync(localFolder)).exists) {
        await FileSystem.makeDirectoryAsync(localFolder);
      }

      if (_isDefaultDatabase) {
        let asset =
          dbID === DEFAULT_DATABASE.BIBLE
            ? Asset.fromModule(require('../assets/db/bible.db'))
            : Asset.fromModule(require('../assets/db/ntv-bible.db'));

        if (!asset.downloaded) {
          await asset.downloadAsync();
          let remoteURI = asset.localUri;

          if (!(await FileSystem.getInfoAsync(localURI)).exists) {
            await FileSystem.copyAsync({
              from: remoteURI as string,
              to: localURI,
            }).catch((error) => {
              console.log('asset copyDatabase - finished with error: ' + error);
            });
          }
        } else {
          if (
            asset.localUri ||
            asset.uri.startsWith('asset') ||
            asset.uri.startsWith('file')
          ) {
            let remoteURI = asset.localUri || asset.uri;

            if (!(await FileSystem.getInfoAsync(localURI)).exists) {
              await FileSystem.copyAsync({
                from: remoteURI,
                to: localURI,
              }).catch((error) => {
                console.log(
                  'local copyDatabase - finished with error: ' + error
                );
              });
            }
          } else if (
            asset.uri.startsWith('http') ||
            asset.uri.startsWith('https')
          ) {
            let remoteURI = asset.uri;

            if (!(await FileSystem.getInfoAsync(localURI)).exists) {
              await FileSystem.downloadAsync(remoteURI, localURI).catch(
                (error) => {
                  console.log(
                    'local downloadAsync - finished with error: ' + error
                  );
                }
              );
            }
          }
        }
      }

      return await SQLite.openDatabaseAsync(dbNameWithExt);
    }

    async function openDatabases() {
      const databases: SQLite.SQLiteDatabase[] = [];
      for (const dbName of dbNames) {
        const db = await openDatabase(dbName);
        await createTable(db, CREATE_FAVORITE_VERSES_TABLE);
        await createTable(db, CREATE_NOTE_TABLE);
        await createTable(db, CREATE_MEMORIZATION_TABLE);
        await createTable(db, CREATE_STREAK_TABLE);
        // await addColumnIfNotExists(db, CREATE_COLUMN_UPDATED_AT_IN_NOTE_TABLE);
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
      .catch(console.log)
      .finally(() => setLoading(true));
  }, [dbNames]);

  return { executeSql, databases: _databases, loading };
}

export default useDatabase;
