import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { getDatabaseQueryKey } from "@/constants/databaseNames";
import { QUERY_BY_DB } from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import { useStorage } from "@/context/LocalstoreContext";
import useHistoryManager, { HistoryManager } from "@/hooks/useHistoryManager";
import useParams from "@/hooks/useParams";
import useReadingTime from "@/hooks/useReadTime";
import { HomeParams, IBookVerse, TSubtitle } from "@/types";
import { getChapterTextRaw } from "@/utils/getVerseTextRaw";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useBibleContext } from "./BibleContext";
import { bibleState$, getReadingTime } from "@/state/bibleState";
import { use$ } from "@legendapp/state/react";
import { batch } from "@legendapp/state";

interface BibleChapterContextProps {}

const BibleChapterContext = createContext<BibleChapterContextProps>({});

type IBibleQuery = {
  book: string;
  chapter: number;
  verse: number;
  bottomSideBook: string;
  bottomSideChapter: number;
  bottomSideVerse: number;
  isBibleBottom: boolean;
  isHistory: boolean;
  shouldFetch: boolean;
};

export const BibleChapterProvider = ({ children }: { children: ReactNode }) => {
  const { executeSql, isMyBibleDbLoaded } = useDBContext();
  const { storedData, saveData } = useStorage();

  const isSplitActived = use$(() => bibleState$.isSplitActived.get());
  const bibleQuery = use$(() => bibleState$.bibleQuery.get());
  const shouldFetch = use$(() => bibleState$.bibleQuery.shouldFetch.get());

  const {
    lastBook,
    lastChapter,
    lastVerse,
    lastBottomSideBook,
    lastBottomSideChapter,
    lastBottomSideVerse,
    currentBibleVersion,
  } = storedData;

  const fetchChapter = async () => {
    console.log("🟢 Fetching chapter 🟢");
    const { book, chapter, verse, isBibleBottom } = bibleQuery;
    const loadingKey = isBibleBottom ? "bottom" : "top";
    const targetBook = isBibleBottom ? bibleQuery.bottomSideBook : book;
    const targetChapter = isBibleBottom
      ? bibleQuery.bottomSideChapter
      : chapter;
    const targetVerse = isBibleBottom ? bibleQuery.bottomSideVerse : verse;
    const currentBook = DB_BOOK_NAMES.find((x) => x.longName === targetBook);

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

      console.log(
        `📚 ${targetBook} ${targetChapter}:${targetVerse} in ${executionTime} ms. ${verses.length}`
      );

      batch(() => {
        bibleState$.bibleQuery.isBibleBottom.set(false);
        bibleState$.bibleQuery.shouldFetch.set(false);
        bibleState$.bibleData[`${loadingKey}Verses`].set(verses);
        bibleState$.readingTimeData[loadingKey].set(getReadingTime(verses));
        bibleState$.isDataLoading[loadingKey].set(false);
        console.log("✅ Data Fetched ✅");
      });
    } catch (error) {
      console.error("Error fetching Bible data:", error);
      batch(() => {
        bibleState$.bibleQuery.isBibleBottom.set(false);
        bibleState$.bibleQuery.shouldFetch.set(false);
        bibleState$.isDataLoading[loadingKey].set(false);
      });
    }
  };

  useEffect(() => {
    const isDataLoading = bibleState$.isDataLoading.get();
    // Fix this issue
    if (!isDataLoading.top || !isDataLoading.bottom) {
      const { isBibleBottom, isHistory } = bibleQuery;
      const saveKeyPrefix = isBibleBottom ? "lastBottomSide" : "last";
      const bookValue = isBibleBottom
        ? bibleQuery.bottomSideBook
        : bibleQuery.book;
      const chapterValue = isBibleBottom
        ? bibleQuery.bottomSideChapter
        : bibleQuery.chapter;
      const verseValue = isBibleBottom
        ? bibleQuery.bottomSideVerse
        : bibleQuery.verse;

      // saveData({
      //   [`${saveKeyPrefix}Book`]: bookValue,
      //   [`${saveKeyPrefix}Chapter`]: chapterValue,
      //   [`${saveKeyPrefix}Verse`]: verseValue,
      // });

      // if (!isHistory) {
      //   addToHistory({
      //     book: bookValue,
      //     chapter: chapterValue,
      //     verse: verseValue,
      //     created_at: "",
      //   });
      // }
      // setBibleQuery((prev) => ({ ...prev, isHistory: false }));
    }
  }, []);

  // useEffect(() => {
  //   if (isSplitActived) {
  //     console.log("Fetching bottom verses");
  //     // bibleState$.changeBibleQuery({ isBibleBottom: true, shouldFetch: true });
  //   }
  // }, [isSplitActived]);

  // useEffect(() => {
  //   if (isSplitActived) return;
  //   if (currentHistoryIndex === -1) return;
  //   const currentHistory = getCurrentItem();
  //   if (!currentHistory) return;
  //   // bibleState$.changeBibleQuery({ ...currentHistory, isHistory: true, shouldFetch: true });
  // }, [currentHistoryIndex]);

  useEffect(() => {
    if (!isMyBibleDbLoaded) return;
    if (!bibleQuery.shouldFetch) return;
    fetchChapter();
  }, [shouldFetch, isMyBibleDbLoaded]);

  const contextValue = {};

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
// LOG  🟡 ChangeBibleQuery
// LOG  🔝 BibleTop Component Rendered true
// LOG  🟢 Fetching chapter
// LOG  📚 Mateo 3:1 in 13 ms. 17
// LOG  ✅ Data Fetched ✅
// LOG  🔝 BibleTop Component Rendered false
// LOG  🔄 Chapter Component Rendered 🔝
// LOG  🔝 BibleTop Component Rendered false

// LOG  🟡 ChangeBibleQuery 🟡
// LOG  🏠 HomeScreen Component Rendered
// LOG  🔝 BibleTop Component Rendered 🔄:true 🧮:24 ⌚:3
// LOG  🟢 Fetching chapter 🟢
// LOG  📚 Génesis 8:1 in 24 ms. 22
// LOG  ✅ Data Fetched ✅
// LOG  🏠 HomeScreen Component Rendered
// LOG  🔝 BibleTop Component Rendered 🔄:false 🧮:22 ⌚:3
// LOG  🔄 Chapter Component Rendered 🔝
// LOG  🔝 BibleTop Component Rendered 🔄:false 🧮:22 ⌚:3
