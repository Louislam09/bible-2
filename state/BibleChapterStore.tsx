import { observable, ObservableObject } from "@legendapp/state";
import { enableReactTracking } from "@legendapp/state/config/enableReactTracking";
import { observer } from "@legendapp/state/react";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { getDatabaseQueryKey } from "@/constants/databaseNames";
import { QUERY_BY_DB } from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import { useStorage } from "@/context/LocalstoreContext";
import useHistoryManager, { HistoryManager } from "@/hooks/useHistoryManager";
import useReadingTime from "@/hooks/useReadTime";
import { IBookVerse } from "@/types";
import { getChapterTextRaw } from "@/utils/getVerseTextRaw";

// Enable React tracking for Legend State
enableReactTracking({
  auto: true,
});

// Types
export interface IVerse {
  id: number;
  book_number: number;
  chapter: number;
  verse: number;
  text: string;
  subheading?: string;
}

export interface IHistoryItem {
  book: string;
  chapter: number;
  verse: number;
  created_at: string;
}

export interface BibleData {
  verses: IBookVerse[];
}

export interface IBibleQuery {
  book: string;
  chapter: number;
  verse: number;
  bottomSideBook: string;
  bottomSideChapter: number;
  bottomSideVerse: number;
  isBibleBottom: boolean;
  isHistory: boolean;
  shouldFetch: boolean;
}

export interface IBibleState {
  verses: IBookVerse[];
  bottomVerses: IBookVerse[];
  loading: boolean;
  bibleQuery: IBibleQuery;
}

export interface IStorageData {
  lastBook: string;
  lastChapter: number;
  lastVerse: number;
  lastBottomSideBook: string;
  lastBottomSideChapter: number;
  lastBottomSideVerse: number;
  currentBibleVersion: string;
}

export interface IBibleChapterHook {
  verses: IBookVerse[];
  bottomVerses: IBookVerse[];
  loading: boolean;
  estimatedReadingTime: number;
  estimatedReadingTimeBottom: number;
  fetchChapter: () => Promise<void>;
  updateBibleQuery: (props: Partial<IBibleQuery>) => void;
  bibleQuery: IBibleQuery;
  historyManager: HistoryManager;
  handleDataSave: () => void;
}

// Create the global state with types
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

// Helper functions with type safety
export const updateBibleQuery = (props: Partial<IBibleQuery>): void => {
  bibleState.bibleQuery.set((prev) => ({
    ...prev,
    ...props,
  }));
};

export const useBibleChapter = (): IBibleChapterHook => {
  const { executeSql, isMyBibleDbLoaded } = useDBContext();
  const { storedData, saveData } = useStorage();
  const historyManager = useHistoryManager();
  const { getCurrentItem, add: addToHistory } = historyManager;

  const estimatedReadingTime = useReadingTime({
    text: getChapterTextRaw(bibleState.verses.get()),
  });

  const estimatedReadingTimeBottom = useReadingTime({
    text: getChapterTextRaw(bibleState.verses.get()),
  });

  const fetchChapter = async (): Promise<void> => {
    const query = bibleState.bibleQuery.get();
    const { book, chapter, verse, isBibleBottom } = query;
    const targetBook = isBibleBottom ? query.bottomSideBook : book;
    const targetChapter = isBibleBottom ? query.bottomSideChapter : chapter;
    const targetVerse = isBibleBottom ? query.bottomSideVerse : verse;

    const currentBook = DB_BOOK_NAMES.find((x) => x.longName === targetBook);

    bibleState.loading.set(true);

    if (isBibleBottom) {
      bibleState.verses.set([]);
    } else {
      bibleState.bottomVerses.set([]);
    }

    const queryKey = getDatabaseQueryKey(storedData.currentBibleVersion);
    const dbQuery = QUERY_BY_DB[queryKey];

    try {
      const verses = await executeSql<IBookVerse>(
        dbQuery.GET_VERSES_BY_BOOK_AND_CHAPTER,
        [currentBook?.bookNumber, targetChapter || 1],
        "verses"
      );

      if (isBibleBottom) {
        bibleState.bottomVerses.set(verses);
      } else {
        bibleState.verses.set(verses);
      }
    } catch (error) {
      console.error("Error fetching Bible data:", error);
    } finally {
      bibleState.loading.set(false);
      bibleState.bibleQuery.set((prev) => ({
        ...prev,
        isBibleBottom: false,
        shouldFetch: false,
      }));
    }
  };

  const handleDataSave = (): void => {
    if (!bibleState.loading.get()) {
      const query = bibleState.bibleQuery.get();
      const { isBibleBottom, isHistory } = query;
      const saveKeyPrefix = isBibleBottom ? "lastBottomSide" : "last";
      const bookValue = isBibleBottom ? query.bottomSideBook : query.book;
      const chapterValue = isBibleBottom
        ? query.bottomSideChapter
        : query.chapter;
      const verseValue = isBibleBottom ? query.bottomSideVerse : query.verse;

      saveData({
        [`${saveKeyPrefix}Book`]: bookValue,
        [`${saveKeyPrefix}Chapter`]: chapterValue,
        [`${saveKeyPrefix}Verse`]: verseValue,
      } as Partial<IStorageData>);

      if (!isHistory) {
        addToHistory({
          book: bookValue,
          chapter: chapterValue,
          verse: verseValue,
          created_at: "",
        });
      }

      bibleState.bibleQuery.isHistory.set(false);
    }
  };

  return {
    verses: bibleState.verses.get(),
    bottomVerses: bibleState.bottomVerses.get(),
    loading: bibleState.loading.get(),
    estimatedReadingTime,
    estimatedReadingTimeBottom,
    fetchChapter,
    updateBibleQuery,
    bibleQuery: bibleState.bibleQuery.get(),
    historyManager,
    handleDataSave,
  };
};

// // Provider component with children type
// interface IBibleChapterProviderProps {
//   children: React.ReactNode;
// }

// const BibleChapterProviderComponent = ({
//   children,
// }: IBibleChapterProviderProps) => {
//   const { handleDataSave, fetchChapter } = useBibleChapter();
//   const { isMyBibleDbLoaded } = useDBContext();

//   // Subscribe to loading changes
//   bibleState.loading.onChange(handleDataSave);

//   // Subscribe to shouldFetch changes
//   bibleState.bibleQuery.shouldFetch.onChange((shouldFetch) => {
//     if (shouldFetch && isMyBibleDbLoaded) {
//       fetchChapter();
//     }
//   });

//   return <>{children}</>;
// };

// export const BibleChapterStateProvider = observer(
//   BibleChapterProviderComponent
// );
