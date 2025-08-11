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
import { bibleState$ } from "@/state/bibleState";
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
  reDownloadDatabase: (_dbName?: VersionItem) => Promise<SQLite.SQLiteDatabase>
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
      // if (database) {
      //   const valid = await isDatabaseValid(database);
      //   console.log({ valid });

      //   if (!valid) {
      //     try {
      //       await reDownloadDatabase();

      //     } catch (error) {
      //       console.log("Error re-downloading database:", error);
      //     }
      //   }
      // }

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

  async function isDatabaseValid(db: SQLite.SQLiteDatabase): Promise<boolean> {
    if (!dbName) return false;
    const dbItemFilePath = dbName.path;
    const info = await FileSystem.getInfoAsync(dbItemFilePath);
    if (!info.exists || info.size === 0) return false;

    try {
      const statement = await db.prepareAsync(
        `SELECT name FROM sqlite_master WHERE type='table';`
      );
      const result = await statement.executeAsync();
      const tables = await result.getAllAsync();
      await statement.finalizeAsync();

      const tableNames = tables.map((t: any) => t.name);
      // console.log("Tables in database:", tableNames);
      return tableNames.includes("verses");
    } catch (e) {
      console.error("Validation query failed:", e);
      return false;
    }
  }

  async function reDownloadDatabase(_dbName?: VersionItem) {
    showToast("Re-downloading database...");
    const currentDatabaseName = _dbName || dbName;
    try {
      setDatabase(null);
      isMounted.current = true;
      bibleState$.isDataLoading.top.set(true);
      if (database) {
        await database.closeAsync();
      }
      if (!currentDatabaseName) throw new Error("Database name is not defined.");

      const isDefault = isDefaultDatabase(currentDatabaseName.id);
      const finalDatabasePath = isDefault ? `${currentDatabaseName.id}.db` : `${currentDatabaseName.id}${dbFileExt}`;
      const dbItemFilePath = currentDatabaseName.path;

      const dbFileInfo = await FileSystem.getInfoAsync(dbItemFilePath);
      if (dbFileInfo.exists) {
        await FileSystem.deleteAsync(dbItemFilePath, { idempotent: true });
        await FileSystem.deleteAsync(`${dbItemFilePath}-wal`, { idempotent: true });
        await FileSystem.deleteAsync(`${dbItemFilePath}-shm`, { idempotent: true });
      }

      // Force re-download the asset
      let asset: Asset;
      if (currentDatabaseName.id === DEFAULT_DATABASE.BIBLE) {
        asset = Asset.fromModule(require("../assets/db/bible.db"));
      } else if (currentDatabaseName.id === DEFAULT_DATABASE.NTV) {
        asset = Asset.fromModule(require("../assets/db/ntv-bible.db"));
      } else {
        throw new Error("Unsupported database for redownload.");
      }

      await asset.downloadAsync();

      const remoteURI = asset.localUri;
      if (!remoteURI) throw new Error("Asset download failed or URI not found.");

      await FileSystem.copyAsync({
        from: remoteURI,
        to: dbItemFilePath,
      });

      // Open and reinitialize
      const db = await SQLite.openDatabaseAsync(finalDatabasePath);
      showToast("Biblia refrescada y reinicializada");
      if (!_dbName) return db
      await db.execAsync("PRAGMA journal_mode = WAL");
      await db.execAsync("PRAGMA synchronous = OFF");
      await db.execAsync("PRAGMA temp_store = MEMORY");
      await db.execAsync("PRAGMA cache_size = 16384");

      await createTables(db);
      await checkAndCreateColumn(db, "notes", "uuid", "TEXT");
      await checkAndCreateColumn(db, "favorite_verses", "uuid", "TEXT");

      if (isMounted.current) {
        setDatabase(db);
        dbInitialized.current = true;
        setLoading(true);
        bibleState$.bibleQuery.shouldFetch.set(true);
      }
      return db
    } catch (error) {
      console.error("Error redownloading database:", error);
      showToast("❌ No se pudo descargar la base de datos");
      throw error; // Rethrow to handle in the calling function
    }
  }

  async function openDatabase(databaseItem: VersionItem) {
    try {
      const localFolder = SQLiteDirPath;
      const databaseItemId = databaseItem.id;
      const isDefaultDatabaseItem = isDefaultDatabase(databaseItemId);
      const finalDatabasePath = isDefaultDatabaseItem ? `${databaseItem.id}.db` : `${databaseItem.id}${dbFileExt}`;
      const dbItemFilePath = databaseItem.path;

      if (!(await FileSystem.getInfoAsync(localFolder)).exists) {
        await FileSystem.makeDirectoryAsync(localFolder);
      }

      if (isDefaultDatabaseItem) {
        let asset =
          databaseItemId === DEFAULT_DATABASE.BIBLE
            ? Asset.fromModule(require("../assets/db/bible.db"))
            : Asset.fromModule(require("../assets/db/ntv-bible.db"));

        if (!asset.downloaded) {
          await asset.downloadAsync();
          let remoteURI = asset.localUri;
          const fileInfo = await FileSystem.getInfoAsync(dbItemFilePath);

          if (!fileInfo.exists) {
            await FileSystem.copyAsync({
              from: remoteURI as string,
              to: dbItemFilePath,
            });
          }
        }
      }

      let db = await SQLite.openDatabaseAsync(finalDatabasePath);

      if (isDefaultDatabaseItem) {
        const valid = await isDatabaseValid(db);
        if (!valid && isDefaultDatabaseItem) {
          try {
            db = await reDownloadDatabase();
            // console.log("Database re-downloaded successfully:", db, valid);
          } catch (error) {
            console.log("Error re-downloading database:", error);
          }
        }
      }

      if (isDefaultDatabaseItem) {
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
    } catch (error) {
      console.error("Error opening database:", error);
      throw error; // Rethrow to handle in the calling function
    }
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

  async function checkAndCreateColumn(
    db: SQLite.SQLiteDatabase,
    tableName: string,
    columnName: string,
    columnType: string
  ) {
    const createColumnQuery = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`;
    try {
      const statement = await db.prepareAsync(`PRAGMA table_info(${tableName});`);
      const result = await statement.executeAsync([]);
      const columns = await result.getAllAsync();
      const hasColumn = columns.some(
        (column: any) => column.name === columnName
      );
      await statement.finalizeAsync();

      if (!hasColumn) {
        await db.execAsync(createColumnQuery);
      }

    } catch (error) {
      console.error(
        `Error creating column ${createColumnQuery} In ${db.databaseName} :`,
        error
      );
    }
  }

  useEffect(() => {
    if (!dbName) return;
    async function initializeDatabase() {
      try {
        // setLoading(false);
        setDatabase(null);
        isMounted.current = true;
        bibleState$.isDataLoading.top.set(true);
        if (database) {
          await database.closeAsync();
        }
        // setDatabase(null);
        if (!dbName) return;
        const db = await openDatabase(dbName);

        await createTables(db);
        await checkAndCreateColumn(db, "notes", "uuid", "TEXT");
        await checkAndCreateColumn(db, "favorite_verses", "uuid", "TEXT");
        if (isMounted.current) {
          setDatabase(db);
          dbInitialized.current = true;
          bibleState$.bibleQuery.shouldFetch.set(true);
          setLoading(true);
        }
      } catch (error) {
        console.error("Database initialization error:", error);
        if (isMounted.current) {
          setLoading(true);
        }
      }
    }

    dbInitialized.current = false;
    initializeDatabase();

    return () => {
      isMounted.current = false;
      if (database) {
        // database.closeAsync().catch(console.error);
      }
    };
  }, [dbName]);

  return { executeSql, database, loading, reDownloadDatabase };
}

export default useDB;
