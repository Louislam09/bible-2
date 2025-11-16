import { useEffect } from "react";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";

// Update this version when you rebuild the bundle to force cache refresh
// Increment this after running: npm run build:lexical
const LEXICAL_BUNDLE_VERSION = "v2.2.0-lists"; // Now includes registerList for full list functionality!

/**
 * Hook to load and cache the Lexical bundle
 * Similar to useLoadTailwindScript, this loads the bundle once and caches it
 * in the storage context for future use.
 */
const useLoadLexicalBundle = () => {
    useEffect(() => {
        const loadLexicalBundle = async () => {
            try {
                // Check if cached bundle has the correct version marker
                const cachedBundle = scriptDownloadHelpers.getLexicalBundle();

                // Use cache only if it contains the version marker
                if (cachedBundle && cachedBundle.includes(LEXICAL_BUNDLE_VERSION)) {
                    console.log(`Lexical bundle ${LEXICAL_BUNDLE_VERSION} loaded from cache`);
                    return;
                }

                if (cachedBundle) {
                    console.log(`Lexical bundle outdated. Reloading with ${LEXICAL_BUNDLE_VERSION}...`);
                }

                // Load from asset file
                const asset = Asset.fromModule(require('../assets/lexical-bundle.txt'));
                await asset.downloadAsync();
                const lexicalBundle = await FileSystem.readAsStringAsync(
                    asset.localUri!
                );

                // Add version marker as a comment at the start
                const scriptTag = `<script defer>/* Lexical Bundle ${LEXICAL_BUNDLE_VERSION} */${lexicalBundle}</script>`;

                // Save to script download state
                scriptDownloadHelpers.setLexicalBundle(scriptTag);

                console.log(`Lexical bundle ${LEXICAL_BUNDLE_VERSION} loaded from asset and cached`);
            } catch (error) {
                console.error('Error loading Lexical bundle:', error);
            }
        };

        loadLexicalBundle();
    }, []);
};

export default useLoadLexicalBundle;

