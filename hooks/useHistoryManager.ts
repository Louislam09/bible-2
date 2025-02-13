import { historyQuery } from '@/constants/Queries';
import { useDBContext } from '@/context/databaseContext';
import { useCallback, useEffect, useRef, useState } from 'react';

export type HistoryItem = {
  id?: number;
  book: string;
  verse: number;
  chapter: number;
};

export type HistoryManager = {
  add: (item: HistoryItem) => void;
  goBack: () => number;
  goForward: () => number;
  getCurrentIndex: () => number;
  getCurrentItem: () => HistoryItem | null;
  clear: () => void;
  getHistory: () => HistoryItem[];
  updateVerse: (newVerse: number) => void;
  history: HistoryItem[];
  isHistoryInitialized: boolean;
  currentIndex: number;
};

const useHistoryManager = (): HistoryManager => {
  const { executeSql, isMyBibleDbLoaded } = useDBContext();
  const maxSize = 15;
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
      const results = await executeSql(historyQuery.GET_ALL);
      if (results.length) {
        setHistory(results);
        currentIndexRef.current = results.length - 1;
      }
      setIsHistoryInitialized(true);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  }, [executeSql]);

  const add = async (item: HistoryItem) => {
    const lastItem = history[history.length - 1];
    const isSame =
      lastItem?.book === item.book &&
      lastItem?.chapter === item.chapter &&
      lastItem?.verse === item.verse;
    if (isSame) return;

    setHistory((prevHistory) => {
      let newHistory = [...prevHistory];

      // If navigating back, trim future history before adding a new item
      if (currentIndexRef.current < prevHistory.length - 1) {
        newHistory = prevHistory.slice(0, currentIndexRef.current + 1);
      }

      newHistory.push(item);

      // Maintain maxSize limit
      if (newHistory.length > maxSize) {
        newHistory.shift();
      }

      currentIndexRef.current = newHistory.length - 1;
      return newHistory;
    });

    try {
      await executeSql(historyQuery.INSERT, [
        item.book,
        item.chapter,
        item.verse,
      ]);
    } catch (error) {
      console.error('Error inserting history:', error);
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

  const clear = async () => {
    setHistory([]);
    currentIndexRef.current = -1;
    try {
      await executeSql(historyQuery.DELETE_ALL);
    } catch (error) {
      console.error('Error deleting history:', error);
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
        return updatedHistory;
      });

      try {
        await executeSql(historyQuery.UPDATE_VERSE, [
          newVerse,
          history[currentIndex]?.id,
        ]);
      } catch (error) {
        console.error('Error updating verse:', error);
      }
    }
  };

  return {
    add,
    goBack,
    goForward,
    getCurrentItem,
    clear,
    getHistory,
    history,
    isHistoryInitialized,
    getCurrentIndex,
    updateVerse,
    currentIndex: getCurrentIndex(),
  };
};

export default useHistoryManager;
