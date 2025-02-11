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
  useContext,
  useEffect,
  useState,
} from 'react';
import { useBibleContext } from './BibleContext';
import { HomeParams, IBookVerse, TSubtitle } from '@/types';
import useParams from '@/hooks/useParams';

interface BibleData {
  verses: IBookVerse[];
  subtitles: TSubtitle[];
}

interface fetchChapterProps {
  isHistory?: boolean;
  isSplit?: boolean;
}

interface BibleChapterContextProps {
  data: BibleData;
  loading: boolean;
  estimatedReadingTime: number;
  fetchChapter: (props: fetchChapterProps) => void;
  updateBibleQuery: (props: Partial<IBibleQuery>) => void;
  bibleQuery: IBibleQuery;
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
};

export const BibleChapterProvider = ({ children }: { children: ReactNode }) => {
  const defaultData = { verses: [], subtitles: [] };
  const [data, setData] = useState<BibleData>(defaultData);
  const params = useParams<HomeParams>();
  const [loading, setLoading] = useState<boolean>(true);
  const { executeSql, isMyBibleDbLoaded } = useDBContext();
  const { storedData, saveData, historyManager } = useStorage();
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

  const {
    book: lastHistoryBook,
    chapter: lastHistoryChapter,
    verse: lastHistoryVerse,
  } = (historyManager.getCurrentItem() as any) || {};

  const [bibleQuery, setBibleQuery] = useState<IBibleQuery>({
    book: lastHistoryBook || lastBook || 'Génesis',
    chapter: lastHistoryChapter || lastChapter || 1,
    verse: lastHistoryVerse || lastVerse || 1,
    lastBottomSideBook,
    lastBottomSideChapter,
    lastBottomSideVerse,
    isBibleBottom: false,
  });

  const { setverseInStrongDisplay, highlightedVerses, clearHighlights } =
    useBibleContext();

  const updateBibleQuery = (props: Partial<IBibleQuery>) => {
    setBibleQuery((prev) => ({ ...prev, ...props }));
  };

  const fetchChapter = async ({ isHistory = false }: fetchChapterProps) => {
    const { book, chapter, verse } = bibleQuery;
    const currentBook = DB_BOOK_NAMES.find((x) => x.longName === book);
    if (highlightedVerses.length) clearHighlights();
    setLoading(true);
    setData(defaultData);
    setverseInStrongDisplay(0);
    const queryKey = getDatabaseQueryKey(currentBibleVersion);
    const query = QUERY_BY_DB[queryKey];
    const startTime = Date.now(); // Start timing
    try {
      console.log(`${book} ${chapter}:${verse}`);
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
      const endTime = Date.now(); // End timing
      const executionTime = endTime - startTime;
      console.log(`${book} ${chapter}:${verse} in ${executionTime}ms.`);
      setData({ verses, subtitles });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Bible data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      console.log('Saving...');
      const { isBibleBottom } = bibleQuery;
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

      // if (!isHistory) {
      //   addToHistory({ book, verse, chapter });
      // }
    }
  }, [loading]);

  useEffect(() => {
    const dontFetch =
      bibleQuery.book === params.book && params.chapter === bibleQuery.chapter;
    if (dontFetch) return;
    updateBibleQuery(params as any);
  }, [params.book, params.chapter]);

  useEffect(() => {
    console.log('current len: ', data.verses.length);
    if (!isMyBibleDbLoaded) return;
    fetchChapter({});
    return () => {
      console.log('unmounting hook');
    };
  }, [bibleQuery, isMyBibleDbLoaded]);

  return (
    <BibleChapterContext.Provider
      value={{
        data,
        loading,
        estimatedReadingTime,
        fetchChapter,
        updateBibleQuery,
        bibleQuery,
      }}
    >
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
