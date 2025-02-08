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
import {
  dbFileExt,
  isDefaultDatabase,
  SQLiteDirPath,
} from '@/constants/databaseNames';
import { VersionItem } from './useInstalledBible';

interface Row {
  [key: string]: any;
}

interface UseDatabase {
  databases: SQLite.SQLiteDatabase[];
  executeSql: (
    database: SQLite.SQLiteDatabase,
    sql: string,
    params?: any[]
  ) => Promise<Row[]>;
  loading: boolean;
}

type TUseDatabase = {
  dbNames: VersionItem[];
};

enum DEFAULT_DATABASE {
  BIBLE = 'bible',
  NTV = 'ntv-bible',
}

function useDatabase({ dbNames }: TUseDatabase): UseDatabase {
  const [databases, setDatabases] = useState<SQLite.SQLiteDatabase[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const executeSql = async (
    database: SQLite.SQLiteDatabase,
    sql: string,
    params: any[] = []
  ): Promise<Row[]> => {
    // console.time(`Query Time: ${sql}`);
    try {
      if (!database) throw new Error('Database not initialized');
      const statement = await database.prepareAsync(sql);
      try {
        const result = await statement.executeAsync(params);
        const response = await result.getAllAsync();
        return response as Row[];
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error(`SQL Error in query: ${sql}`, error);
      return [];
    } finally {
      // console.timeEnd(`Query Time: ${sql}`);
    }
  };

  const optimizeDatabase = async (database: SQLite.SQLiteDatabase) => {
    await executeSql(database, 'PRAGMA cache_size = 5000;');
    await executeSql(database, 'PRAGMA journal_mode = WAL;');
    await executeSql(database, 'PRAGMA optimize;');
  };

  const checkIfColumnExist = async (database: SQLite.SQLiteDatabase) => {
    try {
      const data = await executeSql(database, 'PRAGMA table_info(notes);');
      return data.some((col) => col.name === 'updated_at');
    } catch (error) {
      console.error('Error checking column:', error);
      return false;
    }
  };

  const addColumnIfNotExists = async (
    database: SQLite.SQLiteDatabase,
    createColumnQuery: string
  ) => {
    const hasColumn = await checkIfColumnExist(database);
    if (!hasColumn) {
      await executeSql(database, createColumnQuery);
    }
  };

  const createTable = async (
    database: SQLite.SQLiteDatabase,
    createTableQuery: string
  ) => {
    await executeSql(database, createTableQuery);
  };

  useEffect(() => {
    setDatabases([]);
    const openDatabase = async (databaseItem: VersionItem) => {
      const dbID = databaseItem.id;
      const _isDefaultDatabase = isDefaultDatabase(dbID);
      const dbNameWithExt = _isDefaultDatabase
        ? `${databaseItem.id}.db`
        : `${databaseItem.id}${dbFileExt}`;
      const localURI = databaseItem.path;

      if (!(await FileSystem.getInfoAsync(SQLiteDirPath)).exists) {
        await FileSystem.makeDirectoryAsync(SQLiteDirPath);
      }

      if (_isDefaultDatabase) {
        let asset =
          dbID === DEFAULT_DATABASE.BIBLE
            ? Asset.fromModule(require('../assets/db/bible.db'))
            : Asset.fromModule(require('../assets/db/ntv-bible.db'));

        if (!asset.downloaded) {
          await asset.downloadAsync();
        }

        let remoteURI = asset.localUri || asset.uri;

        if (!(await FileSystem.getInfoAsync(localURI)).exists) {
          await FileSystem.copyAsync({
            from: remoteURI,
            to: localURI,
          }).catch((error) => {
            console.error('Error copying database:', error);
          });
        }
      }

      return await SQLite.openDatabaseAsync(dbNameWithExt);
    };

    const openDatabases = async () => {
      const dbList: SQLite.SQLiteDatabase[] = [];
      for (const dbName of dbNames) {
        const db = await openDatabase(dbName);
        await optimizeDatabase(db);
        await createTable(db, CREATE_FAVORITE_VERSES_TABLE);
        await createTable(db, CREATE_NOTE_TABLE);
        await createTable(db, CREATE_MEMORIZATION_TABLE);
        await createTable(db, CREATE_STREAK_TABLE);
        await addColumnIfNotExists(db, CREATE_COLUMN_UPDATED_AT_IN_NOTE_TABLE);
        dbList.push(db);
      }
      return dbList;
    };

    openDatabases()
      .then(setDatabases)
      .catch(console.error)
      .finally(() => {
        setLoading(true);
      });
  }, [dbNames]);

  return { executeSql, databases, loading };
}

export default useDatabase;
