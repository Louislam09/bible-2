import {
  CREATE_FAVORITE_VERSES_TABLE,
  CREATE_MEMORIZATION_TABLE,
  CREATE_NOTE_TABLE,
  CREATE_STREAK_TABLE,
} from '@/constants/Queries';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
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
  database: SQLite.SQLiteDatabase | null;
  executeSql: (sql: string, params?: any[]) => Promise<Row[]>;
  loading: boolean;
}

type TUseDatabase = {
  dbName: VersionItem;
};

enum DEFAULT_DATABASE {
  BIBLE = 'bible',
  NTV = 'ntv-bible',
}

function useDB({ dbName }: TUseDatabase): UseDatabase {
  const [database, setDatabase] = useState<SQLite.SQLiteDatabase | null>(null);
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);
  const dbInitialized = useRef(false);

  const executeSql = async (
    sql: string,
    params: any[] = [],
    queryName?: any
  ): Promise<Row[]> => {
    try {
      const startTime = Date.now(); // Start timing
      if (!database) {
        throw new Error('Database not initialized');
      }
      const statement = await database.prepareAsync(sql);
      try {
        const result = await statement.executeAsync(params);
        const endTime = Date.now(); // End timing
        const executionTime = endTime - startTime;

        const response = await result.getAllAsync();
        if (queryName) {
          console.log(`Query ${queryName} executed in ${executionTime} ms.`);
        }
        return response as Row[];
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      return [];
    }
  };


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
          });
        }
      }
    }

    return await SQLite.openDatabaseAsync(dbNameWithExt);
  }
  
  useEffect(() => {
    async function initializeDatabase() {
      const db = await openDatabase(dbName);
      if (!isMounted.current) return;

      console.log({ db });
      setDatabase(db);
      dbInitialized.current = true;
    }

    dbInitialized.current = false;
    initializeDatabase()
      .catch(console.log)
      .finally(() => setLoading(true));

    return () => {
      isMounted.current = false;
    };
  }, [dbName]);

  useEffect(() => {
    async function optimizeDatabase() {
      if (!database) return;

      try {
        // Apply PRAGMA settings for optimization
        await executeSql('PRAGMA journal_mode = WAL;');
        await executeSql('PRAGMA synchronous = NORMAL;');
        await executeSql('PRAGMA temp_store = MEMORY;');
        await executeSql('PRAGMA cache_size = -10000;');
        await executeSql('PRAGMA optimize;');
        console.log(`Database optimized successfully.`);
      } catch (error) {
        console.error('Error optimizing database:', error);
      }
    }

    async function createTables() {
      if (!database) return;

      try {
        await executeSql(CREATE_FAVORITE_VERSES_TABLE);
        await executeSql(CREATE_NOTE_TABLE);
        await executeSql(CREATE_MEMORIZATION_TABLE);
        await executeSql(CREATE_STREAK_TABLE);
      } catch (error) {
        console.error('Error creating tables:', error);
      }
    }
    const checkPragmas = async () => {
          const journalMode = await executeSql(`PRAGMA journal_mode;`, []);
          const synchronous = await executeSql(`PRAGMA synchronous;`, []);
          const tempStore = await executeSql(`PRAGMA temp_store;`, []);
          const cacheSize = await executeSql(`PRAGMA cache_size;`, []);
    
          console.log({
            journalMode,
            synchronous,
            tempStore,
            cacheSize,
          });
        };

    if (database) {
      if (isDefaultDatabase(dbName.id)) {
        optimizeDatabase();
      }
      createTables();
    //   checkPragmas()
    }
  }, [database, dbName]);

  return { executeSql, database, loading };
}

export default useDB;
