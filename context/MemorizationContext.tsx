import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useDBContext } from "./databaseContext";
import {
  DELETE_VERSE_FROM_MOMORIZATION,
  GET_ALL_MOMORIZATION,
  INSERT_VERSE_TO_MOMORIZATION,
  UPDATE_MOMORIZATION_PROGRESS,
} from "@/constants/Queries";
import { showToast } from "@/utils/showToast";

type Memorization = {
  id: number;
  verse: string;
  version: string;
  progress: number;
  lastPracticed: number;
  addedDate: number;
};

type MemorizationContextType = {
  verses: Memorization[];
  addVerse: (verse: string, version: string) => void;
  deleteVerse: (id: number) => void;
  updateProgress: (id: number, progress: number) => void;
  refreshVerses: () => void;
};

const MemorizationContext = createContext<MemorizationContextType | undefined>(
  undefined
);

export const MemorizationProvider = ({ children }: { children: ReactNode }) => {
  const [verses, setVerses] = useState<Memorization[]>([]);
  const { myBibleDB, executeSql } = useDBContext();

  // useEffect(() => {
  //   if (!myBibleDB || !executeSql) return;
  //   refreshVerses();
  // }, [myBibleDB, executeSql]);

  const refreshVerses = async () => {
    try {
      if (!myBibleDB || !executeSql) return;
      const data = await executeSql(GET_ALL_MOMORIZATION, []);
      setVerses(renameLongBookName(data as any));
    } catch (error) {
      console.warn("Error refreshVerses:", error);
    }
  };

  const addVerse = async (verse: string, version: string) => {
    try {
      if (!myBibleDB || !executeSql) return;
      const values = [verse, version, 0];
      await executeSql(INSERT_VERSE_TO_MOMORIZATION, values);
      await refreshVerses();
      showToast("Versículo añadido con éxito!");
    } catch (error) {
      console.warn("Error inserting verse:", error);
    }
  };

  const deleteVerse = async (id: number) => {
    try {
      if (!myBibleDB || !executeSql) return;
      const values = [id];
      await executeSql(DELETE_VERSE_FROM_MOMORIZATION, values);
      await refreshVerses();
      showToast("Versículo eliminado con éxito!");
    } catch (error) {
      console.warn("Error deleting verse:", error);
    }
  };

  const updateProgress = async (id: number, progress: number) => {
    const timestamp = Date.now();
    try {
      if (!myBibleDB || !executeSql) return;
      const values = [progress, timestamp, id];
      await executeSql(UPDATE_MOMORIZATION_PROGRESS, values);
      refreshVerses();
    } catch (error) {
      console.warn("Error updating progress:", error);
    }
  };

  const renameLongBookName = (verses: Memorization[]) => {
    return verses.map((verse) => {
      const currentVerseName = verse.verse.replace(
        /^(Hechos de los Apóstoles|Apocalipsis \(de Juan\))/,
        (match) => {
          return match.includes("Hechos") ? "Hechos" : "Apocalipsis";
        }
      );
      verse.verse = currentVerseName;
      return verse;
    });
  };

  return (
    <MemorizationContext.Provider
      value={{
        verses,
        addVerse,
        deleteVerse,
        updateProgress,
        refreshVerses,
      }}
    >
      {children}
    </MemorizationContext.Provider>
  );
};

export const useMemorization = () => {
  const context = useContext(MemorizationContext);
  if (!context) {
    throw new Error(
      "useMemorization must be used within a MemorizationProvider"
    );
  }
  return context;
};
