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

                // Add back to queue if not already there
                const currentQueue = downloadState$.queue.get();
                if (!currentQueue.includes(item.storedName)) {
                    downloadState$.queue.set([...currentQueue, item.storedName]);
                }
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
        console.log(`Queue status: ${downloadState$.queue.get().length} items in queue`);
        this.processQueue();

        return downloadStateHelpers.getDownload(item.storedName);
    }

    private async processQueue() {
        const activeDownloads = downloadStateHelpers.getActiveDownloads();
        const maxConcurrent = downloadState$.maxConcurrent.get();

        console.log(`📋 Processing queue: ${activeDownloads.length}/${maxConcurrent} active downloads`);

        // Check if we can start new downloads
        if (!downloadStateHelpers.canStartNewDownload()) {
            console.log(`⏸️ Cannot start new download: ${activeDownloads.length} >= ${maxConcurrent}`);
            return;
        }

        const queuedDownloads = downloadStateHelpers.getQueuedDownloads();
        const slotsAvailable = maxConcurrent - activeDownloads.length;

        // Debug: Log queue state
        const queueArray = downloadState$.queue.get();
        const allDownloads = downloadState$.downloads.get();
        console.log(`📦 Queue array has ${queueArray.length} items`);
        console.log(`📦 ${queuedDownloads.length} downloads with 'queued' status, ${slotsAvailable} slots available`);

        // Debug: Show status of all items in queue
        queueArray.forEach(name => {
            const download = allDownloads[name];
            console.log(`  - ${name}: status=${download?.status || 'NOT FOUND'}`);
        });

        // Start downloads for available slots (fire and forget - don't await)
        for (let i = 0; i < Math.min(slotsAvailable, queuedDownloads.length); i++) {
            const download = queuedDownloads[i];
            if (download) {
                console.log(`🚀 Starting queued download: ${download.storedName}`);
                // Don't await - let downloads run in parallel
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

        console.log({ baseDownloadUrl, downloadUrl: download.url });
        const downloadFrom = `${baseDownloadUrl}/${download.url}`;
        const fileUri = `${SQLiteDirPath}/${storedName}`;
        const downloadDest = `${fileUri}.zip`;

        try {
            console.log(`📥 Starting download: ${storedName} (${download.size} bytes)`);

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
            console.log(`Downloading from: ${downloadFrom}`);
            const result = await downloadResumable.downloadAsync();

            if (!result) {
                throw new Error("Download failed - no result returned");
            }

            console.log(`✅ Download completed: ${storedName}`);

            // Download completed, now unzip
            await this.unzipDownload(storedName, downloadDest, download.name);
        } catch (error: any) {
            console.error(`❌ Download error for ${storedName}:`, error);
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                stack: error.stack?.substring(0, 200)
            });
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

            // Auto-cleanup: Remove completed download from state after 3 seconds
            // This prevents UI from showing progress/status for completed downloads
            setTimeout(() => {
                const download = downloadStateHelpers.getDownload(storedName);
                if (download?.status === "completed") {
                    console.log(`🧹 Auto-cleaning completed download: ${storedName}`);
                    downloadStateHelpers.removeDownload(storedName);
                }
            }, 3000);

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

                    // Auto-cleanup extracted file entries after 3 seconds
                    const cleanupStoredName = extractedFile.storedName;
                    setTimeout(() => {
                        const dl = downloadStateHelpers.getDownload(cleanupStoredName);
                        if (dl?.status === "completed") {
                            console.log(`🧹 Auto-cleaning extracted file: ${cleanupStoredName}`);
                            downloadStateHelpers.removeDownload(cleanupStoredName);
                        }
                    }, 3000);

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
        const errorMessage = error?.message || String(error);
        console.error("Download error:", {
            storedName,
            error: errorMessage,
            errorType: typeof error,
        });

        // Mark as failed with detailed error
        downloadStateHelpers.updateDownload(storedName, {
            status: "failed",
            error: errorMessage || "Error al descargar",
            progress: 0,
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

        console.log(`🔄 Retrying download: ${storedName}`);

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
            console.log(`Added ${storedName} to queue. Queue length: ${currentQueue.length + 1}`);
        } else {
            console.log(`${storedName} already in queue`);
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

    // Manual queue processing - useful for debugging stuck queues
    forceProcessQueue() {
        console.log(`🔧 Manually forcing queue processing...`);
        this.processQueue();
    }

    // Get queue status for debugging
    getQueueStatus() {
        const queueArray = downloadState$.queue.get();
        const allDownloads = downloadState$.downloads.get();
        const activeDownloads = downloadStateHelpers.getActiveDownloads();

        const queueStatus = queueArray.map(name => ({
            name,
            status: allDownloads[name]?.status || 'NOT FOUND',
            progress: allDownloads[name]?.progress || 0,
        }));

        return {
            queueLength: queueArray.length,
            activeDownloads: activeDownloads.length,
            maxConcurrent: downloadState$.maxConcurrent.get(),
            queueItems: queueStatus,
        };
    }

    // Fix stuck items in queue - reset them to queued status
    fixStuckQueue() {
        console.log(`🔧 Fixing stuck queue items...`);
        const queueArray = downloadState$.queue.get();
        const allDownloads = downloadState$.downloads.get();

        queueArray.forEach(name => {
            const download = allDownloads[name];
            if (download && download.status !== 'queued' && download.status !== 'downloading' && download.status !== 'unzipping') {
                console.log(`  - Resetting ${name} from ${download.status} to queued`);
                downloadStateHelpers.updateDownload(name, {
                    status: 'queued',
                    progress: 0,
                    error: undefined,
                });
            }
        });

        this.processQueue();
    }
}

// Export singleton instance
export const downloadManager = new DownloadManagerService();

