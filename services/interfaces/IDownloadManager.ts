/**
 * Download Manager Interface
 * Main interface for managing downloads
 */

export interface DownloadQueueItem {
    storedName: string;
    name: string;
    url: string;
    size: number;
}

export interface IDownloadManager {
    /**
     * Initialize the download manager
     */
    initialize(): Promise<void>;

    /**
     * Add a download to the queue
     */
    addToQueue(item: DownloadQueueItem): Promise<any>;

    /**
     * Cancel a download
     */
    cancelDownload(storedName: string): Promise<void>;

    /**
     * Retry a failed download
     */
    retryDownload(storedName: string): Promise<void>;

    /**
     * Remove a completed download from state
     */
    removeCompleted(storedName: string): void;

    /**
     * Clear all completed downloads from state
     */
    clearCompleted(): void;

    /**
     * Manually force queue processing (useful for debugging)
     */
    forceProcessQueue(): void;

    /**
     * Get current queue status for debugging
     */
    getQueueStatus(): any;

    /**
     * Fix stuck queue items
     */
    fixStuckQueue(): void;

    /**
     * Cleanup resources when service is destroyed
     */
    destroy(): void;
}

