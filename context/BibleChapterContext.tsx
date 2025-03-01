import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { getDatabaseQueryKey } from "@/constants/databaseNames";
import { QUERY_BY_DB } from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import { storedData$, useStorage } from "@/context/LocalstoreContext";
import { bibleState$, getReadingTime } from "@/state/bibleState";
import { IBookVerse } from "@/types";
import { batch, observable } from "@legendapp/state";
import { use$ } from "@legendapp/state/react";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useBibleContext } from "./BibleContext";
import { historyState$ } from "@/state/historyState";

interface BibleChapterContextProps {}

const BibleChapterContext = createContext<BibleChapterContextProps>({});
interface PersistChapterDataParams {
  targetBook: string;
  targetChapter: number;
  targetVerse: number;
  isBibleBottom: boolean;
  isHistory: boolean;
}

const BibleChapterProvider = ({ children }: { children: ReactNode }) => {
  const { executeSql, isMyBibleDbLoaded, myBibleDB } = useDBContext();

  const currentBibleVersion = use$(() => storedData$.currentBibleVersion.get());
  const shouldFetch = use$(() => bibleState$.bibleQuery.shouldFetch.get());
  const currentItem = historyState$.getCurrentItem();

  // console.log(
  //   `🥳 BibleChapterProvider 🥳 sf:${shouldFetch}`,
  //   currentBibleVersion
  // );

  const addHistoryItem = (book: string, chapter: number, verse: number) => {
    historyState$.addToHistory({ book, chapter, verse });
  };

  const fetchChapter = async () => {
    const bibleQuery = bibleState$.bibleQuery.get();
    const {
      book: book,
      chapter: chapter,
      verse: verse,
      isBibleBottom,
      isHistory,
    } = bibleQuery;
    const bibleKey = isBibleBottom ? "bottom" : "top";
    const storageKey = isBibleBottom ? "lastBottomSide" : "last";
    const targetBook = isBibleBottom ? bibleQuery.bottomSideBook : book;
    const targetChapter = isBibleBottom
      ? bibleQuery.bottomSideChapter
      : chapter;
    const targetVerse = isBibleBottom ? bibleQuery.bottomSideVerse : verse;
    const currentBook = DB_BOOK_NAMES.find((x) => x.longName === targetBook);
    console.log(
      `🟢 Fetching chapter 🟢 ${targetBook} ${targetChapter}:${targetVerse}`
    );

    const queryKey = getDatabaseQueryKey(currentBibleVersion);
    const query = QUERY_BY_DB[queryKey];
    const startTime = Date.now();
    try {
      const verses = await executeSql<IBookVerse>(
        query.GET_VERSES_BY_BOOK_AND_CHAPTER,
        [currentBook?.bookNumber, targetChapter || 1],
        "verses"
      );

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // console.log(
      //   `📚 ${targetBook} ${targetChapter}:${targetVerse} in ${executionTime} ms. ${verses.length}`
      // );

      batch(() => {
        storedData$[`${storageKey}Book`].set(targetBook);
        storedData$[`${storageKey}Chapter`].set(targetChapter);
        storedData$[`${storageKey}Verse`].set(targetVerse);
        bibleState$.bibleData[`${bibleKey}Verses`].set(verses);
        bibleState$.readingTimeData[bibleKey].set(getReadingTime(verses));
        bibleState$.isDataLoading[bibleKey].set(false);
        bibleState$.bibleQuery.shouldFetch.set(false);
        addHistoryItem(targetBook, targetChapter, targetVerse);
        console.log("✅✅✅✅✅✅✅✅✅");
      });
    } catch (error) {
      console.error("Error fetching Bible data:", error);
      batch(() => {
        bibleState$.bibleQuery.isBibleBottom.set(false);
        bibleState$.bibleQuery.shouldFetch.set(false);
        bibleState$.isDataLoading[bibleKey].set(false);
      });
    }
  };

  useEffect(() => {
    if (!isMyBibleDbLoaded) return;
    if (!shouldFetch) return;
    fetchChapter();
  }, [shouldFetch, isMyBibleDbLoaded]);

  const contextValue = useMemo(() => ({}), []);
  return (
    <BibleChapterContext.Provider value={contextValue}>
      {children}
    </BibleChapterContext.Provider>
  );
};

export const useBibleChapter = () => {
  const context = useContext(BibleChapterContext);
  if (!context) {
    throw new Error(
      "useBibleChapter must be used within a BibleChapterProvider"
    );
  }
  return context;
};

export default BibleChapterProvider;
