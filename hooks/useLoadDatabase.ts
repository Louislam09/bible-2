import { databaseNames } from "@/constants/databaseNames";
import {
  CREATE_FAVORITE_VERSES_TABLE,
  CREATE_HIGHLIGHTED_VERSES_TABLE,
  CREATE_MEMORIZATION_TABLE,
  CREATE_NOTE_TABLE,
  CREATE_STREAK_TABLE,
  historyQuery,
} from "@/constants/queries";
import { storedData$ } from "@/context/LocalstoreContext";
import { bibleState$ } from "@/state/bibleState";
import { dbDownloadState$ } from "@/state/dbDownloadState";
import { DEFAULT_DATABASE } from "@/types";
import { isPrimaryBibleDatabase } from "@/constants/databaseNames";
import { prepareDatabaseFromDbFile } from "@/utils/prepareDB";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import { VersionItem } from "./useInstalledBible";

interface Row {
  [key: string]: any;
}

export interface UseLoadDB {
  database: SQLite.SQLiteDatabase | null;
  executeSql: <T = any>(
    sql: string,
    params?: any[],
    queryName?: string
  ) => Promise<T[]>;
  isLoaded: boolean;
  reOpen: (dbName: any) => Promise<undefined>
}

export type TUseLoadDB = {
  currentBibleVersion: VersionItem | undefined;
  isInterlinear: boolean;
};

const MY_TABLES = [
  { name: "favorite_verses", query: CREATE_FAVORITE_VERSES_TABLE },
  { name: "notes", query: CREATE_NOTE_TABLE },
  { name: "memorization", query: CREATE_MEMORIZATION_TABLE },
  { name: "streaks", query: CREATE_STREAK_TABLE },
  { name: "history", query: historyQuery.CREATE_TABLE },
  { name: "highlighted_verses", query: CREATE_HIGHLIGHTED_VERSES_TABLE }
];

const useLoadDatabase = ({ currentBibleVersion, isInterlinear }: TUseLoadDB): UseLoadDB => {
  const [database, setDatabase] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoaded, setLoaded] = useState(false);
  const isMounted = useRef(true);
  const dbInitialized = useRef(false);
  const [defaultDbName] = databaseNames
  const dbName = isInterlinear ? defaultDbName : currentBibleVersion

  const executeSql = useCallback(async (
    sql: string,
    params: any[] = [],
    queryName?: any
  ): Promise<any[]> => {
    try {
      if (!database || !dbInitialized.current) {
        return [];
      }
      // console.log(" executing SQL", sql)
      const statement = await database.prepareAsync(sql);
      try {
        const result = await statement.executeAsync(params);
        const response = await result.getAllAsync();

        return response as Row[];
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.log("[useLoadDatabase] -- Error executing SQL --", error)
      return [];
    }
  }, [database, dbInitialized.current])

  async function createTables(db: SQLite.SQLiteDatabase, isMainBible: boolean) {
    try {
      for (const table of MY_TABLES) {
        const tableExists = await checkTableExists(db, table.name);
        // console.log(`🖨️ ${table.name} table exists: ${tableExists}`)
        if (!tableExists) {
          await db.execAsync(table.query);
        }
      }
    } catch (error) {
      console.error("Error creating tables:", error);
      throw error; // Rethrow to handle in the calling function
    }
  }

  const checkIfAllTablesExists = async (db: SQLite.SQLiteDatabase) => {
    const allTablesExist = await Promise.all(MY_TABLES.map(async (table) => {
      const tableExists = await checkTableExists(db, table.name);
      // console.log(`${tableExists ? "✅" : "❌"} ${table.name} table exists: ${tableExists}`)
      return tableExists;
    }));
    return allTablesExist.every(exists => exists);
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
        `Error creating column ${createColumnQuery} In ${db.databasePath} :`,
        error
      );
    }
  }

  async function checkTableExists(
    db: SQLite.SQLiteDatabase,
    tableName: string,
  ) {
    const checkTableQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name=?;`;
    try {
      const statement = await db.prepareAsync(checkTableQuery);
      const result = await statement.executeAsync([tableName]);
      const rows = await result.getAllAsync();
      await statement.finalizeAsync();
      return rows.length > 0;
    } catch (error) {
      console.error(
        `Error checking table existence for ${tableName} In ${db.databasePath} :`,
        error
      );
    }
  }

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
      return tableNames?.includes(tableNameToCheck);
    } catch (e) {
      console.error("Validation query failed:", e);
      return false;
    }
  }

  async function initializeDatabase(dbName: any) {
    try {
      setDatabase(null);
      isMounted.current = true;
      bibleState$.isDataLoading.top.set(true);

      if (!dbName) return;

      const db = await prepareDatabaseFromDbFile({
        databaseItem: dbName,
        onProgress: (progress) => {
          dbDownloadState$.setDownloadProgress({
            ...progress,
            databaseName: dbName.name || dbName.id
          });
        }
      });

      const isInterlinear = dbName.id === DEFAULT_DATABASE.INTERLINEAR;
      const isMainBible = isPrimaryBibleDatabase(dbName.id);
      if (!db) return;
      const dbTableCreated = storedData$.dbTableCreated.get();
      const allTablesExist = await checkIfAllTablesExists(db);

      if (!dbTableCreated?.includes(dbName.shortName) || !allTablesExist) {
        const valid = await isDatabaseValid(db!, isInterlinear ? "interlinear" : "verses");
        if (!valid) {
          await db?.closeAsync();
          await FileSystem.deleteAsync(dbName.path, { idempotent: true });
          await FileSystem.deleteAsync(`${dbName.path}-wal`, { idempotent: true });
          await FileSystem.deleteAsync(`${dbName.path}-shm`, { idempotent: true });
          return undefined
        }

        await createTables(db, isMainBible);
        await checkAndCreateColumn(db, "favorite_verses", "uuid", "TEXT");
        storedData$.dbTableCreated.set([...dbTableCreated, dbName.shortName]);
      }

      if (isMounted.current) {
        setDatabase(db);
        dbInitialized.current = true;
        bibleState$.bibleQuery.shouldFetch.set(true);
        setLoaded(true);
      }
    } catch (error) {
      console.error("Database initialization error:", error);
      if (isMounted.current) {
        setLoaded(true);
      }
    } finally {
      if (isMounted.current) {
        setLoaded(true);
        // bibleState$.isDataLoading.top.set(false);
      }
    }
  }

  useEffect(() => {
    if (!dbName) return;

    dbInitialized.current = false;
    initializeDatabase(dbName);

    return () => {
      isMounted.current = false;
      if (database) {
        database.closeAsync().catch(err => { });
      }
    };
  }, [dbName, isInterlinear]);

  return { executeSql, database, isLoaded, reOpen: initializeDatabase };
}

export default useLoadDatabase;
