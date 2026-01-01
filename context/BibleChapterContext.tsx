import bibleLinks from "@/constants/bibleLinks";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { QUERY_BY_DB } from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { bibleState$, getReadingTime } from "@/state/bibleState";
import { EBibleVersions, IBookVerse } from "@/types";
import { batch } from "@legendapp/state";
import { use$ } from "@legendapp/state/react";
import React, {
  createContext,
  ReactNode,
  useCallback,
  use,
  useEffect,
  useMemo,
} from "react";
import { useBibleContext } from "./BibleContext";

interface BibleChapterContextProps { }

const BibleChapterContext = createContext<BibleChapterContextProps>({});

const BibleChapterProvider = ({ children }: { children: ReactNode }) => {
  const { allBibleLoaded, getBibleServices } = useDBContext();
  const currentBibleVersion = use$(() => storedData$.currentBibleVersion.get());
  const isSplitActived = use$(() => bibleState$.isSplitActived.get());
  const shouldFetch = use$(() => bibleState$.bibleQuery.shouldFetch.get());
  const {
    historyManager: { add: addToHistory, getCurrentItem },
    currentHistoryIndex,
  } = useBibleContext();

  const fetchChapter = useCallback(async () => {
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
    const currentBook = DB_BOOK_NAMES.find((x) => x.longName === targetBook)!;

    const isInterlinear = [
      EBibleVersions.INTERLINEAR,
      EBibleVersions.GREEK,
    ].includes(currentBibleVersion as EBibleVersions);
    const queryKey = isInterlinear ? EBibleVersions.BIBLE : currentBibleVersion;
    const query = QUERY_BY_DB[queryKey] || QUERY_BY_DB["OTHERS"];
    const NT_BOOK_NUMBER = 470;
    const isNewCovenant = currentBook.bookNumber >= NT_BOOK_NUMBER;
    const { primaryDB, baseDB } = getBibleServices({ isNewCovenant });
    if (!primaryDB) return;
    const dbname = primaryDB.database?.databasePath.split("/").pop();
    const baseDbname =
      baseDB?.database?.databasePath.split("/").pop() || "No base db";

    try {
      let verses: IBookVerse[] = await primaryDB.executeSql<IBookVerse>(
        query.GET_VERSES_BY_BOOK_AND_CHAPTER,
        [currentBook?.bookNumber, targetChapter || 1],
        "verses"
      );

      let interlinearVerses: IBookVerse[] = [];

      if (baseDB) {
        const baseQuery =
          QUERY_BY_DB[baseDbname.replace(".db", "")] || QUERY_BY_DB["OTHERS"];

        interlinearVerses = await baseDB.executeSql<IBookVerse>(
          baseQuery.GET_VERSES_BY_BOOK_AND_CHAPTER,
          [currentBook?.bookNumber, targetChapter || 1],
          "interlinearVerses"
        );
      }

      const links = bibleLinks.filter(
        (link) =>
          link?.book_number === currentBook?.bookNumber &&
          link?.chapter === targetChapter
      );

      batch(() => {
        storedData$[`${storageKey}Book`].set(targetBook);
        storedData$[`${storageKey}Chapter`].set(targetChapter);
        storedData$[`${storageKey}Verse`].set(targetVerse);
        bibleState$.bibleData.interlinearVerses.set(interlinearVerses);
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
        console.log("✅");
      });
    } catch (error) {
      console.error("Error fetching Bible data:", error);
      batch(() => {
        bibleState$.bibleQuery.isBibleBottom.set(false);
        bibleState$.bibleQuery.shouldFetch.set(false);
        bibleState$.isDataLoading[bibleKey].set(false);
      });
    }
  }, [getBibleServices, allBibleLoaded]);

  useEffect(() => {
    if (isSplitActived) return;
    if (currentHistoryIndex === -1) return;
    const currentHistory = getCurrentItem();
    if (!currentHistory) return;
    bibleState$.changeBibleQuery({
      ...currentHistory,
      isHistory: true,
      shouldFetch: true,
    });
  }, [currentHistoryIndex]);

  useEffect(() => {
    if (!allBibleLoaded) return;
    if (!shouldFetch) return;
    fetchChapter();
  }, [shouldFetch, allBibleLoaded]);

  const contextValue = useMemo(() => ({}), []);
  return (
    <BibleChapterContext.Provider value={contextValue}>
      {children}
    </BibleChapterContext.Provider>
  );
};

export const useBibleChapter = () => {
  const context = use(BibleChapterContext);
  if (!context) {
    throw new Error(
      "useBibleChapter must be used within a BibleChapterProvider"
    );
  }
  return context;
};

export default BibleChapterProvider;
