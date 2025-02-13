import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { getDatabaseQueryKey } from "@/constants/databaseNames";
import { QUERY_BY_DB } from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import { useStorage } from "@/context/LocalstoreContext";
import useReadingTime from "@/hooks/useReadTime";
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
import { HomeParams, IBookVerse, TSubtitle } from "@/types";
import useParams from "@/hooks/useParams";
import useHistoryManager, { HistoryManager } from "@/hooks/useHistoryManager";

interface BibleData {
  verses: IBookVerse[];
  subtitles: TSubtitle[];
}

interface BibleChapterContextProps {
  data: BibleData;
  bottomData: BibleData;
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

export const BibleChapterProvider = ({ children }: { children: ReactNode }) => {
  const defaultData = { verses: [], subtitles: [] };
  const [data, setData] = useState<BibleData>(defaultData);
  const [bottomData, setBottomData] = useState<BibleData>(defaultData);
  const params = useParams<HomeParams>();
  const [loading, setLoading] = useState<boolean>(true);
  const { executeSql, isMyBibleDbLoaded } = useDBContext();
  const { storedData, saveData } = useStorage();
  const historyManager = useHistoryManager();
  const { getCurrentItem, add: addToHistory } = historyManager;

  const estimatedReadingTime = useReadingTime({
    text: getChapterTextRaw(data.verses),
  });

  const estimatedReadingTimeBottom = useReadingTime({
    text: getChapterTextRaw(bottomData.verses),
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

  const [bibleQuery, setBibleQuery] = useState<IBibleQuery>({
    book: lastBook || "Génesis",
    chapter: lastChapter || 1,
    verse: lastVerse || 1,
    bottomSideBook: lastBottomSideBook || "Génesis",
    bottomSideChapter: lastBottomSideChapter || 1,
    bottomSideVerse: lastBottomSideVerse || 1,
    isBibleBottom: false,
    isHistory: false,
    shouldFetch: false,
  });

  const updateBibleQuery = (props: Partial<IBibleQuery>) => {
    setBibleQuery((prev) => ({
      ...prev,
      ...props,
    }));
  };

  const fetchChapter = useCallback(async () => {
    const { book, chapter, verse, isBibleBottom } = bibleQuery;
    console.log({ isBibleBottom });
    const targetBook = isBibleBottom ? bibleQuery.bottomSideBook : book;
    const targetChapter = isBibleBottom
      ? bibleQuery.bottomSideChapter
      : chapter;
    const targetVerse = isBibleBottom ? bibleQuery.bottomSideVerse : verse;
    const currentBook = DB_BOOK_NAMES.find((x) => x.longName === targetBook);
    if (highlightedVerses.length) clearHighlights();
    setLoading(true);
    if (isBibleBottom) {
      setBottomData(defaultData);
    } else {
      setData(defaultData);
    }
    setverseInStrongDisplay(0);
    const queryKey = getDatabaseQueryKey(currentBibleVersion);
    const query = QUERY_BY_DB[queryKey];
    const startTime = Date.now();
    try {
      const [verses, subtitles] = await Promise.all([
        executeSql(query.GET_VERSES_BY_BOOK_AND_CHAPTER, [
          currentBook?.bookNumber,
          targetChapter || 1,
        ]),
        executeSql(query.GET_SUBTITLE_BY_BOOK_AND_CHAPTER, [
          currentBook?.bookNumber,
          targetChapter || 1,
        ]),
      ]);
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      console.log(
        `${targetBook} ${targetChapter}:${targetVerse} in ${executionTime} ms.`
      );

      if (isBibleBottom) {
        setBottomData({ verses, subtitles });
      } else {
        setData({ verses, subtitles });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Bible data:", error);
    } finally {
      setLoading(false);
      setBibleQuery((prev) => ({
        ...prev,
        isBibleBottom: false,
        isHistory: false,
        shouldFetch: false,
      }));
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
        });
      }
    }
  }, [loading]);

  useEffect(() => {
    if (isSplitActived) return;
    if (currentHistoryIndex === -1) return;
    const currentHistory = getCurrentItem();
    if (!currentHistory) return;
    updateBibleQuery({ ...currentHistory, isHistory: true });
  }, [currentHistoryIndex]);

  useEffect(() => {
    if (!bibleQuery.shouldFetch) return;
    fetchChapter();
  }, [bibleQuery.shouldFetch]);

  useEffect(() => {
    if (!isMyBibleDbLoaded) return;
    fetchChapter();
  }, [bibleQuery.verse, bibleQuery.bottomSideVerse, isMyBibleDbLoaded]);

  const contextValue = useMemo(
    () => ({
      data,
      bottomData,
      loading,
      estimatedReadingTime,
      fetchChapter,
      updateBibleQuery,
      bibleQuery,
      historyManager,
      estimatedReadingTimeBottom,
    }),
    [data, loading, estimatedReadingTime, bibleQuery, historyManager]
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
