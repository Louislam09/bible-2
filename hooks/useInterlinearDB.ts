import { useState, useEffect, useRef } from "react";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import * as SQLite from "expo-sqlite";
import unzipFile from "@/utils/unzipFile";
import { dbFileExt, SQLiteDirPath } from "@/constants/databaseNames";
import { CREATE_FAVORITE_VERSES_TABLE } from "@/constants/Queries";

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
}

export function useInterlinearDB(onProgress?: (msg: string) => void): UseInterlinearDatabase {
    const [database, setDatabase] = useState<SQLite.SQLiteDatabase | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const isMounted = useRef(true);

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
            console.log({ tableNames });
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

    useEffect(() => {
        async function prepareDb() {
            try {
                const INTERLINEAR_DB_NAME = `${'interlinear'}${dbFileExt}`;
                const INTERLINEAR_DB_DIR = `${SQLiteDirPath}/`;
                const INTERLINEAR_DB_PATH = `${INTERLINEAR_DB_DIR}${INTERLINEAR_DB_NAME}`;

                setIsLoaded(false);
                setError(null);
                isMounted.current = true;

                // Ensure directory exists
                const dirInfo = await FileSystem.getInfoAsync(INTERLINEAR_DB_DIR);
                if (!dirInfo.exists) {
                    await FileSystem.makeDirectoryAsync(INTERLINEAR_DB_DIR, { intermediates: true });
                }

                // Check if interlinear.db already extracted
                const info = await FileSystem.getInfoAsync(INTERLINEAR_DB_PATH);
                if (!info.exists) {
                    // Copy zip asset to local FS
                    const asset = Asset.fromModule(require("../assets/db/interlinear.zip"));
                    await asset.downloadAsync();

                    const zipUri = asset.localUri || asset.uri;

                    if (!zipUri) {
                        throw new Error("Could not get URI for interlinear.zip asset");
                    }

                    // Unzip the interlinear.zip to extract interlinear.db
                    await unzipFile({
                        zipFileUri: zipUri,
                        onProgress: (msg) => {
                            if (onProgress) onProgress(msg);
                        },
                    });
                }

                // Open the extracted interlinear.db
                const interlinearDb = await SQLite.openDatabaseAsync(INTERLINEAR_DB_NAME);
                await createTables(interlinearDb);
                // Validate the database
                const valid = await isDatabaseValid(interlinearDb);
                if (!valid) {
                    // delete the database
                    await FileSystem.deleteAsync(INTERLINEAR_DB_PATH, { idempotent: true });
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
            } catch (e) {
                console.error("Error preparing interlinear database:", e);
                if (isMounted.current) {
                    setError(e instanceof Error ? e : new Error(String(e)));
                    setIsLoaded(false);
                }
            }
        }

        prepareDb();

        return () => {
            isMounted.current = false;
            if (database) {
                // database.closeAsync().catch(console.error);
            }
        };
    }, []);

    return { database, isLoaded, error, executeSql };
}
