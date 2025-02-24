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
import { bibleState$ } from "@/state/bibleState";

interface BibleChapterContextProps {
  verses: IBookVerse[];
  bottomVerses: IBookVerse[];
  loading: {
    top: boolean;
    bottom: boolean;
  };
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
  const defaultData = { verses: [] };
  const [verses, setVerses] = useState<IBookVerse[]>([]);
  const [bottomVerses, setBottomVerses] = useState<IBookVerse[]>([]);
  const [loading, setLoading] = useState({
    top: false,
    bottom: false,
  });
  const { executeSql, isMyBibleDbLoaded } = useDBContext();
  const { storedData, saveData } = useStorage();
  const historyManager = useHistoryManager();
  const { getCurrentItem, add: addToHistory } = historyManager;

  const estimatedReadingTime = useReadingTime({
    text: getChapterTextRaw(verses),
  });

  const estimatedReadingTimeBottom = useReadingTime({
    text: getChapterTextRaw(bottomVerses),
  });

  const {
    // setverseInStrongDisplay,
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
    shouldFetch: true,
  });

  const updateBibleQuery = useCallback((props: Partial<IBibleQuery>) => {
    const loadingKey = props.isBibleBottom ? "bottom" : "top";
    setLoading((prev) => ({ ...prev, [loadingKey]: true }));
    setBibleQuery((prev) => ({ ...prev, ...props }));
  }, []);

  const fetchChapter = useCallback(async () => {
    const { book, chapter, verse, isBibleBottom } = bibleQuery;
    const loadingKey = isBibleBottom ? "bottom" : "top";
    const targetBook = isBibleBottom ? bibleQuery.bottomSideBook : book;
    const targetChapter = isBibleBottom
      ? bibleQuery.bottomSideChapter
      : chapter;
    const targetVerse = isBibleBottom ? bibleQuery.bottomSideVerse : verse;
    const currentBook = DB_BOOK_NAMES.find((x) => x.longName === targetBook);
    setLoading((prev) => ({ ...prev, [loadingKey]: true }));

    // setverseInStrongDisplay(0);
    bibleState$.currentVerse.set(0);
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
      // 📖📚🧾
      console.log(
        `📚 ${targetBook} ${targetChapter}:${targetVerse} in ${executionTime} ms.`
      );

      isBibleBottom ? setBottomVerses(verses) : setVerses(verses);

      setBibleQuery((prev) => ({
        ...prev,
        isBibleBottom: false,
        shouldFetch: false,
      }));
      setLoading((prev) => ({ ...prev, [loadingKey]: false }));
    } catch (error) {
      console.error("Error fetching Bible data:", error);
      setLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  }, [bibleQuery, executeSql]);

  useEffect(() => {
    // Fix this issue
    if (!loading.top || !loading.bottom) {
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
    if (!bibleQuery.shouldFetch) return;
    fetchChapter();
  }, [bibleQuery.shouldFetch, isMyBibleDbLoaded]);

  const memoizedVerses = useMemo(() => verses, [verses]);
  const memoizedBottomVerses = useMemo(() => bottomVerses, [bottomVerses]);
  const memoizedQuery = useMemo(() => bibleQuery, [bibleQuery]);

  const contextValue = useMemo(
    () => ({
      verses: memoizedVerses,
      bottomVerses: memoizedBottomVerses,
      loading,
      estimatedReadingTime,
      fetchChapter,
      updateBibleQuery,
      bibleQuery: memoizedQuery,
      historyManager,
      estimatedReadingTimeBottom,
    }),
    [
      memoizedVerses,
      memoizedBottomVerses,
      loading,
      estimatedReadingTime,
      memoizedQuery,
    ]
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
