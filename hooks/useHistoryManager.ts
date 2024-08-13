import { useState, useRef } from "react";

export type HistoryItem = {
  book: string;
  verse: number;
  chapter: number;
};

export type HistoryManager = {
  initializeHistory: (initialHistory: HistoryItem[]) => void;
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
};

const useHistoryManager = (_maxSize: number = 10): HistoryManager => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryInitialized, setIsHistoryInitialized] = useState(false);
  const currentIndexRef = useRef<number>(-1);
  const maxSize = _maxSize || 10;

  const initializeHistory = (initialHistory: HistoryItem[]) => {
    setHistory(Array.isArray(initialHistory) ? [...initialHistory] : []);
    setIsHistoryInitialized(true);
    currentIndexRef.current =
      initialHistory.length > 0 ? initialHistory.length - 1 : -1;
  };

  const add = (item: HistoryItem) => {
    const lastItem = history[history.length - 1] || null;
    const shouldAdd = !(
      lastItem?.book === item.book &&
      lastItem?.chapter === item.chapter &&
      lastItem?.verse === item.verse
    );

    if (!shouldAdd) return;

    let newHistory = [...history];

    if (currentIndexRef.current < history.length - 1) {
      newHistory = history.slice(0, currentIndexRef.current + 1);
    }

    newHistory.push(item);

    while (newHistory.length > maxSize) {
      newHistory.shift();
    }

    setHistory(newHistory);
    currentIndexRef.current = newHistory.length - 1;
  };

  const goBack = (): number => {
    if (currentIndexRef.current > 0) {
      currentIndexRef.current--;
      return currentIndexRef.current;
    }
    return currentIndexRef.current;
  };

  const goForward = (): number => {
    if (currentIndexRef.current < history.length - 1) {
      currentIndexRef.current++;
      return currentIndexRef.current;
    }
    return currentIndexRef.current;
  };

  const getCurrentIndex = (): number => {
    return currentIndexRef.current;
  };
  const getCurrentItem = (): HistoryItem | null => {
    return history[currentIndexRef.current] || null;
  };

  const clear = () => {
    setHistory([]);
    currentIndexRef.current = -1;
  };

  const getHistory = (): HistoryItem[] => {
    return [...history];
  };

  const updateVerse = (newVerse: number) => {
    const currentIndex = currentIndexRef.current;

    if (currentIndex >= 0 && currentIndex < history.length) {
      const updatedHistory = [...history];
      updatedHistory[currentIndex] = {
        ...updatedHistory[currentIndex],
        verse: newVerse || updatedHistory[currentIndex].verse,
      };
      setHistory(updatedHistory);
    }
  };

  return {
    initializeHistory,
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
  };
};

export default useHistoryManager;
