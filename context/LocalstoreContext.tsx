import { StorageKeys } from "@/constants/StorageKeys";
import { pb } from "@/globalConfig";
import { bibleState$ } from "@/state/bibleState";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { settingState$ } from "@/state/settingState";
import { EBibleVersions, EThemes, pbUser, SortOption, TFont } from "@/types";
import { observable, syncState, when } from "@legendapp/state";
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import { use$ } from "@legendapp/state/react";
import { configureSynced, syncObservable } from "@legendapp/state/sync";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useNetwork } from "@/context/NetworkProvider";
import { showToast } from "@/utils/showToast";
import React, {
  createContext,
  ReactNode,
  use,
  useCallback,
  useEffect,
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
  googleAIKey: string;
  notificationPreferences: {
    notificationEnabled: boolean;
    dailyVerseEnabled: boolean;
    dailyVerseTime: string;
    devotionalReminder: boolean;
    memorizationReminder: boolean;
    pushToken: string | null;
  };
  dbTableCreated: string[];
  useDomComponent: boolean;
  showReadingTime: boolean;
  appFolderUri: string;
  appFolderTreeUri: string;
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
  selectedFont: TFont.Quicksand,
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
  songFontSize: 26,
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
  lastSyncTime: "",
  googleAIKey: "",
  notificationPreferences: {
    notificationEnabled: true,
    dailyVerseEnabled: true,
    dailyVerseTime: "08:00",
    devotionalReminder: true,
    memorizationReminder: false,
    pushToken: null,
  },
  dbTableCreated: [],
  useDomComponent: false,
  showReadingTime: false,
  appFolderUri: "",
  appFolderTreeUri: "",
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
  syncWithCloud: ({ alert }: { alert?: boolean }) => Promise<boolean>;
  loadFromCloud: () => Promise<boolean>;
  toggleCloudSync: (enable: boolean) => void;
  updateNotificationPreferences: (
    preferences: StoreState["notificationPreferences"]
  ) => void;
  getNotificationPreferences: () => StoreState["notificationPreferences"];
}

const StorageContext = createContext<StorageContextProps | undefined>(
  undefined
);

export const useStorage = () => {
  const context = use(StorageContext);
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
  const netInfo = useNetwork();
  const { isConnected } = netInfo;

  useEffect(() => {
    const loadState = async () => {
      await when(() => syncState$.isPersistLoaded.get());
      // Migrate script download data from old storage to new state
      await scriptDownloadHelpers.migrateFromOldStorage();

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
    if (storedData$.user.get() && pb.authStore.isValid && isConnected) {
      loadFromCloud();
    }
  }, [pb.authStore.isValid, isConnected]);

  useEffect(() => {
    const unsubscribeFromChanges = storedData$.onChange((value) => {
      if (storedData$.user.get() && pb.authStore.isValid) {
        console.log('syncing with cloud');
        setHasPendingCloudSync(true);
      }
    });
    return () => unsubscribeFromChanges();
  }, []);

  const clearData = async () => {
    console.log("🗑 Clearing data...");
    storedData$.set(initialContext);
    scriptDownloadHelpers.clearTailwindScript();
    scriptDownloadHelpers.clearLexicalBundle();
    scriptDownloadHelpers.clearFontStyles();
  };

  const toggleCloudSync = useCallback(
    (enable: boolean) => {
      if (enable && !isConnected) {
        console.log(
          "Sin conexión a Internet",
          "No se puede activar la sincronización con la nube sin conexión a Internet. Por favor, inténtalo de nuevo cuando estés conectado."
        );
        return;
      }

      if (enable && pb.authStore.isValid) {
        syncWithCloud({});
      }
    },
    [isConnected]
  );

  const syncWithCloud = async ({
    alert = true,
  }: {
    alert?: boolean;
  }): Promise<boolean> => {
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

      if (alert) {
        showToast("✅ Configuración sincronizada con la nube");
      }
      return true;
    } catch (error: any) {
      console.error("Error al sincronizar con la nube:", error.originalError);
      return false;
    }
  };

  const loadFromCloud = useCallback(async (): Promise<boolean> => {
    if (isSyncing) {
      console.log("Sincronización en curso, no se puede cargar desde la nube.");
      return false;
    }

    if (!isConnected) {
      console.log(
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

        storedData$.set((prev) => ({
          ...prev,
          ...settingsData,
          isDataLoaded: true,
          isSyncedWithCloud: true,
          token: storedData$.get().token,
          user: storedData$.get().user,
        }));

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

      await syncWithCloud({});
      return false;
    } catch (error: any) {
      console.log("Error al cargar desde la nube:", error.originalError);
      // console.error("Error al cargar desde la nube:", error);
      return false;
    } finally {
      console.log("📌Configuración cargada desde la nube");
      storedData$.isDataLoaded.set(true);
      setSyncing(false);
    }
  }, [isConnected]);

  const updateNotificationPreferences = (
    preferences: StoreState["notificationPreferences"]
  ) => {
    storedData$.notificationPreferences.set(preferences);
  };

  const getNotificationPreferences = () => {
    return storedData$.notificationPreferences.get();
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
        updateNotificationPreferences,
        getNotificationPreferences,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export default StorageProvider;
