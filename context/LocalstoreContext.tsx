import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageKeys } from "constants/StorageKeys";
import { EThemes, TFont, EBibleVersions } from "types";

type StoreState = {
  lastBook: string;
  lastChapter: number;
  currentTheme: keyof typeof EThemes;
  fontSize: number;
  selectedFont: string;
  isDarkMode: boolean;
  currentBibleVersion: string;
};

interface StorageContextProps {
  storedData: StoreState;
  saveData: (data: StoreState | {}) => void;
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
  currentTheme: "Blue",
  fontSize: 24,
  selectedFont: TFont.Roboto,
  isDarkMode: true,
  currentBibleVersion: EBibleVersions.RVR60,
};

const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
  const [storedData, setStoredData] = useState<StoreState>(initialContext);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem(StorageKeys.BIBLE);
        if (data) {
          setStoredData(JSON.parse(data));
        }
      } catch (error) {
        console.error("Error loading data from AsyncStorage:", error);
      }
    };

    (async () => {
      await loadData();
      setDataLoaded(true);
    })();

    return () => {
      setDataLoaded(false);
    };
  }, []);

  const saveData = async (data: StoreState | {}) => {
    try {
      const myData = {
        ...storedData,
        ...data,
      };
      await AsyncStorage.setItem(StorageKeys.BIBLE, JSON.stringify(myData));
      setStoredData(myData);
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
      value={{ storedData, saveData, clearData, isDataLoaded: dataLoaded }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export default StorageProvider;
