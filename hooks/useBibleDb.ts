// import { getDatabaseExt, isDefaultDatabase } from "@/constants/databaseNames";
// import { DATABASE_TYPE } from "@/types";
// import * as SQLite from "expo-sqlite";
// import { useRef, useState, useEffect, useCallback } from "react";

// interface Row {
//     [key: string]: any;
// }

// type UseBibleDbProps = {
//     databaseId: string;
// };

// const useBibleDb = ({
//     databaseId,
// }: UseBibleDbProps) => {
//     const [loading, setLoading] = useState<boolean>(false);
//     const [error, setError] = useState<string | null>(null);
//     const activeQueries = useRef<Set<string>>(new Set());
//     const [db, setDB] = useState<SQLite.SQLiteDatabase | null>(null);
//     const isInitializing = useRef<boolean>(false);

//     // Initialize database connection
//     useEffect(() => {
//         let isMounted = true;

//         const initDatabase = async () => {
//             if (isInitializing.current) return;
//             isInitializing.current = true;

//             try {
//                 const bibleExt = getDatabaseExt(DATABASE_TYPE.BIBLE);
//                 const isDefaultDatabaseItem = isDefaultDatabase(databaseId);
//                 const finalDatabasePath = isDefaultDatabaseItem ? `${databaseId}.db` : `${databaseId}${bibleExt}`;

//                 // Check if the database is open and close it safely
//                 if (db) {
//                     try {
//                         await db.closeAsync();
//                     } catch (closeError) {
//                         // Ignore errors when closing already closed database
//                         console.log("Database was already closed or closing failed:", closeError);
//                     }
//                 }

//                 // Open the database
//                 if (isMounted) {
//                     setDB(await SQLite.openDatabaseAsync(finalDatabasePath));
//                 }
//             } catch (error) {
//                 if (isMounted) {
//                     console.error("Failed to initialize database:", error);
//                     setError("Failed to initialize database");
//                 }
//             } finally {
//                 isInitializing.current = false;
//             }
//         };

//         initDatabase();

//         // Cleanup on unmount
//         return () => {
//             isMounted = false;
//             if (db) {
//                 db.closeAsync().catch((error) => {
//                     // Ignore errors when closing on unmount
//                     console.log("Error closing database on unmount:", error);
//                 });
//             }
//         };
//     }, [databaseId]);

//     const executeSql = useCallback(async (
//         sql: string,
//         params: any[] = [],
//         queryName?: string
//     ): Promise<any[]> => {
//         const queryId = queryName || `query_${Date.now()}_${Math.random()}`;

//         // Track this query as active
//         activeQueries.current.add(queryId);
//         setLoading(true);
//         setError(null);

//         try {
//             const startTime = Date.now(); // Start timing

//             // Wait for database to be initialized
//             let attempts = 0;
//             while (!db && attempts < 10) {
//                 await new Promise(resolve => setTimeout(resolve, 100));
//                 attempts++;
//             }

//             if (!db) {
//                 throw new Error("Database not initialized or failed to connect");
//             }

//             const statement = await db.prepareAsync(sql);
//             try {
//                 const result = await statement.executeAsync(params);
//                 const endTime = Date.now(); // End timing
//                 const executionTime = endTime - startTime;

//                 const response = await result.getAllAsync();
//                 if (queryName) {
//                     console.log(`Query ${queryName} executed in ${executionTime} ms.`);
//                 }
//                 return response as Row[];
//             } finally {
//                 await statement.finalizeAsync();
//             }
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
//             setError(errorMessage);
//             console.error("SQL execution error:", error);
//             return [];
//         } finally {
//             // Remove this query from active queries
//             activeQueries.current.delete(queryId);
//             // Only set loading to false if no other queries are active
//             if (activeQueries.current.size === 0) {
//                 setLoading(false);
//             }
//         }
//     }, [db]);

//     return { executeSql, loading, error };
// };

// export default useBibleDb;
import { getDatabaseExt, isDefaultDatabase } from "@/constants/databaseNames";
import { DATABASE_TYPE } from "@/types";
import * as SQLite from "expo-sqlite";
import { useRef, useState, useEffect, useCallback } from "react";

interface Row {
    [key: string]: any;
}

type UseBibleDbProps = {
    databaseId: string;
};

const useBibleDb = ({ databaseId }: UseBibleDbProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [db, setDB] = useState<SQLite.SQLiteDatabase | null>(null);
    const activeQueries = useRef<Set<string>>(new Set());
    const isInitializing = useRef(false);

    // Helper to open DB
    const openDatabase = useCallback(async () => {
        if (isInitializing.current) return;

        isInitializing.current = true;
        try {
            const bibleExt = getDatabaseExt(DATABASE_TYPE.BIBLE);
            const isDefaultDatabaseItem = isDefaultDatabase(databaseId);
            const finalDatabasePath = isDefaultDatabaseItem
                ? `${databaseId}.db`
                : `${databaseId}${bibleExt}`;

            // If already open, close it
            if (db) {
                try {
                    await db.closeAsync();
                } catch (err) {
                    console.warn("DB already closed or close failed:", err);
                } finally {
                    setDB(null);
                }
            }

            const newDb = await SQLite.openDatabaseAsync(finalDatabasePath);
            setDB(newDb);
        } catch (err) {
            console.error("Failed to open DB:", err);
            setError("Failed to initialize database");
        } finally {
            isInitializing.current = false;
        }
    }, [databaseId]);

    // Initialize on mount or when databaseId changes
    useEffect(() => {
        openDatabase();

        return () => {
            if (db) {
                db.closeAsync().catch(err =>
                    console.warn("Error closing DB on unmount:", err)
                );
                setDB(null);
            }
        };
    }, [databaseId]);

    const executeSql = useCallback(
        async (sql: string, params: any[] = [], queryName?: string): Promise<Row[]> => {
            const queryId = queryName || `query_${Date.now()}_${Math.random()}`;
            activeQueries.current.add(queryId);
            setLoading(true);
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
                    return rows as Row[];
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
                    setLoading(false);
                }
            }
        },
        [db, openDatabase]
    );

    return { executeSql, loading, error, reopen: openDatabase };
};

export default useBibleDb;
