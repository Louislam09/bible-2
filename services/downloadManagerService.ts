import {
    baseDownloadUrl,
    SQLiteDirPath
} from "@/constants/databaseNames";
import {
    DownloadItem,
    downloadState$,
    downloadStateHelpers,
} from "@/state/downloadState";
import { classifyDownloadError } from "@/utils/downloadErrors";
import unzipFile from "@/utils/unzipFile";
import * as FileSystem from "expo-file-system";
import { downloadNotificationService } from "./downloadNotificationService";
import { DownloadQueueItem, IDownloadManager } from "./interfaces/IDownloadManager";

// ✅ Implement IDownloadManager interface for better architecture
class DownloadManagerService implements IDownloadManager {
    private activeDownloads: Map<
        string,
        FileSystem.DownloadResumable
    > = new Map();
    private isInitialized = false;
    private networkUnsubscribe?: () => void;

    async initialize() {
        if (this.isInitialized) return;

        // Setup notification channel
        await downloadNotificationService.setupDownloadNotificationChannel();

        // Resume any incomplete downloads
        await this.resumeIncompleteDownloads();

        this.isInitialized = true;
    }

    // Resume failed downloads when network is restored
    private async resumeFailedDownloadsOnReconnect() {
        const failedDownloads = downloadStateHelpers.getFailedDownloads();

        for (const download of failedDownloads) {
            const retryCount = download.retryCount || 0;
            // Only retry if under max retries
            if (retryCount < 1) {
                console.log("Auto-retrying failed download:", download.storedName);
                await this.retryDownload(download.storedName);
            }
        }
    }

    // Cleanup method to call when service is destroyed
    destroy() {
        if (this.networkUnsubscribe) {
            this.networkUnsubscribe();
        }
    }

    // ✅ Improved download resumption with proper state recovery
    private async resumeIncompleteDownloads() {
        const downloads = downloadStateHelpers.getAllDownloads();
        const incompleteDownloads = downloads.filter(
            (d) => d.status === "downloading" || d.status === "paused"
        );

        console.log(`Found ${incompleteDownloads.length} incomplete downloads to resume`);

        for (const download of incompleteDownloads) {
            // Check if download was actually in progress (has resumable data)
            if (download.downloadResumableData) {
                try {
                    console.log(`Attempting to resume download: ${download.storedName}`);

                    // Try to resume from saved state
                    const resumableData = JSON.parse(download.downloadResumableData);
                    const resumable = new FileSystem.DownloadResumable(
                        resumableData.url,
                        resumableData.fileUri,
                        resumableData.options,
                        (progressData) => this.handleProgress(download.storedName, progressData),
                        resumableData.resumeData
                    );

                    // Store the resumable
                    this.activeDownloads.set(download.storedName, resumable);

                    // Update status to downloading
                    downloadStateHelpers.updateDownload(download.storedName, {
                        status: "downloading",
                    });

                    // Resume the download
                    const result = await resumable.resumeAsync();

                    if (result) {
                        // Download completed, now unzip
                        await this.unzipDownload(
                            download.storedName,
                            result.uri,
                            download.name
                        );
                    }
                } catch (error) {
                    console.warn(
                        `Failed to resume download ${download.storedName}, will restart:`,
                        error
                    );

                    // If resume fails, clean up partial download and add to queue
                    const fileUri = `${SQLiteDirPath}/${download.storedName}`;
                    const downloadDest = `${fileUri}.zip`;

                    try {
                        await FileSystem.deleteAsync(downloadDest, { idempotent: true });
                    } catch (cleanupError) {
                        console.warn("Failed to cleanup partial download:", cleanupError);
                    }

                    // Reset to queued for fresh start
                    downloadStateHelpers.updateDownload(download.storedName, {
                        status: "queued",
                        progress: 0,
                        downloadResumableData: undefined,
                    });
                }
            } else {
                // No resumable data, start fresh
                console.log(`No resumable data for ${download.storedName}, queuing fresh download`);
                downloadStateHelpers.updateDownload(download.storedName, {
                    status: "queued",
                    progress: 0,
                });
            }
        }

        // Process the queue for any downloads that need fresh start
        this.processQueue();
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
                    retryCount: (existing.retryCount || 0) + 1,
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

        // Notify download started
        await downloadNotificationService.notifyDownloadStarted(
            storedName,
            download.name
        );

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

            // Save resumable data for file over 30mb
            if (download.size > 30 * 1024 * 1024) {
                const resumableData = downloadResumable.savable();
                downloadStateHelpers.updateDownload(storedName, {
                    downloadResumableData: JSON.stringify(resumableData),
                });
            }

            // Start download (non-blocking)
            const result = await downloadResumable.downloadAsync();

            if (!result) {
                throw new Error("Download failed - no result returned");
            }

            // Download completed, now unzip
            await this.unzipDownload(storedName, downloadDest, download.name);
        } catch (error: any) {
            console.error("Download error:", error);
            await this.handleDownloadError(storedName, download, error);
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
        const progress =
            totalBytesWritten / totalBytesExpectedToWrite;

        // Update state
        downloadStateHelpers.updateDownload(storedName, {
            progress: progress >= 1 ? 0.99 : progress,
        });

        // Update notification
        const download = downloadStateHelpers.getDownload(storedName);
        if (download) {
            downloadNotificationService.notifyDownloadProgress(
                storedName,
                download.name,
                progress >= 1 ? 0.99 : progress
            );
        }
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

            // Notify unzipping
            await downloadNotificationService.notifyDownloadUnzipping(
                storedName,
                name
            );

            // Unzip with progress callback
            await unzipFile({
                zipFileUri: zipPath,
                onProgress: (progressText) => {
                    downloadStateHelpers.updateDownload(storedName, {
                        unzipProgress: progressText,
                    });
                },
            });

            // Mark as completed
            downloadStateHelpers.updateDownload(storedName, {
                status: "completed",
                progress: 1,
                completedAt: Date.now(),
            });

            // Notify completion
            await downloadNotificationService.notifyDownloadCompleted(
                storedName,
                name
            );

            // Process next in queue
            this.processQueue();
        } catch (error: any) {
            console.error("Unzip error:", error);
            throw error;
        }
    }

    // ✅ Enhanced error handling with structured errors
    private async handleDownloadError(
        storedName: string,
        download: DownloadItem,
        error: any
    ) {
        // Classify the error
        const downloadError = classifyDownloadError(error);

        // Log error for debugging
        console.error("Download error:", {
            storedName,
            code: downloadError.code,
            message: downloadError.message,
            userMessage: downloadError.userMessage,
            recoverable: downloadError.recoverable,
        });

        const retryCount = download.retryCount || 0;
        const MAX_RETRIES = 3;

        // Only retry if error is recoverable and under max retries
        if (downloadError.recoverable && retryCount < MAX_RETRIES) {
            console.log(
                `Retrying download (${retryCount + 1}/${MAX_RETRIES}):`,
                storedName
            );

            downloadStateHelpers.updateDownload(storedName, {
                status: "queued",
                progress: 0,
                retryCount: retryCount + 1,
            });

            // Wait with exponential backoff
            const retryDelay = downloadError.getRetryDelay(retryCount);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));

            // Add back to queue
            const currentQueue = downloadState$.queue.peek();
            if (!currentQueue.includes(storedName)) {
                downloadState$.queue.set([storedName, ...currentQueue]);
            }

            this.processQueue();
        } else {
            // Mark as failed with user-friendly message
            downloadStateHelpers.updateDownload(storedName, {
                status: "failed",
                error: downloadError.userMessage,
            });

            // Notify failure
            await downloadNotificationService.notifyDownloadFailed(
                storedName,
                download.name,
                downloadError.userMessage
            );

            // Process next in queue
            this.processQueue();
        }
    }

    async pauseDownload(storedName: string) {
        const downloadResumable = this.activeDownloads.get(storedName);
        if (downloadResumable) {
            try {
                await downloadResumable.pauseAsync();
                downloadStateHelpers.updateDownload(storedName, {
                    status: "paused",
                });
            } catch (error) {
                console.error("Error pausing download:", error);
            }
        }
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

        // Dismiss notification
        await downloadNotificationService.dismissDownloadNotification(storedName);

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
            retryCount: 0,
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

