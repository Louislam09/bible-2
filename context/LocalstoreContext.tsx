import { StorageKeys } from "@/constants/StorageKeys";
import { HistoryItem } from "@/hooks/useHistoryManager";
import { EBibleVersions, EThemes, SortOption, TFont } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { observable, syncState, when } from "@legendapp/state";
import { use$, useObservable } from "@legendapp/state/react";
import { configureSynced, syncObservable } from "@legendapp/state/sync";
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import { bibleState$ } from "@/state/bibleState";

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
  isGridLayout: boolean;
  isShowName: boolean;
  songFontSize: number;
  currentVoiceIdentifier: string;
  currentVoiceRate: number;
  floatingNoteButtonPosition: { x: number; y: number };
  memorySortOption: SortOption;
  deleteLastStreakNumber: number;
  isDataLoaded: boolean;
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
  songFontSize: 21,
  currentVoiceIdentifier: "es-us-x-esd-local",
  currentVoiceRate: 1,
  floatingNoteButtonPosition: { x: 0, y: 0 },
  memorySortOption: SortOption.MostRecent,
  deleteLastStreakNumber: 1,
  isDataLoaded: false,
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
  // const storedData = useObservable(storedData$);
  const syncState$ = syncState(storedData$);
  const [dataLoaded, setDataLoaded] = useState(false);

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
      });
      storedData$.isDataLoaded.set(true);
      setDataLoaded(true);
    };

    loadState();
  }, []);

  const saveData = useCallback((data: Partial<StoreState>) => {
    console.log("💾 Saving data... 💾");
    Object.entries(data).forEach(([key, value]) => {
      // @ts-ignore
      storedData$[key as keyof StoreState].set(value as any);
    });
  }, []);

  const clearData = async () => {
    console.log("🗑 Clearing data...");
    await AsyncStorage.removeItem(StorageKeys.LEGEND);
    storedData$.set(initialContext);
  };

  return (
    <StorageContext.Provider
      value={{
        storedData,
        saveData,
        clearData,
        isDataLoaded: dataLoaded,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export default StorageProvider;
