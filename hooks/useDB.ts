import {
  dbFileExt,
  isDefaultDatabase,
  SQLiteDirPath,
} from "@/constants/databaseNames";
import {
  CREATE_FAVORITE_VERSES_TABLE,
  CREATE_MEMORIZATION_TABLE,
  CREATE_NOTE_TABLE,
  CREATE_STREAK_TABLE,
  historyQuery,
} from "@/constants/Queries";
import { showToast } from "@/utils/showToast";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import { VersionItem } from "./useInstalledBible";

interface Row {
  [key: string]: any;
}

interface UseDatabase {
  database: SQLite.SQLiteDatabase | null;
  executeSql: <T = any>(
    sql: string,
    params?: any[],
    queryName?: string
  ) => Promise<T[]>;
  loading: boolean;
}

type TUseDatabase = {
  dbName: VersionItem | undefined;
};

enum DEFAULT_DATABASE {
  BIBLE = "bible",
  NTV = "ntv-bible",
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
  ): Promise<any[]> => {
    try {
      const startTime = Date.now();
      if (!database || !dbInitialized.current) {
        return [];
        // throw new Error("Database not initialized");
      }

      const statement = await database.prepareAsync(sql);
      try {
        const result = await statement.executeAsync(params);
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        const response = await result.getAllAsync();
        if (queryName) {
          // console.log(`Query ${queryName} executed in ${executionTime} ms.`);
        }
        return response as Row[];
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error(`"Error executing SQL${sql}:"`, error);
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
          ? Asset.fromModule(require("../assets/db/bible.db"))
          : Asset.fromModule(require("../assets/db/ntv-bible.db"));

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

    const db = await SQLite.openDatabaseAsync(dbNameWithExt);

    if (_isDefaultDatabase) {
      try {
        await db.execAsync("PRAGMA journal_mode = WAL");
        // await db.execAsync("PRAGMA synchronous = NORMAL");
        await db.execAsync("PRAGMA synchronous = OFF");
        await db.execAsync("PRAGMA temp_store = MEMORY");
        await db.execAsync("PRAGMA cache_size = 16384");
        // await db.execAsync("PRAGMA cache_size = -10000");

        showToast("✔");
      } catch (error) {
        console.warn("Error applying optimization settings:", error);
      }
    }

    return db;
  }

  async function createTables(db: SQLite.SQLiteDatabase) {
    const tables = [
      CREATE_FAVORITE_VERSES_TABLE,
      CREATE_NOTE_TABLE,
      CREATE_MEMORIZATION_TABLE,
      CREATE_STREAK_TABLE,
      historyQuery.CREATE_TABLE,
    ];

    try {
      for (const sql of tables) {
        await db.execAsync(sql);
      }
    } catch (error) {
      console.error("Error creating tables:", error);
      throw error; // Rethrow to handle in the calling function
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

  useEffect(() => {
    if (!dbName) return;

    async function initializeDatabase() {
      try {
        setLoading(false);
        if (database) {
          await database.closeAsync();
        }
        if (!dbName) return;
        const db = await openDatabase(dbName);
        await createTables(db);
        if (isMounted.current) {
          setDatabase(db);
          dbInitialized.current = true;
          setLoading(true);
        }
      } catch (error) {
        console.error("Database initialization error:", error);
        if (isMounted.current) {
          setLoading(true); // Set loading to true even on error to prevent infinite loading state
        }
      }
    }

    dbInitialized.current = false;
    initializeDatabase();

    return () => {
      isMounted.current = false;
      if (database) {
        database.closeAsync().catch(console.error);
      }
    };
  }, [dbName]);

  // useEffect(() => {
  //   if (!loading) return;
  //   checkPragmas();
  // }, [loading]);

  return { executeSql, database, loading };
}

export default useDB;
