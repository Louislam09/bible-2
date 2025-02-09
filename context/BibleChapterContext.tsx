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

interface BibleData {
  verses?: any[];
  subtitles?: any[];
}

interface fetchChapterProps {
  isHistory?: boolean;
  isSplit?: boolean;
}

interface BibleChapterContextProps {
  data: BibleData | any;
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
};

export const BibleChapterProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<BibleData>({});
  const [chapterText, setChapterText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { myBibleDB, executeSql , isMyBibleDbLoaded } = useDBContext();
  const { storedData, saveData, historyManager } = useStorage();
  const estimatedReadingTime = useReadingTime({ text: chapterText });
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
  });

  const {
    setverseInStrongDisplay,
    setChapterLengthNumber,
    setChapterVerses,
    highlightedVerses,
    clearHighlights,
  } = useBibleContext();

  const updateBibleQuery = (props: Partial<IBibleQuery>) => {
    setBibleQuery((prev) => ({ ...prev, ...props }));
  };

  const fetchChapter = async ({
    isHistory = false,
    isSplit = false,
  }: fetchChapterProps) => {
    const { book, chapter, verse } = bibleQuery as any;
    // if (book) return;
    const currentBook = DB_BOOK_NAMES.find((x) => x.longName === book);
    if (highlightedVerses.length) clearHighlights();
    setLoading(true);
    if (!myBibleDB || !executeSql) return;
    setData({});
    setverseInStrongDisplay(0);
    const queryKey = getDatabaseQueryKey(currentBibleVersion);
    const query = QUERY_BY_DB[queryKey];

    try {
      const [verses, subtitles] = await Promise.all([
        executeSql(myBibleDB, query.GET_VERSES_BY_BOOK_AND_CHAPTER, [
          currentBook?.bookNumber,
          chapter || 1,
        ]),
        executeSql(myBibleDB, query.GET_SUBTITLE_BY_BOOK_AND_CHAPTER, [
          currentBook?.bookNumber,
          chapter || 1,
        ]),
      ]);
      setData({ verses, subtitles });
      setChapterVerses(verses as any);
      setChapterLengthNumber(verses?.length || 0);
      setChapterText(getChapterTextRaw(verses as any));

      if (!isHistory) {
        historyManager.add({ book, verse, chapter });
      }

      await saveData({
        [isSplit ? 'lastBottomSideBook' : 'lastBook']: book,
        [isSplit ? 'lastBottomSideChapter' : 'lastChapter']: chapter,
        [isSplit ? 'lastBottomSideVerse' : 'lastVerse']: verse,
      });
    } catch (error) {
      console.error('Error fetching Bible data:', error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isMyBibleDbLoaded) return;
    fetchChapter({});
  }, [bibleQuery.verse, isMyBibleDbLoaded]);

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
