import { StorageKeys } from "@/constants/StorageKeys";
import { pb } from "@/globalConfig";
import { bibleState$ } from "@/state/bibleState";
import { settingState$ } from "@/state/settingState";
import { EBibleVersions, EThemes, pbUser, SortOption, TFont } from "@/types";
import { observable, syncState, when } from "@legendapp/state";
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import { use$ } from "@legendapp/state/react";
import { configureSynced, syncObservable } from "@legendapp/state/sync";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [settingId, setSettingId] = useState("");
  const isAuthenticated = false;

  useEffect(() => {
    const loadState = async () => {
      console.log("LOAD STATE FINISHED");
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
    };

    loadState();
  }, []);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (token && model && storedData$.enableCloudSync.get()) {
        console.log(
          "🚪 User just logged in and cloud sync is enabled, try to load their settings"
        );
        // loadFromCloud("subscribe");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const saveData = useCallback((data: Partial<StoreState>) => {
    console.log("💾 Saving data... 💾");
    Object.entries(data).forEach(([key, value]) => {
      // @ts-ignore
      storedData$[key as keyof StoreState].set(value as any);
    });

    storedData$.isSyncedWithCloud.set(false);

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
      syncWithCloud();
    }
  };

  const syncWithCloud = async (): Promise<boolean> => {
    console.log("🔃 syncWithCloud 🔃!");
    try {
      const user = storedData.user;

      if (!user) {
        console.log("No hay usuario autenticado para guardar configuración");
        return false;
      }

      if (!storedData$.enableCloudSync.get()) {
        console.log("Sincronización con la nube está desactivada");
        return false;
      }

      const settings = storedData$.get();

      const existingSettings = await pb
        .collection("user_settings")
        .getList(1, 1, {
          filter: `user = "${user.id}"`,
        });

      if (existingSettings.items.length > 0) {
        setSettingId(existingSettings.items[0].id);
        await pb
          .collection("user_settings")
          .update(existingSettings.items[0].id, {
            settings: JSON.stringify(settings),
            user: user.id,
          });
      } else {
        const mySetting = await pb.collection("user_settings").create({
          settings: JSON.stringify(settings),
          user: user.id,
        });
        mySetting.collectionId;
        setSettingId(mySetting.collectionId);
      }

      storedData$.isSyncedWithCloud.set(true);
      console.log("✅ Configuración sincronizada con la nube");
      return true;
    } catch (error) {
      console.error("Error al sincronizar con la nube:", error);
      return false;
    }
  };

  const loadFromCloud = async (): Promise<boolean> => {
    console.log("> LOAD FROM COULD from :");
    try {
      const user = storedData.user;

      if (!user) {
        console.log("No hay usuario autenticado para cargar configuración");
        return false;
      }

      const existingSettings = await pb
        .collection("user_settings")
        .getList(1, 1, {
          filter: `user = "${user.id}"`,
        });

      if (existingSettings.items.length > 0) {
        const settingsData = existingSettings.items[0].settings;

        if (user.name || user.email) {
          settingsData.userData = {
            name: user.name || "",
            email: user.email || "",
            status: settingsData.userData?.status || "",
          };
        }

        const enableCloudSync = storedData$.enableCloudSync.get();

        storedData$.set({
          ...settingsData,
          enableCloudSync,
          isDataLoaded: true,
          isSyncedWithCloud: true,
        });
        console.log("✅ Configuración cargada desde la nube");
        return true;
      }

      await syncWithCloud();
      return false;
    } catch (error) {
      console.error("Error al cargar desde la nube:", error);
      return false;
    } finally {
      storedData$.isDataLoaded.set(true);
    }
  };

  return (
    <StorageContext.Provider
      value={{
        storedData,
        isDataLoaded: storedData.isDataLoaded,
        isAuthenticated: isAuthenticated,
        saveData,
        clearData,
        syncWithCloud,
        loadFromCloud,
        toggleCloudSync,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export default StorageProvider;
