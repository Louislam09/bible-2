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

import useInternetConnection from "@/hooks/useInternetConnection";
import { showToast } from "@/utils/showToast";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";

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
  isUUIDGenerated: boolean;
  isFavUUIDGenerated: boolean;
  songFontSize: number;
  currentVoiceIdentifier: string;
  currentVoiceRate: number;
  floatingNoteButtonPosition: { x: number; y: number };
  userData: { name: string; email: string; status: string };
  memorySortOption: SortOption;
  deleteLastStreakNumber: number;
  isDataLoaded: boolean;
  isSyncedWithCloud: boolean;
  user: pbUser | null;
  token: string;
  lastSyncTime: string;
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
  isUUIDGenerated: false,
  isFavUUIDGenerated: false,
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
  user: null,
  token: "",
  lastSyncTime: ''
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
  clearData: () => void;
  isDataLoaded: boolean;
  hasPendingCloudSync: boolean;
  syncWithCloud: () => Promise<boolean>;
  loadFromCloud: () => Promise<boolean>;
  toggleCloudSync: (enable: boolean) => void;
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
  const [hasPendingCloudSync, setHasPendingCloudSync] = useState(false);
  const [isSyncing, setSyncing] = useState(false);
  const { isConnected } = useInternetConnection();

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
    };

    loadState();
  }, []);

  useEffect(() => {
    if (storedData$.user.get() && pb.authStore.isValid) {
      loadFromCloud();
    }
  }, [pb.authStore.isValid]);

  useEffect(() => {
    const unsubscribeFromChanges = storedData$.onChange((value) => {
      if (storedData$.user.get() && pb.authStore.isValid) {
        setHasPendingCloudSync(true);
      }
    });
    return () => unsubscribeFromChanges();
  }, []);

  const clearData = async () => {
    console.log("🗑 Clearing data...");
    storedData$.set(initialContext);
  };

  const toggleCloudSync = (enable: boolean) => {
    if (enable && !isConnected) {
      Alert.alert(
        "Sin conexión a Internet",
        "No se puede activar la sincronización con la nube sin conexión a Internet. Por favor, inténtalo de nuevo cuando estés conectado."
      );
      return;
    }


    if (enable && pb.authStore.isValid) {
      syncWithCloud();
    }
  };

  const syncWithCloud = async (): Promise<boolean> => {
    if (!isConnected) {
      Alert.alert(
        "Sin conexión a Internet",
        "No se pueden sincronizar los datos con la nube sin conexión a Internet. Por favor, inténtalo de nuevo cuando estés conectado."
      );
      return false;
    }

    try {
      const user = storedData$.user.get();
      if (!user) {
        console.log("No hay usuario autenticado para sincronizar");
        return false;
      }
      const settings = storedData$.get();
      const existingSettings = await pb
        .collection("user_settings")
        .getList(1, 1, {
          filter: `user = "${user.id}"`,
        });
      if (existingSettings.items.length > 0) {
        await pb
          .collection("user_settings")
          .update(existingSettings.items[0].id, {
            settings: JSON.stringify(settings),
          });
      } else {
        await pb.collection("user_settings").create({
          settings: JSON.stringify(settings),
          user: user.id,
        });
      }

      storedData$.isSyncedWithCloud.set(true);
      setHasPendingCloudSync(false);
      // console.log("✅ Configuración sincronizada con la nube");
      showToast("✅ Configuración sincronizada con la nube");
      return true;
    } catch (error) {
      console.error("Error al sincronizar con la nube:", error);
      return false;
    }
  };

  const loadFromCloud = async (): Promise<boolean> => {
    if (isSyncing) {
      console.log("Sincronización en curso, no se puede cargar desde la nube.");
      return false;
    }

    if (!isConnected) {
      Alert.alert(
        "Sin conexión a Internet",
        "No se pueden cargar los datos desde la nube sin conexión a Internet. Por favor, inténtalo de nuevo cuando estés conectado."
      );
      return false;
    }

    try {
      const user = storedData$.user.get();

      if (!user) {
        console.log("No hay usuario autenticado para cargar configuración");
        return false;
      }
      setSyncing(true);
      const existingSettings = await pb
        .collection("user_settings")
        .getList(1, 1, {
          filter: `user = "${user.id}"`,
        });

      if (existingSettings.items.length > 0) {
        const settingsData = existingSettings.items[0].settings as StoreState;

        if (user.name || user.email) {
          settingsData.userData = {
            name: user.name || "",
            email: user.email || "",
            status: settingsData.userData?.status || "",
          };
        }

        storedData$.set({
          ...settingsData,
          isDataLoaded: true,
          isSyncedWithCloud: true,
          token: storedData$.get().token,
          user: storedData$.get().user
        });

        bibleState$.changeBibleQuery({
          book: settingsData.lastBook,
          chapter: settingsData.lastChapter,
          verse: settingsData.lastVerse,
          bottomSideBook: settingsData.lastBottomSideBook,
          bottomSideChapter: settingsData.lastBottomSideChapter,
          bottomSideVerse: settingsData.lastBottomSideVerse,
          isHistory: true,
        });

        settingState$.requiresSettingsReloadAfterSync.set(true);

        return true;
      }

      await syncWithCloud();
      return false;
    } catch (error: any) {
      console.log("Error al cargar desde la nube:", error.originalError);
      console.error("Error al cargar desde la nube:", error);
      return false;
    } finally {
      console.log("📌Configuración cargada desde la nube");
      storedData$.isDataLoaded.set(true);
      setSyncing(false);
    }
  };

  return (
    <StorageContext.Provider
      value={{
        storedData,
        isDataLoaded: storedData.isDataLoaded,
        hasPendingCloudSync,
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