import { VersionItem } from "@/hooks/useInstalledBible";
import { observable } from "@legendapp/state";

type DBDownloadStage = 'preparing' | 'downloading' | 'extracting' | 'converting' | 'writing' | 'verifying';

interface DBDownloadState {
    isDownloadingDB: boolean;
    percentage: number;
    stage: DBDownloadStage;
    message: string;
    downloadedSize: number;
    totalSize: number;
    error: Error | null;
    dbItem: VersionItem | null;
    databaseName: string;
    setDownloadProgress: (progress: Partial<DBDownloadState>) => void;
}

export const dbDownloadState$ = observable<DBDownloadState>({
    isDownloadingDB: false,
    percentage: 0,
    stage: 'preparing',
    message: '',
    downloadedSize: 0,
    totalSize: 0,
    error: null,
    dbItem: null,
    databaseName: '',
    setDownloadProgress: (progress: Partial<DBDownloadState>) => {
        dbDownloadState$.set((prev) => ({ ...prev, ...progress }));
    }
});
