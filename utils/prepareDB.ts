import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import JSZip from "jszip";
// @ts-ignore
import { decode as atob, encode as btoa } from "base-64";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import { VersionItem } from "@/hooks/useInstalledBible";
import { dbFileExt, isDefaultDatabase, SQLiteDirPath } from "@/constants/databaseNames";
import { dbDownloadState$ } from "@/state/dbDownloadState";

type PrepareDatabaseProps = {
    databaseItem: VersionItem;
    isReDownload?: boolean;
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

// Helper function to convert Uint8Array to base64 (from working unzipFile.ts)
const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
    let binary = "";
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
};

export const prepareDatabaseFromZip = async ({ databaseItem, isReDownload = false, onProgress }: PrepareDatabaseProps): Promise<SQLite.SQLiteDatabase | null> => {
    try {
        // await AsyncStorage.removeItem(`DB_READY_${databaseItem.id}`);
        const localFolder = SQLiteDirPath;
        const DB_NAME = databaseItem.id;
        const isDefaultDatabaseItem = isDefaultDatabase(DB_NAME);
        const DB_FILENAME = isDefaultDatabaseItem ? `${DB_NAME}.db` : `${DB_NAME}${dbFileExt}`;
        const DB_PATH = `${localFolder}/${DB_FILENAME}`;

        let DB_ASSET = require("../assets/db/bible.zip");

        switch (DB_NAME) {
            case DEFAULT_DATABASE.BIBLE:
                DB_ASSET = require("../assets/db/bible.zip");
                break;
            case DEFAULT_DATABASE.NTV:
                DB_ASSET = require("../assets/db/ntv-bible.zip");
                break;
            default:
                DB_ASSET = require("../assets/db/interlinear-bible.zip");
                break;
        }

        // Check if DB already exists and is valid
        const dbStorageKey = `DB_READY_${DB_NAME}`;
        const alreadyExtracted = await AsyncStorage.getItem(dbStorageKey);

        if (alreadyExtracted && !isReDownload) {
            const dbExists = await FileSystem.getInfoAsync(DB_PATH);
            if (dbExists.exists && dbExists.size! > 0) {
                // console.log(`📖 DB ${DB_FILENAME} already ready (${(dbExists.size! / (1024 * 1024)).toFixed(2)} MB)`);
                return await SQLite.openDatabaseAsync(DB_FILENAME);
            }
        }

        dbDownloadState$.isDownloadingDB.set(true);
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
            percentage: 15
        });

        const asset = Asset.fromModule(DB_ASSET);
        await asset.downloadAsync();
        const assetUri = asset.localUri ?? asset.uri;

        if (!assetUri) {
            throw new Error("Could not get asset URI");
        }

        onProgress?.({
            stage: 'extracting',
            message: `Extrayendo archivo ZIP...`,
            percentage: 25
        });

        // 1. Read ZIP as Base64
        const zipBase64 = await FileSystem.readAsStringAsync(assetUri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        // console.log("🔹 Zip Base64: length", zipBase64.length);

        onProgress?.({
            stage: 'downloading',
            message: `Descargando ${DB_NAME}...`,
            percentage: 30
        });

        // 2. Convert to Uint8Array
        // @ts-ignore
        const zipData = Uint8Array.from(atob(zipBase64), (c) => c.charCodeAt(0));

        // 3. Decompress with JSZip
        const zip = await JSZip.loadAsync(zipData);
        const zipFiles = Object.keys(zip.files);

        onProgress?.({
            stage: 'verifying',
            message: `Verificando archivo...`,
            percentage: 35
        });

        // 4. Find .db file
        let dbFileName = zipFiles.find(name =>
            name.endsWith('.db') && !name.includes('/')
        );

        if (!dbFileName) {
            throw new Error(`No .db file found in ZIP: ${zipFiles.join(', ')}`);
        }

        onProgress?.({
            stage: 'extracting',
            message: `Extrayendo ${dbFileName}...`,
            percentage: 40
        });

        // 5. Extract .db file content using the working pattern from unzipFile.ts
        const dbFile = zip.files[dbFileName];
        // const fileContent = await dbFile.async("uint8array");
        const base64String = await dbFile.async("base64")

        onProgress?.({
            stage: 'converting',
            message: `Convirtiendo ${(base64String.length / (1024 * 1024)).toFixed(2)} MB...`,
            percentage: 60
        });

        // 6. Convert to Base64 using the proven working method
        // const base64String = await dbFile.async("base64")
        // console.log('fileBase64', base64String.length)
        // const base64String = uint8ArrayToBase64(fileContent);

        onProgress?.({
            stage: 'writing',
            message: `Guardando base de datos...`,
            percentage: 80
        });

        // 7. Write extracted database directly to final location
        await FileSystem.writeAsStringAsync(DB_PATH, base64String, {
            encoding: FileSystem.EncodingType.Base64,
        });

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

        // const expectedSize = fileContent.byteLength;
        const actualSize = finalFileInfo.size!;

        // 9. Verify sizes match (allow small variance due to filesystem)
        // if (Math.abs(actualSize - expectedSize) > 1024) { // Allow 1KB variance
        //     console.warn(`⚠️ Size mismatch detected! Expected: ${expectedSize}, Got: ${actualSize}`);
        // }

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

        // Cleanup on error
        try {
            const DB_NAME = databaseItem.id;
            const isDefaultDatabaseItem = isDefaultDatabase(DB_NAME);
            const DB_FILENAME = isDefaultDatabaseItem ? `${DB_NAME}.db` : `${DB_NAME}${dbFileExt}`;
            const DB_PATH = `${SQLiteDirPath}/${DB_FILENAME}`;

            // Clean up final file if it exists
            const fileInfo = await FileSystem.getInfoAsync(DB_PATH);
            if (fileInfo.exists) {
                await FileSystem.deleteAsync(DB_PATH);
                // console.log("🧹 Database file deleted");
            }

        } catch (cleanupError) {
            console.warn("⚠️ Could not cleanup files:", cleanupError);
        }

        await AsyncStorage.removeItem(`DB_READY_${databaseItem.id}`);
        return null;
    }
};

export const prepareDatabaseFromDbFile = async ({ databaseItem, isReDownload = false, onProgress }: PrepareDatabaseProps): Promise<SQLite.SQLiteDatabase | null> => {
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