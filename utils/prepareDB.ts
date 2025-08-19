import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
// @ts-ignore
import { dbFileExt, isDefaultDatabase, SQLiteDirPath } from "@/constants/databaseNames";
import { VersionItem } from "@/hooks/useInstalledBible";
import { dbDownloadState$ } from "@/state/dbDownloadState";
import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
import { Asset } from "expo-asset";

type PrepareDatabaseProps = {
    databaseItem: VersionItem;
    onProgress?: (progress: {
        stage: 'preparing' | 'downloading' | 'extracting' | 'converting' | 'writing' | 'verifying';
        message: string;
        percentage?: number;
        isDownloadingDB?: boolean;
    }) => void;
}

enum DEFAULT_DATABASE {
    BIBLE = "bible",
    NTV = "ntv-bible",
    INTERLINEAR = "interlinear-bible",
}

export const prepareDatabaseFromDbFile = async ({ databaseItem, onProgress }: PrepareDatabaseProps): Promise<SQLite.SQLiteDatabase | null> => {
    try {
        await AsyncStorage.removeItem(`DB_READY_${databaseItem.id}`);
        const localFolder = SQLiteDirPath;
        const DB_NAME = databaseItem.id;
        const isDefaultDatabaseItem = isDefaultDatabase(DB_NAME);
        const DB_FILENAME = isDefaultDatabaseItem ? `${DB_NAME}.db` : `${DB_NAME}${dbFileExt}`;
        const DB_PATH = `${localFolder}/${DB_FILENAME}`;

        let DB_ASSET = require("../assets/db/bible.db");

        switch (DB_NAME) {
            case DEFAULT_DATABASE.BIBLE:
                DB_ASSET = require("../assets/db/bible.db");
                break;
            case DEFAULT_DATABASE.NTV:
                DB_ASSET = require("../assets/db/ntv-bible.db");
                break;
            default:
                DB_ASSET = require("../assets/db/interlinear-bible.db");
                break;
        }

        // Check if DB already exists and is valid
        const dbStorageKey = `DB_READY_${DB_NAME}`;
        const alreadyExtracted = await AsyncStorage.getItem(dbStorageKey);

        const dbExists = await FileSystem.getInfoAsync(DB_PATH);
        if (dbExists.exists && dbExists.size! > 0) {
            console.log(`📖 DB ${DB_FILENAME} already ready (${(dbExists.size! / (1024 * 1024)).toFixed(2)} MB)`);
            return await SQLite.openDatabaseAsync(DB_FILENAME);
        }

        dbDownloadState$.isDownloadingDB.set(true);
        console.log('IT REACHED HERE', { alreadyExtracted, dbExists })
        onProgress?.({
            stage: 'preparing',
            message: `Preparando ${DB_NAME}...`,
            percentage: 5
        });

        // Ensure directory exists
        const dirInfo = await FileSystem.getInfoAsync(localFolder);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(localFolder, { intermediates: true });
        }

        // Get Asset
        onProgress?.({
            stage: 'downloading',
            message: `Descargando ${DB_NAME}...`,
            percentage: 20
        });

        const asset = Asset.fromModule(DB_ASSET);
        await asset.downloadAsync();
        const assetUri = asset.localUri ?? asset.uri;

        if (!assetUri) {
            throw new Error("Could not get asset URI");
        }

        onProgress?.({
            stage: 'writing',
            message: `Guardando base de datos...`,
            percentage: 50
        });

        const fileInfo = await FileSystem.getInfoAsync(DB_PATH);

        if (!fileInfo.exists) {
            await FileSystem.copyAsync({
                from: assetUri as string,
                to: DB_PATH,
            });
        }

        // 8. Verify final file was created successfully
        onProgress?.({
            stage: 'verifying',
            message: `Verificando archivo...`,
            percentage: 90
        });

        const finalFileInfo = await FileSystem.getInfoAsync(DB_PATH);
        if (!finalFileInfo.exists || finalFileInfo.size === 0) {
            throw new Error("Failed to create database file");
        }

        await AsyncStorage.setItem(dbStorageKey, "1");

        onProgress?.({
            stage: 'verifying',
            message: `Probando conexión...`,
            percentage: 95
        });

        // 14. Test database connection before returning
        try {
            const db = await SQLite.openDatabaseAsync(DB_FILENAME);
            // Try a simple query to verify the database is valid
            const result = db.getFirstSync("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1;");

            onProgress?.({
                stage: 'verifying',
                message: `¡Base de datos lista!`,
                percentage: 100,
                isDownloadingDB: false
            });

            return db;
        } catch (dbError) {
            console.error("❌ Database connection test failed:", dbError);
            throw new Error(`Database file is corrupted or invalid: ${dbError}`);
        }

    } catch (error) {
        console.error("❌ Error in prepareDatabase:", error);
        await AsyncStorage.removeItem(`DB_READY_${databaseItem.id}`);
        return null;
    }
};