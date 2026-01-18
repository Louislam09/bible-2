import { initSQLiteDir } from "@/constants/databaseNames";
import * as SQLite from "expo-sqlite";

const APP_DB_NAME = "app.db";
let appDatabase: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getAppDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
    if (appDatabase) {
        return appDatabase;
    }

    if (initPromise) {
        return initPromise;
    }

    initPromise = (async () => {
        try {
            await initSQLiteDir();
            const db = await SQLite.openDatabaseAsync(APP_DB_NAME);

            // Optimize database
            await db.execAsync("PRAGMA journal_mode = WAL");
            await db.execAsync("PRAGMA synchronous = NORMAL");
            await db.execAsync("PRAGMA cache_size = 10000");

            appDatabase = db;
            return db;
        } catch (error) {
            console.error("Error initializing app database:", error);
            initPromise = null;
            throw error;
        }
    })();

    return initPromise;
};

export const closeAppDatabase = async () => {
    if (appDatabase) {
        try {
            await appDatabase.closeAsync();
            appDatabase = null;
            initPromise = null;
        } catch (error) {
            console.error("Error closing app database:", error);
        }
    }
};
