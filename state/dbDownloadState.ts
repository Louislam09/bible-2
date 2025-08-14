import { VersionItem } from "@/hooks/useInstalledBible";
import { observable } from "@legendapp/state";

interface DBDownloadState {
    isDownloading: boolean;
    progress: number;
    progressText: string;
    downloadedSize: number;
    totalSize: number;
    error: Error | null;
    dbItem: VersionItem | null;
}

export const dbDownloadState$ = observable<DBDownloadState>({
    isDownloading: false,
    progress: 0,
    progressText: '',
    downloadedSize: 0,
    totalSize: 0,
    error: null,
    dbItem: null,
});
