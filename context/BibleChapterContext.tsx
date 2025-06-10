import bibleLinks from "@/constants/bibleLinks";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { getDatabaseQueryKey } from "@/constants/databaseNames";
import { QUERY_BY_DB } from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { bibleState$, getReadingTime } from "@/state/bibleState";
import { IBookVerse } from "@/types";
import { batch } from "@legendapp/state";
import { use$ } from "@legendapp/state/react";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useBibleContext } from "./BibleContext";

interface BibleChapterContextProps { }

const BibleChapterContext = createContext<BibleChapterContextProps>({});

const BibleChapterProvider = ({ children }: { children: ReactNode }) => {
  const { executeSql, isMyBibleDbLoaded } = useDBContext();

  const currentBibleVersion = use$(() => storedData$.currentBibleVersion.get());
  const isSplitActived = use$(() => bibleState$.isSplitActived.get());
  const shouldFetch = use$(() => bibleState$.bibleQuery.shouldFetch.get());
  const {
    historyManager: { add: addToHistory, getCurrentItem },
    currentHistoryIndex,
  } = useBibleContext();

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
    // console.log(
    //   `🟢 Fetching chapter 🟢 ${targetBook} ${targetChapter}:${targetVerse}`
    // );

    const queryKey = getDatabaseQueryKey(currentBibleVersion);
    const query = QUERY_BY_DB[queryKey];
    const startTime = Date.now();
    try {
      const verses = await executeSql<IBookVerse>(
        query.GET_VERSES_BY_BOOK_AND_CHAPTER,
        [currentBook?.bookNumber, targetChapter || 1],
        "verses"
      );
      const links = bibleLinks.filter((link) => link.book_number === currentBook?.bookNumber && link.chapter === targetChapter);

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
        bibleState$.bibleData[`${bibleKey}Links`].set(links);
        bibleState$.readingTimeData[bibleKey].set(getReadingTime(verses));
        bibleState$.isDataLoading[bibleKey].set(false);
        bibleState$.bibleQuery.shouldFetch.set(false);
        if (!isHistory)
          addToHistory({
            book: targetBook,
            chapter: targetChapter,
            verse: targetVerse,
            created_at: "",
          });
        // console.log("✅✅✅✅✅✅✅✅✅");
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
    if (isSplitActived) return;
    if (currentHistoryIndex === -1) return;
    console.log("searching history");
    const currentHistory = getCurrentItem();
    if (!currentHistory) return;
    bibleState$.changeBibleQuery({
      ...currentHistory,
      isHistory: true,
      shouldFetch: true,
    });
  }, [currentHistoryIndex]);

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
