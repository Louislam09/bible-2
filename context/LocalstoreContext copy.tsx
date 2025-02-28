import { StorageKeys } from "@/constants/StorageKeys";
import { HistoryItem } from "@/hooks/useHistoryManager";
import { bibleState$ } from "@/state/bibleState";
import { EBibleVersions, EThemes, SortOption, TFont } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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
  history: HistoryItem[];
  currentVoiceIdentifier: string;
  currentVoiceRate: number;
  floatingNoteButtonPosition: { x: number; y: number };
  memorySortOption: SortOption;
  deleteLastStreakNumber: number;
};

interface StorageContextProps {
  storedData: StoreState;
  saveData: (data: Partial<StoreState>) => Promise<void>;
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

interface StorageProviderProps {
  children: ReactNode;
}

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
  history: [],
  currentVoiceIdentifier: "es-us-x-esd-local",
  currentVoiceRate: 1,
  floatingNoteButtonPosition: { x: 0, y: 0 },
  memorySortOption: SortOption.MostRecent,
  deleteLastStreakNumber: 1,
};

const isArrEqual = (arr1: any[], arr2: any[]) => {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
};

const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
  const [storedData, setStoredData] = useState<StoreState>(initialContext);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem(StorageKeys.BIBLE);
        if (data) {
          const parsedData = JSON.parse(data) as StoreState;
          setStoredData((prev) => ({ ...prev, ...parsedData }));
        }
      } catch (error) {
        console.error("Error loading data from AsyncStorage:", error);
      } finally {
        setDataLoaded(true);
      }
    };

    loadData();
  }, []);

  const saveData = async (data: Partial<StoreState>) => {
    console.log("💾 Save to localstorage 💾");
    try {
      const updatedData = {
        ...storedData,
        ...data,
      };
      await AsyncStorage.setItem(
        StorageKeys.BIBLE,
        JSON.stringify(updatedData)
      );
      setStoredData(updatedData);
    } catch (error) {
      console.error("Error saving data to AsyncStorage:", error);
    }
  };

  const clearData = async () => {
    try {
      await AsyncStorage.removeItem(StorageKeys.BIBLE);
      setStoredData(initialContext);
    } catch (error) {
      console.error("Error clearing data from AsyncStorage:", error);
    }
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
