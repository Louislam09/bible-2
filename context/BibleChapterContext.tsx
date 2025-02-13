import { DB_BOOK_NAMES } from '@/constants/BookNames';
import { getDatabaseQueryKey } from '@/constants/databaseNames';
import { QUERY_BY_DB } from '@/constants/Queries';
import { useDBContext } from '@/context/databaseContext';
import { useStorage } from '@/context/LocalstoreContext';
import useReadingTime from '@/hooks/useReadTime';
import { getChapterTextRaw } from '@/utils/getVerseTextRaw';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useBibleContext } from './BibleContext';
import { HomeParams, IBookVerse, TSubtitle } from '@/types';
import useParams from '@/hooks/useParams';
import useHistoryManager, { HistoryManager } from '@/hooks/useHistoryManager';

interface BibleData {
  verses: IBookVerse[];
  subtitles: TSubtitle[];
}

interface BibleChapterContextProps {
  data: BibleData;
  loading: boolean;
  estimatedReadingTime: number;
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
  lastBottomSideBook: string;
  lastBottomSideChapter: number;
  lastBottomSideVerse: number;
  isBibleBottom: boolean;
  isHistory: boolean;
  shouldFetch: boolean;
};

export const BibleChapterProvider = ({ children }: { children: ReactNode }) => {
  const defaultData = { verses: [], subtitles: [] };
  const [data, setData] = useState<BibleData>(defaultData);
  const params = useParams<HomeParams>();
  const [loading, setLoading] = useState<boolean>(true);
  const { executeSql, isMyBibleDbLoaded } = useDBContext();
  const { storedData, saveData } = useStorage();
  const historyManager = useHistoryManager();
  const { getCurrentItem, add: addToHistory } = historyManager;
  const estimatedReadingTime = useReadingTime({
    text: getChapterTextRaw(data.verses),
  });

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
    book: lastBook || 'Génesis',
    chapter: lastChapter || 1,
    verse: lastVerse || 1,
    lastBottomSideBook: lastBottomSideBook || 'Génesis',
    lastBottomSideChapter: lastBottomSideChapter || 1,
    lastBottomSideVerse: lastBottomSideVerse || 1,
    isBibleBottom: false,
    isHistory: false,
    shouldFetch: false,
  });

  const {
    setverseInStrongDisplay,
    highlightedVerses,
    clearHighlights,
    isSplitActived,
    currentHistoryIndex,
  } = useBibleContext();

  const updateBibleQuery = (props: Partial<IBibleQuery>) => {
    // console.log('updateBibleQuery - shouldFetch', props.shouldFetch);
    setBibleQuery((prev) => ({
      ...prev,
      isBibleBottom: false,
      isHistory: false,
      shouldFetch: false,
      ...props,
    }));
  };

  const fetchChapter = useCallback(async () => {
    const { book, chapter, verse, isHistory } = bibleQuery;
    const currentBook = DB_BOOK_NAMES.find((x) => x.longName === book);
    if (highlightedVerses.length) clearHighlights();
    setLoading(true);
    setData(defaultData);
    setverseInStrongDisplay(0);
    const queryKey = getDatabaseQueryKey(currentBibleVersion);
    const query = QUERY_BY_DB[queryKey];
    const startTime = Date.now();
    try {
      const [verses, subtitles] = await Promise.all([
        executeSql(query.GET_VERSES_BY_BOOK_AND_CHAPTER, [
          currentBook?.bookNumber,
          chapter || 1,
        ]),
        executeSql(query.GET_SUBTITLE_BY_BOOK_AND_CHAPTER, [
          currentBook?.bookNumber,
          chapter || 1,
        ]),
      ]);
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      console.log(`${book} ${chapter}:${verse} in ${executionTime} ms.`);
      setData({ verses, subtitles });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Bible data:', error);
    } finally {
      setLoading(false);
      setBibleQuery((prev) => ({ ...prev, shouldFetch: false }));
    }
  }, [bibleQuery, executeSql]);

  useEffect(() => {
    if (!loading) {
      const { isBibleBottom, isHistory } = bibleQuery;
      const saveKeyPrefix = isBibleBottom ? 'lastBottomSide' : 'last';
      const bookValue = isBibleBottom
        ? bibleQuery.lastBottomSideBook
        : bibleQuery.book;
      const chapterValue = isBibleBottom
        ? bibleQuery.lastBottomSideChapter
        : bibleQuery.chapter;
      const verseValue = isBibleBottom
        ? bibleQuery.lastBottomSideVerse
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

  // useEffect(() => {
  //   const dontFetch =
  //     bibleQuery.book === params.book && params.chapter === bibleQuery.chapter;
  //   if (dontFetch) return;
  //   updateBibleQuery(params as any);
  // }, [params.book, params.chapter]);

  useEffect(() => {
    console.log('shouldFetch', bibleQuery.shouldFetch);
    if (!bibleQuery.shouldFetch) return;
    fetchChapter();
  }, [bibleQuery.shouldFetch]);

  useEffect(() => {
    if (!isMyBibleDbLoaded) return;
    fetchChapter();
  }, [bibleQuery.verse, isMyBibleDbLoaded]);

  const contextValue = useMemo(
    () => ({
      data,
      loading,
      estimatedReadingTime,
      fetchChapter,
      updateBibleQuery,
      bibleQuery,
      historyManager,
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
      'useBibleChapter must be used within a BibleChapterProvider'
    );
  }
  return context;
};
