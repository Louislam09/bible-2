import {
    baseDownloadUrl,
    SQLiteDirPath
} from "@/constants/databaseNames";
import {
    downloadState$,
    downloadStateHelpers,
} from "@/state/downloadState";
import unzipFile from "@/utils/unzipFile";
import * as FileSystem from "expo-file-system";
import { DownloadQueueItem, IDownloadManager } from "./interfaces/IDownloadManager";

class DownloadManagerService implements IDownloadManager {
    private activeDownloads: Map<
        string,
        FileSystem.DownloadResumable
    > = new Map();
    private isInitialized = false;

    async initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
    }

    destroy() {
        // Cleanup if needed
    }

    async addToQueue(item: DownloadQueueItem) {
        // Check if already exists
        const existing = downloadStateHelpers.getDownload(item.storedName);
        if (existing) {
            // If it's failed or cancelled, allow retry
            if (existing.status === "failed" || existing.status === "cancelled") {
                downloadStateHelpers.updateDownload(item.storedName, {
                    status: "queued",
                    progress: 0,
                    error: undefined,
                    startedAt: Date.now(),
                });
            } else if (existing.status === "completed") {
                console.log("Download already completed:", item.storedName);
                return existing;
            } else {
                console.log("Download already in progress:", item.storedName);
                return existing;
            }
        } else {
            // Add new download
            downloadStateHelpers.addDownload(item);
        }

        // Process queue
        this.processQueue();

        return downloadStateHelpers.getDownload(item.storedName);
    }

    private async processQueue() {
        // Check if we can start new downloads
        if (!downloadStateHelpers.canStartNewDownload()) {
            return;
        }

        const queuedDownloads = downloadStateHelpers.getQueuedDownloads();
        const slotsAvailable =
            downloadState$.maxConcurrent.get() -
            downloadStateHelpers.getActiveDownloads().length;

        // Start downloads for available slots
        for (let i = 0; i < Math.min(slotsAvailable, queuedDownloads.length); i++) {
            const download = queuedDownloads[i];
            if (download) {
                this.startDownload(download.storedName);
            }
        }
    }

    private async startDownload(storedName: string) {
        const download = downloadStateHelpers.getDownload(storedName);
        if (!download) {
            console.error("Download not found:", storedName);
            return;
        }

        // Update status
        downloadStateHelpers.updateDownload(storedName, {
            status: "downloading",
            startedAt: Date.now(),
        });

        // Remove from queue
        downloadStateHelpers.removeFromQueue(storedName);

        const downloadFrom = `${baseDownloadUrl}/${download.url}`;
        const fileUri = `${SQLiteDirPath}/${storedName}`;
        const downloadDest = `${fileUri}.zip`;

        try {
            // Create download resumable
            const downloadResumable = FileSystem.createDownloadResumable(
                downloadFrom,
                downloadDest,
                {},
                (progressData) => this.handleProgress(storedName, progressData)
            );

            // Store reference
            this.activeDownloads.set(storedName, downloadResumable);

            // Start download
            const result = await downloadResumable.downloadAsync();

            if (!result) {
                throw new Error("Download failed - no result returned");
            }

            // Download completed, now unzip
            await this.unzipDownload(storedName, downloadDest, download.name);
        } catch (error: any) {
            console.error("Download error:", error);
            await this.handleDownloadError(storedName, error);
        } finally {
            // Clean up
            this.activeDownloads.delete(storedName);
        }
    }

    private handleProgress(
        storedName: string,
        progressData: FileSystem.DownloadProgressData
    ) {
        const { totalBytesExpectedToWrite, totalBytesWritten } = progressData;
        const progress = totalBytesWritten / totalBytesExpectedToWrite;

        // Update state
        downloadStateHelpers.updateDownload(storedName, {
            progress: progress >= 1 ? 0.99 : progress,
        });
    }

    private async unzipDownload(
        storedName: string,
        zipPath: string,
        name: string
    ) {
        try {
            // Update status
            downloadStateHelpers.updateDownload(storedName, {
                status: "unzipping",
                progress: 0.99,
            });

            // Unzip and get extracted files info
            const unzipResult = await unzipFile({
                zipFileUri: zipPath,
                onProgress: () => {
                    // Simple unzip progress - no detailed updates needed
                },
            });

            const completedAt = Date.now();

            console.log(`📦 Extracted ${unzipResult.extractedFiles.length} files from ${storedName}`);

            // Mark main download as completed
            downloadStateHelpers.updateDownload(storedName, {
                status: "completed",
                progress: 1,
                completedAt,
            });

            // Create separate download entries for each extracted file
            if (unzipResult.extractedFiles.length > 0) {
                // Check if this is a multi-file download (Bible + Commentary/Dictionary)
                const hasBible = unzipResult.extractedFiles.some(f => f.type === 'bible');
                const hasOthers = unzipResult.extractedFiles.some(f => f.type !== 'bible');
                const isMultiFile = hasBible && hasOthers;

                for (const extractedFile of unzipResult.extractedFiles) {
                    console.log(`Creating entry for: ${extractedFile.storedName} (${extractedFile.type})`);

                    // For multi-file downloads: Skip the main Bible file (already tracked by main download)
                    // For single-file downloads: Don't skip anything
                    if (isMultiFile && extractedFile.type === 'bible' && extractedFile.storedName.includes(storedName)) {
                        console.log(`Skipping Bible file (already tracked as main download): ${extractedFile.storedName}`);
                        continue;
                    }

                    // Create a completed download entry for each extracted file
                    const fileTypeName = extractedFile.type === 'bible' ? name
                        : extractedFile.type === 'commentary' ? `${name} - Comentarios`
                            : `${name} - Diccionario`;

                    downloadStateHelpers.addDownload({
                        storedName: extractedFile.storedName,
                        name: fileTypeName,
                        url: '', // Not needed for extracted files
                        size: 0, // Not needed for extracted files
                    });

                    // Immediately mark as completed
                    downloadStateHelpers.updateDownload(extractedFile.storedName, {
                        status: "completed",
                        progress: 1,
                        completedAt,
                        startedAt: completedAt,
                    });

                    console.log(`✅ Created completed entry for ${extractedFile.storedName}`);
                }
            }

            // Process next in queue
            this.processQueue();
        } catch (error: any) {
            console.error("Unzip error:", error);
            throw error;
        }
    }

    private async handleDownloadError(
        storedName: string,
        error: any
    ) {
        console.error("Download error:", {
            storedName,
            error: error.message || error,
        });

        // Mark as failed
        downloadStateHelpers.updateDownload(storedName, {
            status: "failed",
            error: error.message || "Error al descargar",
        });

        // Process next in queue
        this.processQueue();
    }

    async cancelDownload(storedName: string) {
        const downloadResumable = this.activeDownloads.get(storedName);

        if (downloadResumable) {
            try {
                await downloadResumable.cancelAsync();
            } catch (error) {
                console.error("Error canceling download:", error);
            }
        }

        // Clean up files
        const fileUri = `${SQLiteDirPath}/${storedName}`;
        const downloadDest = `${fileUri}.zip`;

        try {
            const fileInfo = await FileSystem.getInfoAsync(downloadDest);
            if (fileInfo.exists) {
                await FileSystem.deleteAsync(downloadDest);
            }
        } catch (error) {
            console.warn("Failed to delete partial download:", error);
        }

        // Update state
        downloadStateHelpers.updateDownload(storedName, {
            status: "cancelled",
            progress: 0,
        });

        // Remove from active downloads
        this.activeDownloads.delete(storedName);

        // Process next in queue
        this.processQueue();
    }

    async retryDownload(storedName: string) {
        const download = downloadStateHelpers.getDownload(storedName);
        if (!download) {
            console.error("Download not found:", storedName);
            return;
        }

        // Reset download
        downloadStateHelpers.updateDownload(storedName, {
            status: "queued",
            progress: 0,
            error: undefined,
        });

        // Add to queue if not there
        const currentQueue = downloadState$.queue.get();
        if (!currentQueue.includes(storedName)) {
            downloadState$.queue.set([...currentQueue, storedName]);
        }

        // Process queue
        this.processQueue();
    }

    removeCompleted(storedName: string) {
        downloadStateHelpers.removeDownload(storedName);
    }

    clearCompleted() {
        downloadStateHelpers.clearCompleted();
    }
}

// Export singleton instance
export const downloadManager = new DownloadManagerService();

