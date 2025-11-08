import { useEffect } from "react";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { storedData$ } from "@/context/LocalstoreContext";

/**
 * Hook to load and cache the Lexical bundle
 * Similar to useLoadTailwindScript, this loads the bundle once and caches it
 * in the storage context for future use.
 */
const useLoadLexicalBundle = () => {
    useEffect(() => {
        const loadLexicalBundle = async () => {
            try {
                // Try to load from storage context first
                const cachedBundle = storedData$.lexicalBundle.get();

                if (cachedBundle) {
                    console.log('Lexical bundle loaded from cache');
                    return;
                }

                // If not in cache, load from asset file
                const asset = Asset.fromModule(require('../assets/lexical-bundle.txt'));
                await asset.downloadAsync();
                const lexicalBundle = await FileSystem.readAsStringAsync(
                    asset.localUri!
                );

                const scriptTag = `<script defer>${lexicalBundle}</script>`;
                // Save to storage context for future use
                storedData$.lexicalBundle.set(scriptTag);

                console.log('Lexical bundle loaded from asset and cached', { lexicalBundle });
            } catch (error) {
                console.error('Error loading Lexical bundle:', error);
            }
        };

        loadLexicalBundle();
    }, []);
};

export default useLoadLexicalBundle;

