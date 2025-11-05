import { defaultDatabases } from "@/constants/databaseNames";
import { downloadState$ } from "@/state/downloadState";
import { useMemo } from "react";
import useInstalledBibles, { VersionItem } from "./useInstalledBible";

export type ModuleWithStatus = VersionItem & {
    downloadStatus?: 'queued' | 'downloading' | 'unzipping' | 'completed' | 'failed' | 'cancelled';
    downloadProgress?: number;
    downloadError?: string;
    isDefault?: boolean;
    baseDownloadName?: string; // The original download name (for multi-file downloads)
};

/**
 * Combined hook that merges file system data with download state
 * Provides a complete view of all installed modules with their download status
 */
const useInstalledModules = () => {
    // Get actual files from disk
    const {
        installedBibles,
        installedDictionary,
        installedCommentary,
        isLoaded,
        refreshDatabaseList,
    } = useInstalledBibles();

    // Get download state
    const downloads = downloadState$.downloads.get();

    // Combine and enrich data
    const allModules = useMemo(() => {
        const modules = [
            ...installedBibles,
            ...installedDictionary,
            ...installedCommentary,
        ];

        return modules.map((module): ModuleWithStatus => {
            const storedNameWithoutExt = module.shortName.replace(/.db$/, "");
            const downloadInfo = downloads[storedNameWithoutExt];
            const isDefault = defaultDatabases.includes(module.id);

            // Extract base download name (for multi-file downloads)
            // e.g., "NVIC'17-bible" -> "NVIC'17"
            // e.g., "NVIC'17.commentaries" -> "NVIC'17"
            let baseDownloadName = storedNameWithoutExt;
            if (storedNameWithoutExt.includes('-bible')) {
                baseDownloadName = storedNameWithoutExt.replace('-bible', '');
            } else if (storedNameWithoutExt.includes('.commentaries')) {
                baseDownloadName = storedNameWithoutExt.split('.commentaries')[0];
            } else if (storedNameWithoutExt.includes('.dictionary')) {
                baseDownloadName = storedNameWithoutExt.split('.dictionary')[0];
            }

            return {
                ...module,
                downloadStatus: downloadInfo?.status,
                downloadProgress: downloadInfo?.progress,
                downloadError: downloadInfo?.error,
                isDefault,
                baseDownloadName,
            };
        });
    }, [installedBibles, installedDictionary, installedCommentary, downloads]);

    // Filtered views
    const downloadedModules = useMemo(
        () => allModules.filter((m) => !m.isDefault),
        [allModules]
    );

    const bibles = useMemo(
        () => allModules.filter((m) => !m.shortName.includes(".dictionary") && !m.shortName.includes(".commentaries")),
        [allModules]
    );

    const dictionaries = useMemo(
        () => allModules.filter((m) => m.shortName.includes(".dictionary")),
        [allModules]
    );

    const commentaries = useMemo(
        () => allModules.filter((m) => m.shortName.includes(".commentaries")),
        [allModules]
    );

    // Active downloads (downloading or unzipping)
    const activeDownloads = useMemo(
        () => allModules.filter(
            (m) => m.downloadStatus === "downloading" || m.downloadStatus === "unzipping"
        ),
        [allModules]
    );

    return {
        // All modules with status
        allModules,

        // Filtered views
        downloadedModules, // Excludes defaults
        bibles,
        dictionaries,
        commentaries,
        activeDownloads,

        // Utilities
        isLoaded,
        refreshDatabaseList,
    };
};

export default useInstalledModules;

