import * as FileSystem from "expo-file-system";
import { unzip } from "react-native-zip-archive";
import {
  getDatabaseExt,
  getDatabaseType,
  isDefaultDatabase,
} from "@/constants/databaseNames";
import { DATABASE_TYPE } from "@/types";

export const SQLiteDirPath = `${FileSystem.documentDirectory}SQLite`;

interface UnzipProps {
  zipFileUri: string;
  onProgress: (progress: string) => void;
}

const unzipFile = async ({ zipFileUri, onProgress }: UnzipProps) => {
  try {
    const extractionPath = `${SQLiteDirPath}/`;
    onProgress("Preparando archivos...");

    console.log("Starting native unzip process...");
    console.log("Zip file:", zipFileUri);
    console.log("Extraction path:", extractionPath);

    // Ensure directory exists
    await FileSystem.makeDirectoryAsync(extractionPath, {
      intermediates: true,
    });

    // Get list of files BEFORE extraction to identify new files
    const existingFiles = await FileSystem.readDirectoryAsync(extractionPath);

    // Native unzip - runs in native thread, ZERO JS blocking!
    // This is 10-100x faster than JSZip and doesn't block the UI at all
    await unzip(zipFileUri, extractionPath, "UTF-8");

    console.log("Native unzip completed successfully");

    // Get list of ALL files after extraction
    const allFiles = await FileSystem.readDirectoryAsync(extractionPath);

    // Only process NEW files that were just extracted
    const newFiles = allFiles.filter(file => !existingFiles.includes(file));
    console.log("Newly extracted files:", newFiles);

    // Rename files if needed (for non-default databases)
    for (const fileName of newFiles) {
      // Skip zip files and SQLite auxiliary files (WAL and SHM)
      if (
        fileName.endsWith(".zip") ||
        fileName.endsWith("-wal") ||
        fileName.endsWith("-shm")
      ) {
        continue;
      }

      // Only process actual database files (.db, .SQLite3, etc.)
      if (!fileName.includes(".db") && !fileName.includes(".SQLite")) {
        continue;
      }

      const databaseType = getDatabaseType(fileName);
      const allowTypes = [DATABASE_TYPE.BIBLE, DATABASE_TYPE.DICTIONARY, DATABASE_TYPE.COMMENTARY];
      const isDefaultBible = isDefaultDatabase(fileName.replace(/\.(db|SQLite3?)$/i, ""));
      console.log({ databaseType, allowTypes, isDefaultBible })

      if (allowTypes.includes(databaseType) && !isDefaultBible) {
        const newFileName = changeFileNameExt({
          fileName,
          newExt: getDatabaseExt(databaseType),
        });

        if (newFileName !== fileName) {
          const oldPath = `${extractionPath}${fileName}`;
          const newPath = `${extractionPath}${newFileName}`;

          console.log("Renaming file:", { from: fileName, to: newFileName });

          await FileSystem.moveAsync({
            from: oldPath,
            to: newPath,
          });
        }
      }
    }

    onProgress("Limpiando archivos temporales...");

    // Clean up zip file
    await FileSystem.deleteAsync(zipFileUri, { idempotent: true });

    onProgress("¡Archivos listos!");
    console.log("Unzip process completed successfully");
  } catch (error) {
    onProgress("Error durante extracción");
    console.error("Error during unzipping process:", error);
    throw error;
  }
};

// Helper function to change file extension
function getFileExtension(filename: string) {
  const parts = filename.split(".");
  return parts.pop() || "";
}

interface ChangeFileNameExt {
  fileName: string;
  newExt: string;
}

const changeFileNameExt = ({ fileName, newExt }: ChangeFileNameExt) => {
  const fileExt = getFileExtension(fileName);
  const newFileName = fileName.endsWith(`.${fileExt}`)
    ? fileName.replace(`.${fileExt}`, newExt)
    : fileName;
  return newFileName;
};

export default unzipFile;
