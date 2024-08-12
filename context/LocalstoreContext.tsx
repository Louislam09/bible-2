import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeys } from "constants/StorageKeys";
import useHistoryManager, {
  HistoryItem,
  HistoryManager,
} from "hooks/useHistoryManager";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { EBibleVersions, EThemes, TFont } from "types";

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
  songFontSize: number;
  history: HistoryItem[];
};

interface StorageContextProps {
  storedData: StoreState;
  saveData: (data: Partial<StoreState>) => Promise<void>;
  clearData: () => void;
  isDataLoaded: boolean;
  historyManager: HistoryManager;
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
  currentTheme: "Blue",
  fontSize: 24,
  selectedFont: TFont.Roboto,
  isDarkMode: true,
  currentBibleVersion: EBibleVersions.BIBLE,
  isSongLyricEnabled: false,
  songFontSize: 21,
  history: [],
};

const isArrEqual = (arr1: any[], arr2: any[]) => {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
};

const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
  const [storedData, setStoredData] = useState<StoreState>(initialContext);
  const [dataLoaded, setDataLoaded] = useState(false);
  const historyManager = useHistoryManager(15);
  const { history, isHistoryInitialized } = historyManager;

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem(StorageKeys.BIBLE);
        if (data) {
          const parsedData = JSON.parse(data) as StoreState;
          setStoredData(parsedData);
          historyManager.initializeHistory(parsedData?.history || []);
        }
      } catch (error) {
        console.error("Error loading data from AsyncStorage:", error);
      } finally {
        setDataLoaded(true);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const shouldSave =
      isHistoryInitialized && !isArrEqual(history, storedData.history);
    if (shouldSave) {
      saveData({ history: [...history] });
    }
  }, [isHistoryInitialized, history]);

  const saveData = async (data: Partial<StoreState>) => {
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
      historyManager.clear();
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
        historyManager,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export default StorageProvider;
