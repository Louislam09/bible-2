import { getDatabaseExt, isDefaultDatabase } from "@/constants/databaseNames";
import { DATABASE_TYPE } from "@/types";
import * as SQLite from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";

interface Row {
    [key: string]: any;
}

type UseBibleDbProps = {
    databaseId: string;
    isInterlinear?: boolean;
};

export type UseBibleDb = {
    db: SQLite.SQLiteDatabase | null;
    executeSql: <T = any>(
        sql: string,
        params?: any[],
        queryName?: string
    ) => Promise<T[]>;
    isLoaded: boolean;
    error: string | null;
    reopen: () => Promise<void>;
};

const useBibleDb = ({ databaseId, isInterlinear }: UseBibleDbProps): UseBibleDb => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [db, setDB] = useState<SQLite.SQLiteDatabase | null>(null);
    const activeQueries = useRef<Set<string>>(new Set());
    const isInitializing = useRef(false);

    // Helper to open DB
    const openDatabase = useCallback(async () => {
        if (isInitializing.current) return;
        setIsLoaded(false);

        isInitializing.current = true;
        try {
            const bibleExt = getDatabaseExt(DATABASE_TYPE.BIBLE);
            const isDefaultDatabaseItem = isDefaultDatabase(databaseId);
            const finalDatabasePath = isDefaultDatabaseItem
                ? `${databaseId}.db`
                : `${databaseId}${bibleExt}`;

            // If already open, close it
            if (db) {
                await db.closeAsync().catch(err => { });
                setDB(null);
            }

            const newDb = await SQLite.openDatabaseAsync(finalDatabasePath);
            setDB(newDb);
            setIsLoaded(true);

        } catch (err) {
            console.error("Failed to open DB:", err);
            setError("Failed to initialize database");
            setIsLoaded(false);
        } finally {
            isInitializing.current = false;
        }
    }, [databaseId, isInterlinear]);

    // Initialize on mount or when databaseId changes
    useEffect(() => {
        openDatabase();

        return () => {
            if (db) {
                db.closeAsync().catch(err => { });
                setDB(null);
            }
        };
    }, [databaseId, isInterlinear]);

    const executeSql = useCallback(
        async <T = any>(sql: string, params: any[] = [], queryName?: string): Promise<T[]> => {
            const queryId = queryName || `query_${Date.now()}_${Math.random()}`;
            activeQueries.current.add(queryId);
            setError(null);

            try {
                // Ensure DB is open before query
                if (!db) {
                    await openDatabase();
                }
                if (!db) {
                    throw new Error("Database not initialized or failed to connect");
                }

                const statement = await db.prepareAsync(sql);
                try {
                    const result = await statement.executeAsync(params);
                    const rows = await result.getAllAsync();
                    return rows as T[];
                } finally {
                    await statement.finalizeAsync();
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Unknown error";
                await openDatabase();
                console.error("SQL execution error:", err);
                setError(errorMessage);
                return [];
            } finally {
                activeQueries.current.delete(queryId);
                if (activeQueries.current.size === 0) {
                }
            }
        },
        [db, openDatabase, isInterlinear]
    );

    return { db, executeSql, isLoaded, error, reopen: openDatabase };
};

export default useBibleDb;
