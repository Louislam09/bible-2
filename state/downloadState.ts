import { StorageKeys } from "@/constants/StorageKeys";
import { observable } from "@legendapp/state";
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import { configureSynced, syncObservable } from "@legendapp/state/sync";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type DownloadStatus = 'queued' | 'downloading' | 'unzipping' | 'completed' | 'failed' | 'paused' | 'cancelled';

export interface DownloadItem {
    id: string;
    storedName: string;
    name: string;
    url: string;
    size: number;
    status: DownloadStatus;
    progress: number; // 0-1
    error?: string;
    downloadResumableData?: string; // Serialized FileSystem.DownloadResumable data
    startedAt?: number;
    completedAt?: number;
    unzipProgress?: string;
    retryCount?: number;
}

export interface DownloadState {
    downloads: Record<string, DownloadItem>; // keyed by storedName
    queue: string[]; // array of storedNames in queue order
    maxConcurrent: number;
}

const initialState: DownloadState = {
    downloads: {},
    queue: [],
    maxConcurrent: 2,
};

const persistOptions = configureSynced({
    persist: {
        plugin: observablePersistAsyncStorage({
            AsyncStorage,
        }),
    },
});

export const downloadState$ = observable<DownloadState>(initialState);

// Persist download state
syncObservable(
    downloadState$,
    persistOptions({
        persist: {
            name: StorageKeys.DOWNLOADS,
        },
    })
);

// Helper functions to work with download state
export const downloadStateHelpers = {
    addDownload: (item: Omit<DownloadItem, 'id' | 'status' | 'progress'>) => {
        const id = `${item.storedName}-${Date.now()}`;
        const download: DownloadItem = {
            ...item,
            id,
            status: 'queued',
            progress: 0,
            startedAt: Date.now(),
            retryCount: 0,
        };

        downloadState$.downloads[item.storedName].set(download);

        // Add to queue if not already there
        const currentQueue = downloadState$.queue.get();
        if (!currentQueue.includes(item.storedName)) {
            downloadState$.queue.set([...currentQueue, item.storedName]);
        }

        return download;
    },

    // ✅ Atomic state updates to prevent race conditions
    updateDownload: (storedName: string, updates: Partial<DownloadItem>) => {
        const current = downloadState$.downloads[storedName].peek(); // Use peek() for non-reactive read
        if (current) {
            downloadState$.downloads[storedName].assign(updates); // Use assign() for partial updates
        }
    },

    // ✅ Create or update a download entry (useful for extracted files)
    upsertDownload: (storedName: string, download: Partial<DownloadItem> & Pick<DownloadItem, 'name' | 'status'>) => {
        const current = downloadState$.downloads[storedName].peek();

        if (current) {
            // Update existing
            downloadState$.downloads[storedName].assign(download);
        } else {
            // Create new entry
            const id = `${storedName}-${Date.now()}`;
            const newDownload: DownloadItem = {
                id,
                storedName,
                url: '', // Not needed for extracted files
                size: 0, // Not needed for extracted files
                progress: 0,
                retryCount: 0,
                ...download,
            };
            downloadState$.downloads[storedName].set(newDownload);
        }
    },

    removeFromQueue: (storedName: string) => {
        downloadState$.queue.set((currentQueue) =>
            currentQueue.filter(name => name !== storedName)
        );
    },

    getDownload: (storedName: string): DownloadItem | undefined => {
        return downloadState$.downloads[storedName].get();
    },

    getAllDownloads: (): DownloadItem[] => {
        return Object.values(downloadState$.downloads.get());
    },

    getActiveDownloads: (): DownloadItem[] => {
        return Object.values(downloadState$.downloads.get()).filter(
            d => d.status === 'downloading' || d.status === 'unzipping'
        );
    },

    getQueuedDownloads: (): DownloadItem[] => {
        const queue = downloadState$.queue.get();
        const downloads = downloadState$.downloads.get();
        return queue
            .map(name => downloads[name])
            .filter(d => d && d.status === 'queued');
    },

    getCompletedDownloads: (): DownloadItem[] => {
        return Object.values(downloadState$.downloads.get()).filter(
            d => d.status === 'completed'
        );
    },

    getFailedDownloads: (): DownloadItem[] => {
        return Object.values(downloadState$.downloads.get()).filter(
            d => d.status === 'failed'
        );
    },

    // ✅ Atomic removal to prevent race conditions
    removeDownload: (storedName: string) => {
        downloadState$.downloads[storedName].delete(); // Use Legend State's delete() method
        downloadStateHelpers.removeFromQueue(storedName);
    },

    clearCompleted: () => {
        const downloads = downloadState$.downloads.peek(); // Non-reactive read
        const completedKeys = Object.entries(downloads)
            .filter(([_, download]) => download.status === 'completed' || (download.retryCount || 0) >= 1)
            .map(([key]) => key);

        // Delete completed downloads atomically
        completedKeys.forEach(key => {
            downloadState$.downloads[key].delete();
        });
    },

    isDownloading: (storedName: string): boolean => {
        const download = downloadState$.downloads[storedName].get();
        return download?.status === 'downloading' || download?.status === 'unzipping';
    },

    canStartNewDownload: (): boolean => {
        const activeCount = downloadStateHelpers.getActiveDownloads().length;
        const maxConcurrent = downloadState$.maxConcurrent.get();
        return activeCount < maxConcurrent;
    },
};

