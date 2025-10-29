import { storedData$ } from "@/context/LocalstoreContext";
import * as FileSystem from "expo-file-system";

export const APP_FOLDER_NAME = "Santa Biblia RV60";
const DOCUMENTS_URI = "content://com.android.externalstorage.documents/document/primary%3ADocuments";


const isUriValid = async (uri: string): Promise<boolean> => {
    try {
        await FileSystem.StorageAccessFramework.readDirectoryAsync(uri);
        return true;
    } catch {
        return false;
    }
};

export const getAppFolderUri = async (forceNew: boolean = false): Promise<string | null> => {
    try {
        if (!forceNew) {
            const savedTreeUri = storedData$.appFolderTreeUri.get();
            if (savedTreeUri && await isUriValid(savedTreeUri)) {
                return savedTreeUri;
            }
        }

        // Request permission to Documents folder
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(DOCUMENTS_URI);
        if (!permissions.granted) {
            return null;
        }

        const baseUri = permissions.directoryUri;
        const items = await FileSystem.StorageAccessFramework.readDirectoryAsync(baseUri);

        // Find if app folder already exists
        const existingFolder = items.find((uri) => {
            const decoded = decodeURIComponent(uri);
            const segments = decoded.split("/");
            const name = segments[segments.length - 1] || "";
            return name === APP_FOLDER_NAME;
        });

        let appFolderUri: string;

        if (existingFolder) {
            appFolderUri = existingFolder;
        } else {
            // Create the folder inside Documents
            appFolderUri = await FileSystem.StorageAccessFramework.makeDirectoryAsync(
                baseUri,
                APP_FOLDER_NAME
            );

            // Verify and get the actual folder URI from directory listing
            const verifyItems = await FileSystem.StorageAccessFramework.readDirectoryAsync(baseUri);
            const actualFolder = verifyItems.find(uri => decodeURIComponent(uri).includes(APP_FOLDER_NAME));
            if (actualFolder) {
                appFolderUri = actualFolder;
            }
        }

        // Validate the folder URI
        const decodedFolderUri = decodeURIComponent(appFolderUri);
        if (!decodedFolderUri.includes(APP_FOLDER_NAME)) {
            console.error("Error: App folder URI doesn't contain the folder name");
            return null;
        }

        // Request tree permissions for the folder to enable file creation
        const folderPermissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(appFolderUri);
        if (!folderPermissions.granted) {
            return null;
        }

        const folderTreeUri = folderPermissions.directoryUri;

        // Save both URIs for future use
        await storedData$.appFolderUri.set(appFolderUri);
        await storedData$.appFolderTreeUri.set(folderTreeUri);

        return folderTreeUri;
    } catch (err) {
        console.error("Error getting app folder URI:", err);
        return null;
    }
};

export enum FileMimeType {
    APPLICATION_OCTET_STREAM = "application/octet-stream",
    IMAGE_JPEG = "image/jpeg",
    IMAGE_PNG = "image/png",
}

export const listFilesInAppFolder = async (): Promise<string[]> => {
    try {
        const appFolderUri = await getAppFolderUri();
        if (!appFolderUri) {
            return [];
        }

        const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(appFolderUri);
        return files;
    } catch (err) {
        console.error("Error listing files:", err);
        return [];
    }
};


export const saveFileToAppFolder = async (
    fileUri: string,
    filename?: string,
    mimeType: FileMimeType = FileMimeType.APPLICATION_OCTET_STREAM
): Promise<string | null> => {
    try {
        const appFolderUri = await getAppFolderUri();
        if (!appFolderUri) {
            return null;
        }

        // Verify URI points to app folder
        const decodedUri = decodeURIComponent(appFolderUri);
        if (!decodedUri.includes(APP_FOLDER_NAME)) {
            console.error("Error: URI does not point to app folder");
            return null;
        }

        const name = filename || fileUri.split("/").pop() || `file_${Date.now()}`;

        // Create the file in the app folder
        const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            appFolderUri,
            name,
            mimeType
        );

        // Read original file as base64
        const fileData = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64
        });

        // Write file content to the new location
        await FileSystem.StorageAccessFramework.writeAsStringAsync(
            newFileUri,
            fileData,
            { encoding: FileSystem.EncodingType.Base64 }
        );

        // Delete temporary file
        if (fileUri.includes("cache") || fileUri.includes("tmp") || fileUri.includes(FileSystem.documentDirectory || "")) {
            try {
                await FileSystem.deleteAsync(fileUri, { idempotent: true });
            } catch {
                // Ignore deletion errors
            }
        }

        return newFileUri;
    } catch (err) {
        console.error("Error saving file to app folder:", err);
        return null;
    }
};
