import { databaseNames, dbFileExt, SQLiteDirPath } from "@/constants/databaseNames";
import { CREATE_FAVORITE_VERSES_TABLE, historyQuery } from "@/constants/queries";
import { storedData$ } from "@/context/LocalstoreContext";
import { dbDownloadState$ } from "@/state/dbDownloadState";
import { DEFAULT_DATABASE } from "@/types";
import { prepareDatabaseFromDbFile } from "@/utils/prepareDB";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";

interface Row {
    [key: string]: any;
}

export interface UseGreekDatabase {
    database: SQLite.SQLiteDatabase | null;
    executeSql: <T = any>(
        sql: string,
        params?: any[],
        queryName?: string
    ) => Promise<T[]>;
    isLoaded: boolean;
    error: Error | null;
    reOpen: (dbName: any) => Promise<void>
}

interface UseGreekDB {
    onProgress?: (msg: string) => void;
    enabled?: boolean;
    databaseId: DEFAULT_DATABASE;
}

export function useGreekDB({ onProgress, enabled, databaseId }: UseGreekDB): UseGreekDatabase {
    const [database, setDatabase] = useState<SQLite.SQLiteDatabase | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const isMounted = useRef(true);
    const dbName = databaseNames.find(db => db.id === databaseId)

    const executeSql = useCallback(async (
        sql: string,
        params: any[] = [],
        queryName?: string
    ): Promise<any[]> => {
        try {
            const startTime = Date.now();
            if (!database) {
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
            console.error(`[useGreekDB] Error executing SQL ${sql}:`, error);
            return [];
        }
    }, [database])

    async function isDatabaseValid(db: SQLite.SQLiteDatabase): Promise<boolean> {
        const dbItemFilePath = `${SQLiteDirPath}/greek${dbFileExt}`;
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
            return tableNames.includes("verses");
        } catch (e) {
            console.error("Validation query failed:", e);
            return false;
        }
    }

    async function createTables(db: SQLite.SQLiteDatabase) {
        const tables = [
            CREATE_FAVORITE_VERSES_TABLE,
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

    const resetState = () => {
        setDatabase(null);
        setIsLoaded(false);
        setError(null);
        isMounted.current = true;
    };

    const initDb = async (dbName: any) => {
        const greekDb = await prepareDatabaseFromDbFile({
            databaseItem: dbName,
            onProgress: (progress) => {
                // console.log('useInterlinearDB:', progress.stage, progress.message)
                dbDownloadState$.setDownloadProgress({
                    ...progress,
                    databaseName: dbName.name || dbName.id,
                });
            }
        });

        if (!greekDb) return;
        const dbTableCreated = storedData$.dbTableCreated.get();
        if (!dbTableCreated.includes(dbName.shortName)) {
            // Validate the database
            const valid = await isDatabaseValid(greekDb);
            if (!valid) {
                // delete the database
                await FileSystem.deleteAsync(dbName.path, { idempotent: true });
                throw new Error("Greek database validation failed");
            }
            await createTables(greekDb);
            storedData$.dbTableCreated.set([...dbTableCreated, dbName.shortName]);
        }

        // Apply optimization settings
        try {
            await greekDb.execAsync("PRAGMA journal_mode = WAL");
            await greekDb.execAsync("PRAGMA synchronous = OFF");
            await greekDb.execAsync("PRAGMA temp_store = MEMORY");
            await greekDb.execAsync("PRAGMA cache_size = 16384");
        } catch (error) {
            console.warn("Error applying optimization settings:", error);
        }

        if (isMounted.current) {
            setDatabase(greekDb);
            setIsLoaded(true);
        }
    }

    useEffect(() => {
        if (!enabled) return;
        if (!dbName) return;

        initDb(dbName);

        return () => {
            isMounted.current = false;
            if (database) {
                // database.closeAsync().catch(console.error);
            }
        };
    }, [enabled]);

    return { database, isLoaded, error, executeSql, reOpen: initDb };
}
