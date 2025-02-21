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
import { observable } from "@legendapp/state";
import { use$ } from "@legendapp/state/react";

interface BibleData {
  verses: IBookVerse[];
}

interface BibleChapterContextProps {
  verses: IBookVerse[];
  bottomVerses: IBookVerse[];
  loading: boolean;
  estimatedReadingTime: number;
  estimatedReadingTimeBottom: number;
  fetchChapter: () => void;
  updateBibleQuery: (props: Partial<IBibleQuery>) => void;
  bibleQuery: IBibleQuery;
  historyManager: HistoryManager;
}

const BibleChapterContext = createContext<BibleChapterContextProps | undefined>(
  undefined
);

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

export interface IBibleState {
  verses: IBookVerse[];
  bottomVerses: IBookVerse[];
  loading: boolean;
  bibleQuery: IBibleQuery;
}

export const bibleState = observable<IBibleState>({
  verses: [] as IBookVerse[],
  bottomVerses: [] as IBookVerse[],
  loading: false,
  bibleQuery: {
    book: "Génesis",
    chapter: 1,
    verse: 1,
    bottomSideBook: "Génesis",
    bottomSideChapter: 1,
    bottomSideVerse: 1,
    isBibleBottom: false,
    isHistory: false,
    shouldFetch: true,
  },
});

export const selectVerses = () => use$(bibleState.verses);
export const selectBottomVerses = () => use$(bibleState.bottomVerses);
export const selectLoading = () => use$(bibleState.loading);
export const selectBibleQuery = () => use$(bibleState.bibleQuery);

export const BibleChapterProvider = ({ children }: { children: ReactNode }) => {
  const { executeSql, isMyBibleDbLoaded } = useDBContext();
  const { storedData, saveData } = useStorage();
  const historyManager = useHistoryManager();
  const { getCurrentItem, add: addToHistory } = historyManager;

  const loading = selectLoading();
  const bibleQuery = selectBibleQuery();
  const verses = selectVerses();
  const bottomVerses = selectBottomVerses();

  const estimatedReadingTime = useReadingTime({
    text: getChapterTextRaw(verses),
  });

  const estimatedReadingTimeBottom = useReadingTime({
    text: getChapterTextRaw(bottomVerses),
  });

  const {
    setverseInStrongDisplay,
    highlightedVerses,
    clearHighlights,
    isSplitActived,
    currentHistoryIndex,
  } = useBibleContext();

  const {
    lastBook,
    lastChapter,
    lastVerse,
    lastBottomSideBook,
    lastBottomSideChapter,
    lastBottomSideVerse,
    currentBibleVersion,
  } = storedData;

  const shouldFetch = use$(bibleState.bibleQuery.shouldFetch);

  const updateBibleQuery = useCallback((props: Partial<IBibleQuery>) => {
    bibleState.bibleQuery.set((prev) => ({ ...prev, ...props }));
  }, []);

  const fetchChapter = useCallback(async () => {
    const { book, chapter, verse, isBibleBottom } = bibleQuery;
    const targetBook = isBibleBottom ? bibleQuery.bottomSideBook : book;
    const targetChapter = isBibleBottom
      ? bibleQuery.bottomSideChapter
      : chapter;
    const targetVerse = isBibleBottom ? bibleQuery.bottomSideVerse : verse;
    const currentBook = DB_BOOK_NAMES.find((x) => x.longName === targetBook);
    // if (highlightedVerses.length) clearHighlights();
    bibleState.loading.set(true);
    // if (isBibleBottom) {
    //   bibleState.bottomVerses.set([]);
    // } else {
    //   bibleState.verses.set([]);
    // }
    setverseInStrongDisplay(0);
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
        `${targetBook} ${targetChapter}:${targetVerse} in ${executionTime} ms.`
      );

      if (isBibleBottom) {
        bibleState.bottomVerses.set(verses);
      } else {
        bibleState.verses.set(verses);
      }
      bibleState.loading.set(false);
    } catch (error) {
      console.error("Error fetching Bible data:", error);
    } finally {
      bibleState.bibleQuery.shouldFetch.set(() => false);
    }
  }, [bibleQuery, executeSql]);

  useEffect(() => {
    if (!loading) {
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

      saveData({
        [`${saveKeyPrefix}Book`]: bookValue,
        [`${saveKeyPrefix}Chapter`]: chapterValue,
        [`${saveKeyPrefix}Verse`]: verseValue,
      });

      if (!isHistory) {
        addToHistory({
          book: bookValue,
          chapter: chapterValue,
          verse: verseValue,
          created_at: "",
        });
      }
    }
  }, [loading]);

  useEffect(() => {
    if (isSplitActived) {
      updateBibleQuery({ isBibleBottom: true, shouldFetch: true });
    }
  }, [isSplitActived]);

  useEffect(() => {
    if (isSplitActived) return;
    if (currentHistoryIndex === -1) return;
    const currentHistory = getCurrentItem();
    if (!currentHistory) return;
    updateBibleQuery({ ...currentHistory, isHistory: true, shouldFetch: true });
  }, [currentHistoryIndex]);

  useEffect(() => {
    if (!isMyBibleDbLoaded) return;
    if (!shouldFetch) return;
    fetchChapter();
  }, [shouldFetch, isMyBibleDbLoaded]);

  const contextValue = useMemo(
    () => ({
      verses,
      bottomVerses,
      loading,
      estimatedReadingTime,
      fetchChapter,
      updateBibleQuery,
      bibleQuery,
      historyManager,
      estimatedReadingTimeBottom,
    }),
    [verses, bottomVerses, loading, estimatedReadingTime, bibleQuery]
  );

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
