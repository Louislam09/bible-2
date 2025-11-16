import { StorageKeys } from "@/constants/StorageKeys";
import { observable } from "@legendapp/state";
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import { configureSynced, syncObservable } from "@legendapp/state/sync";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ScriptDownloadState {
    tailwindScript: string;
    lexicalBundle: string;
    fontStyles: Record<string, string>;
}

const initialState: ScriptDownloadState = {
    tailwindScript: "",
    lexicalBundle: "",
    fontStyles: {},
};

const persistOptions = configureSynced({
    persist: {
        plugin: observablePersistAsyncStorage({
            AsyncStorage,
        }),
    },
});

export const scriptDownloadState$ = observable<ScriptDownloadState>(initialState);

// Persist script download state
syncObservable(
    scriptDownloadState$,
    persistOptions({
        persist: {
            name: StorageKeys.SCRIPT_DOWNLOADS,
        },
    })
);

// Helper functions to work with script download state
export const scriptDownloadHelpers = {
    setTailwindScript: (script: string) => {
        scriptDownloadState$.tailwindScript.set(script);
    },

    getTailwindScript: (): string => {
        return scriptDownloadState$.tailwindScript.get();
    },

    setLexicalBundle: (bundle: string) => {
        scriptDownloadState$.lexicalBundle.set(bundle);
    },

    getLexicalBundle: (): string => {
        return scriptDownloadState$.lexicalBundle.get();
    },

    setFontStyle: (fontName: string, style: string) => {
        scriptDownloadState$.fontStyles[fontName].set(style);
    },

    getFontStyle: (fontName: string): string | undefined => {
        return scriptDownloadState$.fontStyles[fontName].get();
    },

    setFontStyles: (styles: Record<string, string>) => {
        scriptDownloadState$.fontStyles.set(styles);
    },

    getAllFontStyles: (): Record<string, string> => {
        return scriptDownloadState$.fontStyles.get();
    },

    removeFontStyle: (fontName: string) => {
        scriptDownloadState$.fontStyles[fontName].delete();
    },

    clearAll: () => {
        scriptDownloadState$.set(initialState);
    },

    clearTailwindScript: () => {
        scriptDownloadState$.tailwindScript.set("");
    },

    clearLexicalBundle: () => {
        scriptDownloadState$.lexicalBundle.set("");
    },

    clearFontStyles: () => {
        scriptDownloadState$.fontStyles.set({});
    },

    /**
     * Migrate script download data from old LocalstoreContext to new scriptDownloadState
     * This function should be called once on app startup to migrate existing data
     */
    migrateFromOldStorage: async () => {
        try {
            // Read old data from AsyncStorage
            const oldDataString = await AsyncStorage.getItem(StorageKeys.BIBLE);


            if (!oldDataString) {
                return;
            }
            const oldData = JSON.parse(oldDataString);

            // Check if old data has script download fields
            const hasOldData = oldData.tailwindScript || oldData.lexicalBundle ||
                (oldData.fontStyles && Object.keys(oldData.fontStyles).length > 0);

            console.log('hasOldData', { hasOldData, oldData });
            if (!hasOldData) {
                return;
            }

            // Migrate data to new state
            if (oldData.tailwindScript) {
                scriptDownloadState$.tailwindScript.set(oldData.tailwindScript);
            }
            if (oldData.lexicalBundle) {
                scriptDownloadState$.lexicalBundle.set(oldData.lexicalBundle);
            }
            if (oldData.fontStyles) {
                scriptDownloadState$.fontStyles.set(oldData.fontStyles);
            }

            // Remove old fields from old storage
            delete oldData.tailwindScript;
            delete oldData.lexicalBundle;
            delete oldData.fontStyles;

            // Save cleaned data back to AsyncStorage
            await AsyncStorage.setItem(StorageKeys.BIBLE, JSON.stringify(oldData));

            console.log('✅ Migrated script download data from old storage to new state');
        } catch (error) {
            console.error('Error migrating script download data:', error);
        }
    },
};

