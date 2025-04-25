import { historyQuery } from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import { bibleState$ } from "@/state/bibleState";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type HistoryItem = {
  id?: number;
  book: string;
  chapter: number;
  verse: number;
  created_at: string;
};

export type HistoryManager = {
  add: (item: HistoryItem) => void;
  goBack: () => number;
  goForward: () => number;
  getCurrentIndex: () => number;
  getCurrentItem: () => HistoryItem | null;
  clear: () => Promise<void>;
  deleteOne: (id: number) => Promise<void>;
  getHistory: () => HistoryItem[];
  updateVerse: (newVerse: number) => void;
  loadHistory: () => Promise<void>;
  history: HistoryItem[];
  isHistoryInitialized: boolean;
  currentIndex: number;
};

const useHistoryManager = (): HistoryManager => {
  const { executeSql, isMyBibleDbLoaded } = useDBContext();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryInitialized, setIsHistoryInitialized] = useState(false);
  const currentIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (!isMyBibleDbLoaded) return;
    if (isHistoryInitialized) return;
    loadHistory();
  }, [isMyBibleDbLoaded]);

  const loadHistory = useCallback(async () => {
    try {
      const results = await executeSql<HistoryItem>(
        historyQuery.GET_ALL,
        [],
        "history"
      );
      if (results.length) {
        const formattedData = results.map((row) => ({
          id: row.id,
          book: row.book,
          chapter: row.chapter,
          verse: row.verse,
          created_at: format(
            new Date(row.created_at),
            "MMM dd, yyyy - hh:mm a"
          ),
        }));
        setHistory(formattedData || []);
        currentIndexRef.current = results.length - 1;
      }
      setIsHistoryInitialized(true);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, [executeSql]);

  const add = async (item: HistoryItem) => {
    const lastItem = history[history.length - 1];
    const isSame =
      lastItem &&
      lastItem.book === item.book &&
      lastItem.chapter === item.chapter &&
      lastItem.verse === item.verse;
    if (isSame) return;

    try {
      // if (historyQuery.INSERT) return;
      await executeSql(
        historyQuery.INSERT,
        [item.book, item.chapter, item.verse],
        "add history"
      );

      const result = await executeSql(
        historyQuery.GET_LAST,
        [],
        "last history"
      );
      if (result.length) {
        const newItem = {
          id: result[0].id,
          book: result[0].book,
          chapter: result[0].chapter,
          verse: result[0].verse,
          created_at: format(
            new Date(result[0].created_at),
            "MMM dd, yyyy - hh:mm a"
          ),
        };

        setHistory((prevHistory) => {
          let newHistory = [...prevHistory, newItem];
          currentIndexRef.current = newHistory.length - 1;
          return newHistory || [];
        });
        bibleState$.bibleQuery.isHistory.set(false);
      }
    } catch (error) {
      console.error("Error inserting history:", error);
    }
  };

  const goBack = (): number => {
    if (currentIndexRef.current > 0) {
      currentIndexRef.current--;
    }
    return currentIndexRef.current;
  };

  const goForward = (): number => {
    if (currentIndexRef.current < history.length - 1) {
      currentIndexRef.current++;
    }
    return currentIndexRef.current;
  };

  const getCurrentIndex = (): number => currentIndexRef.current;
  const getCurrentItem = (): HistoryItem | null =>
    history[currentIndexRef.current] || null;
  const getHistory = (): HistoryItem[] => [...history];

  const deleteOne = async (id: number) => {
    try {
      await executeSql(historyQuery.DELETE_BY_ID, [id]);
      setHistory((prev) => prev.filter((item) => item.id !== id) || []);
    } catch (error) {
      console.error("Error deleting history item:", error);
    }
  };

  const clear = async () => {
    setHistory([]);
    currentIndexRef.current = -1;
    try {
      await executeSql(historyQuery.DELETE_ALL);
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };

  const updateVerse = async (newVerse: number) => {
    const currentIndex = currentIndexRef.current;
    if (currentIndex >= 0 && currentIndex < history.length) {
      setHistory((prevHistory) => {
        const updatedHistory = [...prevHistory];
        updatedHistory[currentIndex] = {
          ...updatedHistory[currentIndex],
          verse: newVerse,
        };
        return updatedHistory || [];
      });

      try {
        await executeSql(historyQuery.UPDATE_VERSE, [
          newVerse,
          history[currentIndex]?.id,
        ]);
      } catch (error) {
        console.error("Error updating verse:", error);
      }
    }
  };

  const historyManager = useMemo(
    () => ({
      add,
      goBack,
      goForward,
      getCurrentItem,
      clear,
      deleteOne,
      getHistory,
      history,
      isHistoryInitialized,
      getCurrentIndex,
      updateVerse,
      currentIndex: getCurrentIndex(),
      loadHistory,
    }),
    [
      {
        add,
        goBack,
        goForward,
        getCurrentItem,
        clear,
        deleteOne,
        getHistory,
        history,
        isHistoryInitialized,
        getCurrentIndex,
        updateVerse,
        currentIndex: getCurrentIndex(),
        loadHistory,
      },
    ]
  );

  return historyManager;
};

export default useHistoryManager;
