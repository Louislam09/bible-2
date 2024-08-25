import { useState } from "react";
import * as FileSystem from "expo-file-system";

type DownloadPDFHook = {
  isDownloading: boolean;
  downloadProgress: number;
  downloadError: string | null;
  downloadedFileUri: string | null;
  downloadPDF: (url: string, fileName: string) => Promise<void>;
  deleteDownloadedFile: (fileName: string) => Promise<void>;
};

export const useDownloadPDF = (): DownloadPDFHook => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadedFileUri, setDownloadedFileUri] = useState<string | null>(
    null
  );

  const downloadPDF = async (url: string, fileName: string): Promise<void> => {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadProgress(0);

    try {
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (progress) => {
          const progressPercentage =
            (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) *
            100;
          setDownloadProgress(progressPercentage);
        }
      );

      const downloadItem = await downloadResumable.downloadAsync();
      setDownloadedFileUri(downloadItem?.uri as string);
    } catch (error: any) {
      setDownloadError(error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const deleteDownloadedFile = async (fileName: string): Promise<void> => {
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    if (fileUri) {
      try {
        await FileSystem.deleteAsync(fileUri);
        setDownloadedFileUri(null);
      } catch (error: any) {
        setDownloadError(error.message);
      }
    }
  };

  return {
    isDownloading,
    downloadProgress,
    downloadError,
    downloadedFileUri,
    downloadPDF,
    deleteDownloadedFile,
  };
};
