import JSZip from "jszip";
import * as FileSystem from "expo-file-system";
// @ts-ignore
import { decode as atob, encode as btoa } from "base-64";
import * as Sharing from "expo-sharing";

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
    // Read the ZIP file as base64
    const zipBase64 = await FileSystem.readAsStringAsync(zipFileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Decode the base64 data to Uint8Array
    // @ts-ignore
    const zipData = Uint8Array.from(atob(zipBase64), (c) => c.charCodeAt(0));

    // Create a JSZip instance and load the data
    const zip = await JSZip.loadAsync(zipData);
    return zip;
  } catch (error) {
    console.error("Error reading ZIP file:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

const deleteFile = async (fileUri: string) => {
  try {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
    console.log("File deleted:", fileUri);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

const listFilesInDirectory = async (
  directoryUri: string
): Promise<string[]> => {
  try {
    const files = await FileSystem.readDirectoryAsync(directoryUri);
    console.log("Files in directory:", files);
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
      console.log("File deleted:", fileUri);
    }
    console.log("All files in directory deleted.");
  } catch (error) {
    console.error("Error deleting files in directory:", error);
  }
};

// Function to save a file to the phone's storage
const saveFileToPhone = async (
  fileName: string,
  fileContent: Uint8Array,
  directory: string
) => {
  try {
    // Define the full file path
    const fileUri = `${directory}${fileName}`;

    // Convert Uint8Array to base64 string
    const base64String = uint8ArrayToBase64(fileContent);

    // Write the file to the specified path
    await FileSystem.writeAsStringAsync(fileUri, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("File saved to:", fileUri);

    // Share the file using Expo Sharing API
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

// Function to extract files from the ZIP and save them
const extractAndSaveFiles = async (zip: JSZip, extractionPath: string) => {
  try {
    // Create the extraction directory if it doesn't exist
    await FileSystem.makeDirectoryAsync(extractionPath, {
      intermediates: true,
    });

    // Iterate over the files in the ZIP and extract them
    for (const fileName of Object.keys(zip.files)) {
      const file = zip.files[fileName];
      if (!file.dir) {
        // Ensure you're not trying to write directories
        const fileContent = await file.async("uint8array");

        // Save the file to the specified path and prompt user to share
        await saveFileToPhone(fileName, fileContent, extractionPath);
      }
    }
    console.log("Unzipping and saving complete");
  } catch (error) {
    console.error("Error extracting and saving files:", error);
  }
};

interface UnzipProps {
  zipFileUri: string;
  onProgress: (progress: string) => void; // Callback to update progress
}

// Main function to manage the unzipping process
const unzipFile = async ({ zipFileUri, onProgress }: UnzipProps) => {
  try {
    const extractionPath = `${FileSystem.documentDirectory}SQLite/`;
    onProgress("Reading ZIP file...");
    const zip = await readZipFile(zipFileUri);
    await extractAndSaveFiles(zip, extractionPath);

    // Delete the ZIP file after extraction
    await deleteFile(zipFileUri);

    // List files in the extraction directory
    const files = await listFilesInDirectory(extractionPath);
    onProgress("Unzipping complete");
    console.log("Unzipped files are located at:", extractionPath);
    console.log("Files:", files);
  } catch (error) {
    onProgress("Error during unzipping");
    console.error("Error during unzipping process:", error);
  }
};

export default unzipFile;
