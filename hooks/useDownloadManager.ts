import { getIfDatabaseNeedsDownload } from "@/constants/databaseNames";
import { downloadManager } from "@/services/downloadManagerService";
import { downloadState$, downloadStateHelpers } from "@/state/downloadState";
import { useCallback, useEffect, useMemo } from "react";

export const useDownloadManager = () => {
    const downloads = downloadState$.downloads.get();
    const queue = downloadState$.queue.get();

    // Initialize download manager on mount
    useEffect(() => {
        downloadManager.initialize();
    }, []);

    const activeDownloads = useMemo(() => {
        return downloadStateHelpers.getActiveDownloads();
    }, [downloads]);

    const queuedDownloads = useMemo(() => {
        return downloadStateHelpers.getQueuedDownloads();
    }, [downloads, queue]);

    const completedDownloads = useMemo(() => {
        return downloadStateHelpers.getCompletedDownloads();
    }, [downloads]);

    const failedDownloads = useMemo(() => {
        return downloadStateHelpers.getFailedDownloads();
    }, [downloads]);

    const addDownload = useCallback(
        async (item: {
            storedName: string;
            name: string;
            url: string;
            size: number;
        }) => {
            return await downloadManager.addToQueue(item);
        },
        []
    );

    const cancelDownload = useCallback(async (storedName: string) => {
        await downloadManager.cancelDownload(storedName);
    }, []);

    const retryDownload = useCallback(async (storedName: string) => {
        await downloadManager.retryDownload(storedName);
    }, []);

    const clearCompleted = useCallback(() => {
        downloadManager.clearCompleted();
    }, []);

    const removeCompleted = useCallback((storedName: string) => {
        downloadManager.removeCompleted(storedName);
    }, []);

    const isDownloaded = useCallback(
        async (storedName: string): Promise<boolean> => {
            const download = downloadStateHelpers.getDownload(storedName);
            if (download?.status === "completed") {
                return true;
            }
            // Check file system
            const needsDownload = await getIfDatabaseNeedsDownload(storedName);
            return !needsDownload;
        },
        [downloads]
    );

    const getDownloadStatus = useCallback(
        (storedName: string) => {
            return downloadStateHelpers.getDownload(storedName);
        },
        [downloads]
    );

    return {
        activeDownloads,
        queuedDownloads,
        completedDownloads,
        failedDownloads,
        addDownload,
        cancelDownload,
        retryDownload,
        clearCompleted,
        removeCompleted,
        isDownloaded,
        getDownloadStatus,
        allDownloads: Object.values(downloads),
    };
};
