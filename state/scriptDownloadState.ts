import { StorageKeys } from "@/constants/StorageKeys";
import { observable } from "@legendapp/state";
import { configureSynced, syncObservable } from "@legendapp/state/sync";
import { observablePersistSQLite } from "@/plugins/observablePersistSQLite";

export interface ScriptDownloadState {
    tailwindScript: string;
    lexicalBundle: string;
    fontStyles: Record<string, string>;
    drivejsScript: string;
    fuseScript: string;
}

const initialState: ScriptDownloadState = {
    tailwindScript: "",
    lexicalBundle: "",
    fontStyles: {},
    drivejsScript: "",
    fuseScript: "",
};

const persistOptions = configureSynced({
    persist: {
        plugin: observablePersistSQLite(),
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

    setDrivejsScript: (script: string) => {
        scriptDownloadState$.drivejsScript.set(script);
    },

    getDrivejsScript: (): string => {
        return scriptDownloadState$.drivejsScript.get();
    },

    setFuseScript: (script: string) => {
        scriptDownloadState$.fuseScript.set(script);
    },

    getFuseScript: (): string => {
        return scriptDownloadState$.fuseScript.get();
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
};

