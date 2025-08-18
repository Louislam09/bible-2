import { databaseNames, dbFileExt, SQLiteDirPath } from "@/constants/databaseNames";
import { CREATE_FAVORITE_VERSES_TABLE } from "@/constants/Queries";
import { bibleState$ } from "@/state/bibleState";
import { dbDownloadState$ } from "@/state/dbDownloadState";
import { DEFAULT_DATABASE } from "@/types";
import { prepareDatabaseFromDbFile } from "@/utils/prepareDB";
import unzipFile from "@/utils/unzipFile";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { useEffect, useRef, useState } from "react";

interface Row {
    [key: string]: any;
}

export interface UseInterlinearDatabase {
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

interface UseInterlinearDB {
    isInterlinear?: boolean;
    onProgress?: (msg: string) => void;
    enabled?: boolean;
    databaseId: DEFAULT_DATABASE;
}

export function useInterlinearDB({ isInterlinear, onProgress, enabled, databaseId }: UseInterlinearDB): UseInterlinearDatabase {
    const [database, setDatabase] = useState<SQLite.SQLiteDatabase | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const isMounted = useRef(true);
    const dbName = databaseNames.find(db => db.id === databaseId)

    const executeSql = async (
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
            console.error(`Error executing SQL ${sql}:`, error);
            return [];
        }
    };

    async function isDatabaseValid(db: SQLite.SQLiteDatabase): Promise<boolean> {
        const dbItemFilePath = `${SQLiteDirPath}/interlinear${dbFileExt}`;
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
            return tableNames.includes("interlinear");
        } catch (e) {
            console.error("Validation query failed:", e);
            return false;
        }
    }

    async function createTables(db: SQLite.SQLiteDatabase) {
        const tables = [
            CREATE_FAVORITE_VERSES_TABLE,
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
        const interlinearDb = await prepareDatabaseFromDbFile({
            databaseItem: dbName,
            onProgress: (progress) => {
                // console.log('useInterlinearDB:', progress.stage, progress.message)
                dbDownloadState$.setDownloadProgress({
                    ...progress,
                    databaseName: dbName.name || dbName.id,
                });
            }
        });

        if (!interlinearDb) return;

        await createTables(interlinearDb);
        // Validate the database
        const valid = await isDatabaseValid(interlinearDb);
        if (!valid) {
            // delete the database
            await FileSystem.deleteAsync(dbName.path, { idempotent: true });
            throw new Error("Interlinear database validation failed");
        }

        // Apply optimization settings
        try {
            await interlinearDb.execAsync("PRAGMA journal_mode = WAL");
            await interlinearDb.execAsync("PRAGMA synchronous = OFF");
            await interlinearDb.execAsync("PRAGMA temp_store = MEMORY");
            await interlinearDb.execAsync("PRAGMA cache_size = 16384");
        } catch (error) {
            console.warn("Error applying optimization settings:", error);
        }

        if (isMounted.current) {
            setDatabase(interlinearDb);
            setIsLoaded(true);
        }
    }

    useEffect(() => {
        if (!enabled) return;
        if (!dbName) return;

        // const initDb = async () => {
        //     const interlinearDb = await prepareDatabaseFromDbFile({
        //         databaseItem: dbName,
        //         onProgress: (progress) => {
        //             // console.log('useInterlinearDB:', progress.stage, progress.message)
        //             dbDownloadState$.setDownloadProgress({
        //                 ...progress,
        //                 databaseName: dbName.name || dbName.id,
        //             });
        //         }
        //     });

        //     if (!interlinearDb) return;

        //     await createTables(interlinearDb);
        //     // Validate the database
        //     const valid = await isDatabaseValid(interlinearDb);
        //     if (!valid) {
        //         // delete the database
        //         await FileSystem.deleteAsync(dbName.path, { idempotent: true });
        //         throw new Error("Interlinear database validation failed");
        //     }

        //     // Apply optimization settings
        //     try {
        //         await interlinearDb.execAsync("PRAGMA journal_mode = WAL");
        //         await interlinearDb.execAsync("PRAGMA synchronous = OFF");
        //         await interlinearDb.execAsync("PRAGMA temp_store = MEMORY");
        //         await interlinearDb.execAsync("PRAGMA cache_size = 16384");
        //     } catch (error) {
        //         console.warn("Error applying optimization settings:", error);
        //     }

        //     if (isMounted.current) {
        //         setDatabase(interlinearDb);
        //         setIsLoaded(true);
        //     }
        // }

        initDb(dbName);

        return () => {
            isMounted.current = false;
            if (database) {
                // database.closeAsync().catch(console.error);
            }
        };
    }, [isInterlinear, enabled]);

    return { database, isLoaded, error, executeSql, reOpen: initDb };
}
