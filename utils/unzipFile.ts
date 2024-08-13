import JSZip from "jszip";
import * as FileSystem from "expo-file-system";
// @ts-ignore
import { decode as atob, encode as btoa } from "base-64";
import * as Sharing from "expo-sharing";
import {
  dbFileExt,
  getDatabaseExt,
  getDatabaseType,
} from "constants/databaseNames";
import { DATABASE_TYPE } from "types";
export const SQLiteDirPath = `${FileSystem.documentDirectory}SQLite`;

// Helper function to convert Uint8Array to base64
const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
  let binary = "";
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
};

// Function to read and decode ZIP file
const readZipFile = async (zipFileUri: string): Promise<JSZip> => {
  try {
    const zipBase64 = await FileSystem.readAsStringAsync(zipFileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // @ts-ignore
    const zipData = Uint8Array.from(atob(zipBase64), (c) => c.charCodeAt(0));
    const zip = await JSZip.loadAsync(zipData);
    return zip;
  } catch (error) {
    console.error("Error reading ZIP file:", error);
    throw error;
  }
};

const deleteFile = async (fileUri: string) => {
  try {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

const listFilesInDirectory = async (
  directoryUri: string
): Promise<string[]> => {
  try {
    const files = await FileSystem.readDirectoryAsync(directoryUri);
    return files;
  } catch (error) {
    console.error("Error listing files in directory:", error);
    return [];
  }
};

const deleteFilesInDirectory = async (directoryUri: string) => {
  try {
    const files = await FileSystem.readDirectoryAsync(directoryUri);
    for (const file of files) {
      const fileUri = `${directoryUri}${file}`;
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      // console.log("File deleted:", fileUri);
    }
    // console.log("All files in directory deleted.");
  } catch (error) {
    console.error("Error deleting files in directory:", error);
  }
};

const saveFileToPhone = async (
  fileName: string,
  fileContent: Uint8Array,
  directory: string
) => {
  try {
    const fileUri = `${directory}${fileName}`;
    const base64String = uint8ArrayToBase64(fileContent);
    await FileSystem.writeAsStringAsync(fileUri, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log("File saved to:", fileUri);
    // if (await Sharing.isAvailableAsync()) {
    //   await Sharing.shareAsync(fileUri, {
    //     mimeType: "application/zip",
    //     dialogTitle: "Share ZIP file",
    //   });
    // } else {
    //   console.warn("Sharing is not available on this platform");
    // }
  } catch (error) {
    console.error("Error saving file to phone:", error);
  }
};

interface ChangeFileNameExt {
  fileName: string;
  newExt: string;
}

function getFileExtension(filename: string) {
  const parts = filename.split(".");
  return parts.pop() || "";
}

const changeFileNameExt = ({ fileName, newExt }: ChangeFileNameExt) => {
  const fileExt = getFileExtension(fileName);
  const newFileName = fileName.endsWith(`.${fileExt}`)
    ? fileName.replace(`.${fileExt}`, newExt)
    : fileName;
  return newFileName;
};

const extractAndSaveFiles = async (
  zip: JSZip,
  extractionPath: string,
  onProgress: (message: string) => void
) => {
  try {
    await FileSystem.makeDirectoryAsync(extractionPath, {
      intermediates: true,
    });

    const totalFiles = Object.keys(zip.files).length;
    let filesExtracted = 0;

    for (const fileName of Object.keys(zip.files)) {
      const file = zip.files[fileName];
      const databaseType = getDatabaseType(fileName);
      const allowTypes = [DATABASE_TYPE.BIBLE, DATABASE_TYPE.DICTIONARY];
      if (!file.dir && allowTypes.includes(databaseType)) {
        onProgress(
          `Extrayendo ${fileName} (${filesExtracted + 1}/${totalFiles})`
        );
        const fileContent = await file.async("uint8array");
        const newFileName = changeFileNameExt({
          fileName,
          newExt: getDatabaseExt(databaseType),
        });

        await saveFileToPhone(newFileName, fileContent, extractionPath);
        filesExtracted++;
      }
    }
    onProgress("¡Todo listo para usar!");
  } catch (error) {
    onProgress("Error durante la extracción");
    console.error("Error extracting and saving files:", error);
  }
};

interface UnzipProps {
  zipFileUri: string;
  onProgress: (progress: string) => void;
}

const unzipFile = async ({ zipFileUri, onProgress }: UnzipProps) => {
  try {
    const extractionPath = `${SQLiteDirPath}/`;
    onProgress("Preparando tus archivos, por favor aguarda...");
    const zip = await readZipFile(zipFileUri);
    await extractAndSaveFiles(zip, extractionPath, onProgress);
    await deleteFile(zipFileUri);
    // const files = await listFilesInDirectory(extractionPath);
    onProgress("¡Tus archivos ya están disponibles!");
  } catch (error) {
    onProgress("Error durante el proceso");
    console.error("Error during unzipping process:", error);
  }
};

export default unzipFile;
