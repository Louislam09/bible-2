import { StorageKeys } from "@/constants/StorageKeys";
import { bibleState$ } from "@/state/bibleState";
import { EBibleVersions, EThemes, pbUser, SortOption, TFont } from "@/types";
import { observable, syncState, when } from "@legendapp/state";
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import { use$ } from "@legendapp/state/react";
import { configureSynced, syncObservable } from "@legendapp/state/sync";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pb } from "@/globalConfig";
// import { authState$ } from "@/state/authState";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const persistOptions = configureSynced({
  persist: {
    plugin: observablePersistAsyncStorage({
      AsyncStorage,
    }),
  },
});

type StoreState = {
  lastBook: string;
  lastChapter: number;
  lastVerse: number;
  lastBottomSideBook: string;
  lastBottomSideChapter: number;
  lastBottomSideVerse: number;
  currentTheme: keyof typeof EThemes;
  fontSize: number;
  selectedFont: string;
  isDarkMode: boolean;
  currentBibleVersion: string;
  isSongLyricEnabled: boolean;
  isAlegresNuevasUnlocked: boolean;
  isAdmin: boolean;
  hasRequestAccess: boolean;
  isGridLayout: boolean;
  isShowName: boolean;
  songFontSize: number;
  currentVoiceIdentifier: string;
  currentVoiceRate: number;
  floatingNoteButtonPosition: { x: number; y: number };
  userData: { name: string; email: string; status: string };
  memorySortOption: SortOption;
  deleteLastStreakNumber: number;
  isDataLoaded: boolean;
  isSyncedWithCloud: boolean;
  enableCloudSync: boolean;
  user: pbUser | null;
  token: string;
};

const initialContext: StoreState = {
  lastBook: "Génesis",
  lastChapter: 1,
  lastVerse: 0,
  lastBottomSideBook: "Génesis",
  lastBottomSideChapter: 1,
  lastBottomSideVerse: 0,
  currentTheme: "Green",
  fontSize: 24,
  selectedFont: TFont.Roboto,
  isDarkMode: true,
  isGridLayout: false,
  isShowName: false,
  currentBibleVersion: EBibleVersions.BIBLE,
  isSongLyricEnabled: false,
  isAlegresNuevasUnlocked: false,
  isAdmin: false,
  hasRequestAccess: false,
  songFontSize: 21,
  currentVoiceIdentifier: "es-us-x-esd-local",
  currentVoiceRate: 1,
  floatingNoteButtonPosition: { x: 0, y: 0 },
  userData: { name: "", email: "", status: "" },
  memorySortOption: SortOption.MostRecent,
  deleteLastStreakNumber: 1,
  isDataLoaded: false,
  isSyncedWithCloud: false,
  enableCloudSync: false,
  user: null,
  token: "",
};

export const storedData$ = observable(initialContext);

syncObservable(
  storedData$,
  persistOptions({
    persist: {
      name: StorageKeys.BIBLE,
    },
  })
);

interface StorageContextProps {
  storedData: StoreState;
  saveData: (data: Partial<StoreState>) => void;
  clearData: () => void;
  isDataLoaded: boolean;
  syncWithCloud: () => Promise<boolean>;
  loadFromCloud: () => Promise<boolean>;
  toggleCloudSync: (enable: boolean) => void;
  isAuthenticated: boolean;
}

const StorageContext = createContext<StorageContextProps | undefined>(
  undefined
);

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};

const StorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const storedData = use$(() => storedData$.get());
  const syncState$ = syncState(storedData$);
  const [dataLoaded, setDataLoaded] = useState(false);
  const isAuthenticated = false;
  // const isAuthenticated = use$(() => authState$.isAuthenticated.get());
  const enableCloudSync = use$(() => storedData$.enableCloudSync.get());
  console.log({ enableCloudSync });

  useEffect(() => {
    const loadState = async () => {
      await when(() => syncState$.isPersistLoaded.get());
      bibleState$.changeBibleQuery({
        book: storedData$.lastBook.get(),
        chapter: storedData$.lastChapter.get(),
        verse: storedData$.lastVerse.get(),
        bottomSideBook: storedData$.lastBottomSideBook.get(),
        bottomSideChapter: storedData$.lastBottomSideChapter.get(),
        bottomSideVerse: storedData$.lastBottomSideVerse.get(),
        isHistory: true,
      });
      storedData$.isDataLoaded.set(true);
      setDataLoaded(true);

      // Only try to load from cloud if user is authenticated AND cloud sync is enabled
      if (pb.authStore.isValid && storedData$.enableCloudSync.get()) {
        loadFromCloud();
      }
    };

    loadState();
  }, []);

  // Listen for authentication changes to sync settings
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (token && model && storedData$.enableCloudSync.get()) {
        console.log(
          "🚪 User just logged in and cloud sync is enabled, try to load their settings"
        );
        // User just logged in and cloud sync is enabled, try to load their settings
        loadFromCloud();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Listen for cloud sync preference changes
  useEffect(() => {
    if (enableCloudSync && isAuthenticated) {
      // If user enables cloud sync and is authenticated, sync immediately
      syncWithCloud();
    }
  }, [enableCloudSync, isAuthenticated]);

  const saveData = useCallback((data: Partial<StoreState>) => {
    console.log("💾 Saving data... 💾");
    Object.entries(data).forEach(([key, value]) => {
      // @ts-ignore
      storedData$[key as keyof StoreState].set(value as any);
    });

    // Only sync with cloud if user is authenticated AND cloud sync is enabled
    if (pb.authStore.isValid && storedData$.enableCloudSync.get()) {
      syncWithCloud();
    }
  }, []);

  const clearData = async () => {
    console.log("🗑 Clearing data...");
    storedData$.set(initialContext);
  };

  const toggleCloudSync = (enable: boolean) => {
    storedData$.enableCloudSync.set(enable);

    if (enable && pb.authStore.isValid) {
      // If enabling cloud sync and user is authenticated, sync immediately
      syncWithCloud();
    }
  };

  // Sync local settings to PocketBase
  const syncWithCloud = async (): Promise<boolean> => {
    console.log("🔃 syncWithCloud called!");
    return false;
    //   try {
    //   const user = authState$.user.get();

    //   if (!user) {
    //     console.log("No hay usuario autenticado para guardar configuración");
    //     return false;
    //   }

    //   if (!storedData$.enableCloudSync.get()) {
    //     console.log("Sincronización con la nube está desactivada");
    //     return false;
    //   }

    //   // Get current settings
    //   const settings = storedData$.get();

    //   // Check if settings record exists
    //   const existingSettings = await pb
    //     .collection("user_settings")
    //     .getList(1, 1, {
    //       filter: `user = "${user.id}"`,
    //     });

    //   if (existingSettings.items.length > 0) {
    //     // Update existing settings
    //     await pb
    //       .collection("user_settings")
    //       .update(existingSettings.items[0].id, {
    //         settings: JSON.stringify(settings),
    //         user: user.id,
    //       });
    //   } else {
    //     // Create new settings
    //     await pb.collection("user_settings").create({
    //       settings: JSON.stringify(settings),
    //       user: user.id,
    //     });
    //   }

    //   storedData$.isSyncedWithCloud.set(true);
    //   console.log("✅ Configuración sincronizada con la nube");
    //   return true;
    // } catch (error) {
    //   console.error("Error al sincronizar con la nube:", error);
    //   return false;
    // }
  };

  // Load settings from PocketBase
  const loadFromCloud = async (): Promise<boolean> => {
    console.log("🧠 loadFromCloud called!");
    return false;
    //   try {
    //   const user = authState$.user.get();

    //   if (!user) {
    //     console.log("No hay usuario autenticado para cargar configuración");
    //     return false;
    //   }

    //   if (!storedData$.enableCloudSync.get()) {
    //     console.log("Sincronización con la nube está desactivada");
    //     return false;
    //   }

    //   // Get settings from PocketBase
    //   const existingSettings = await pb
    //     .collection("user_settings")
    //     .getList(1, 1, {
    //       filter: `user = "${user.id}"`,
    //     });

    //   if (existingSettings.items.length > 0) {
    //     const settingsData = JSON.parse(existingSettings.items[0].settings);

    //     // Update user data from auth
    //     if (user.name || user.email) {
    //       settingsData.userData = {
    //         name: user.name || "",
    //         email: user.email || "",
    //         status: settingsData.userData?.status || "",
    //       };
    //     }

    //     // Preserve the enableCloudSync setting from local storage
    //     const enableCloudSync = storedData$.enableCloudSync.get();

    //     // Update local state with settings from server
    //     storedData$.set({
    //       ...settingsData,
    //       enableCloudSync, // Keep local preference for cloud sync
    //       isDataLoaded: true,
    //       isSyncedWithCloud: true,
    //     });

    //     console.log("✅ Configuración cargada desde la nube");
    //     return true;
    //   }

    //   // If no settings found, sync current settings to cloud
    //   await syncWithCloud();
    //   return false;
    // } catch (error) {
    //   console.error("Error al cargar desde la nube:", error);
    //   return false;
    // }
  };

  return (
    <StorageContext.Provider
      value={{
        storedData,
        saveData,
        clearData,
        isDataLoaded: dataLoaded,
        syncWithCloud,
        loadFromCloud,
        toggleCloudSync,
        isAuthenticated: isAuthenticated,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export default StorageProvider;
