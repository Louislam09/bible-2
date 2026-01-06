import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { useEffect } from "react";

const useLoadFuse = () => {
    useEffect(() => {
        const loadFuse = async () => {
            try {
                // Try to load from script download state first
                const cachedScript = scriptDownloadHelpers.getFuseScript();
                if (cachedScript) return

                // If not in cache, load from asset file
                const asset = Asset.fromModule(require('../assets/fuse.txt'));
                await asset.downloadAsync();
                const fuseScript = await FileSystem.readAsStringAsync(
                    asset.localUri!
                );

                const scriptTag = `<script defer>${fuseScript}</script>`;

                // Save to script download state for future use
                scriptDownloadHelpers.setFuseScript(scriptTag);

                console.log('Fuse.js loaded from asset and cached');
            } catch (error) {
                console.error('Error loading Fuse.js:', error);
            }
        };

        loadFuse();
    }, []);
};

export default useLoadFuse;

