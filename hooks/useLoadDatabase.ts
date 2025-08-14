import {
  CREATE_FAVORITE_VERSES_TABLE,
  CREATE_MEMORIZATION_TABLE,
  CREATE_NOTE_TABLE,
  CREATE_STREAK_TABLE,
  historyQuery,
} from "@/constants/Queries";
import { bibleState$ } from "@/state/bibleState";
import { prepareDatabase } from "@/utils/prepareDB";
import * as SQLite from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import { VersionItem } from "./useInstalledBible";
import * as FileSystem from "expo-file-system";

interface Row {
  [key: string]: any;
}

interface UseLoadDB {
  database: SQLite.SQLiteDatabase | null;
  executeSql: <T = any>(
    sql: string,
    params?: any[],
    queryName?: string
  ) => Promise<T[]>;
  loading: boolean;
}

type TUseLoadDB = {
  dbName: VersionItem | undefined;
};

enum DEFAULT_DATABASE {
  BIBLE = "bible",
  NTV = "ntv-bible",
  INTERLINEAR = "interlinear-bible",
}

const useLoadDatabase = ({ dbName }: TUseLoadDB): UseLoadDB => {
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


  useEffect(() => {
    if (!dbName) return;
    async function initializeDatabase() {
      try {
        setDatabase(null);
        isMounted.current = true;
        bibleState$.isDataLoading.top.set(true);

        if (!dbName) return;

        // const db = null
        const db = await prepareDatabase({
          databaseItem: dbName,
          onProgress: (progress) => {
            // Update the global state for progress tracking
            bibleState$.databaseProgress.set({
              stage: progress.stage,
              message: progress.message,
              percentage: progress.percentage || 0,
              databaseName: dbName.name || dbName.id
            });
          }
        });

        const isInterlinear = dbName.id === DEFAULT_DATABASE.INTERLINEAR;
        const valid = await isDatabaseValid(db!, isInterlinear ? "interlinear" : "verses");
        console.log('Database is valid', valid)

        if (!valid) {
          // delete the database
          await db?.closeAsync();
          await FileSystem.deleteAsync(dbName.path, { idempotent: true });
          await FileSystem.deleteAsync(`${dbName.path}-wal`, { idempotent: true });
          await FileSystem.deleteAsync(`${dbName.path}-shm`, { idempotent: true });
          return undefined
        }
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

  return { executeSql, database, loading };
}

export default useLoadDatabase;
