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
import unzipFile from "@/utils/unzipFile";
import { dbDownloadState$ } from "@/state/dbDownloadState";

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
  openDatabaseFromZip(databaseItem: VersionItem, isReDownload?: boolean): Promise<SQLite.SQLiteDatabase | undefined>
}

type TUseDatabase = {
  dbName: VersionItem | undefined;
};

enum DEFAULT_DATABASE {
  BIBLE = "bible",
  NTV = "ntv-bible",
  INTERLINEAR = "interlinear-bible",
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

  async function isDatabaseValid(db: SQLite.SQLiteDatabase, tableNameToCheck: string): Promise<boolean> {
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
      return tableNames.includes(tableNameToCheck);
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
      console.log({ _dbName })

      if (_dbName?.id !== "interlinear-bible") {
        await createTables(db);
        await checkAndCreateColumn(db, "notes", "uuid", "TEXT");
        await checkAndCreateColumn(db, "favorite_verses", "uuid", "TEXT");
      }

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

  async function downloadZipFromAsset(asset: Asset, dbItemZipPath: string) {
    let fileInfo = await FileSystem.getInfoAsync(dbItemZipPath);
    if (fileInfo.exists) return dbItemZipPath;

    let remoteURI = asset.localUri as string;
    fileInfo = await FileSystem.getInfoAsync(dbItemZipPath);

    if (!fileInfo.exists) {
      await FileSystem.copyAsync({
        from: remoteURI,
        to: dbItemZipPath,
      });
    }

    return dbItemZipPath;
  }

  async function openDatabaseFromZip(databaseItem: VersionItem, isReDownload: boolean = false) {
    try {

      if (isReDownload) {
        dbDownloadState$.isDownloading.set(true);
        dbDownloadState$.dbItem.set(databaseItem);

        setDatabase(null);
        isMounted.current = true;
        bibleState$.isDataLoading.top.set(true);
        if (database) {
          await database.closeAsync();
        }
      }

      const localFolder = SQLiteDirPath;
      const databaseItemId = databaseItem.id;
      const isDefaultDatabaseItem = isDefaultDatabase(databaseItemId);
      const finalDatabasePath = isDefaultDatabaseItem ? `${databaseItem.id}.db` : `${databaseItem.id}${dbFileExt}`;
      const dbItemFilePath = databaseItem.path;
      const dbItemZipPath = `${localFolder}/${databaseItemId}.zip`;

      // check folter existant if not create it
      const dirInfo = await FileSystem.getInfoAsync(localFolder);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(localFolder, { intermediates: true });
      }

      // check if the db already exist
      console.log('Checking if the db already exist');
      const dbInfo = await FileSystem.getInfoAsync(dbItemFilePath);

      if (!dbInfo.exists) {
        let asset;
        // check download the zip
        console.log('Database does not exist');

        switch (databaseItemId) {
          case DEFAULT_DATABASE.BIBLE:
            asset = await Asset.fromModule(require("../assets/db/bible.zip")).downloadAsync();
            break;
          case DEFAULT_DATABASE.NTV:
            asset = await Asset.fromModule(require("../assets/db/ntv-bible.zip")).downloadAsync();
            break;
          default:
            asset = await Asset.fromModule(require("../assets/db/interlinear-bible.zip")).downloadAsync();
            break;
        }

        await downloadZipFromAsset(asset, dbItemZipPath);

        // Unzip, extract the db, save it and delete the zip
        await unzipFile({
          zipFileUri: dbItemZipPath,
          onProgress: (msg) => {
            dbDownloadState$.progressText.set(msg);
            // Also update the global progress state
            bibleState$.databaseProgress.set({
              stage: 'extracting',
              message: msg,
              percentage: 50,
              databaseName: databaseItem.name || databaseItem.id
            });
          },
        });
      }

      // open the database
      let db = await SQLite.openDatabaseAsync(finalDatabasePath);
      if (isDefaultDatabaseItem) {
        const isInterlinear = databaseItemId === DEFAULT_DATABASE.INTERLINEAR;

        // check if the database is valid
        const valid = await isDatabaseValid(db, isInterlinear ? "interlinear" : "verses");
        console.log('Database is valid', valid)

        if (!valid) {
          // delete the database
          await db.closeAsync();
          await FileSystem.deleteAsync(dbItemFilePath, { idempotent: true });
          await FileSystem.deleteAsync(`${dbItemFilePath}-wal`, { idempotent: true });
          await FileSystem.deleteAsync(`${dbItemFilePath}-shm`, { idempotent: true });
          return undefined
        }
      }

      // Optimize the database
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
      console.log("[Error] opening database from zip:", error);
      showToast("❌ No se pudo abrir la base de datos");
      throw error;
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
        const isInterlinear = databaseItemId === DEFAULT_DATABASE.INTERLINEAR;
        const valid = await isDatabaseValid(db, isInterlinear ? "interlinear" : "verses");
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
    if (!dbName || dbName) return;
    async function initializeDatabase() {
      try {
        setDatabase(null);
        isMounted.current = true;
        bibleState$.isDataLoading.top.set(true);

        if (!dbName) return;

        const db = await openDatabaseFromZip(dbName);
        if (!db) return;

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
      } finally {
        if (isMounted.current) {
          setLoading(true);
          bibleState$.isDataLoading.top.set(false);
        }
      }
    }

    dbInitialized.current = false;
    initializeDatabase();

    return () => {
      isMounted.current = false;
      if (database) {
        database.closeAsync().catch(err => { });
      }
    };
  }, [dbName]);

  return { executeSql, database, loading, reDownloadDatabase, openDatabaseFromZip };
}

export default useDB;
