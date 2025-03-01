import { observable } from "@legendapp/state";
import { format } from "date-fns";

// Create the observable state for managing history
export const historyState$ = observable({
  history: [] as {
    id?: number;
    book: string;
    chapter: number;
    verse: number;
    created_at: string;
  }[],

  currentIndex: -1,

  addToHistory: (item: { book: string; chapter: number; verse: number }) => {
    historyState$.history.set((prevHistory) => {
      const lastItem = prevHistory[prevHistory.length - 1];
      if (
        lastItem &&
        lastItem.book === item.book &&
        lastItem.chapter === item.chapter &&
        lastItem.verse === item.verse
      ) {
        return prevHistory;
      }

      const newItem = {
        ...item,
        created_at: format(new Date(), "MMM dd, yyyy - hh:mm a"),
      };
      return [...prevHistory, newItem];
    });
    historyState$.currentIndex.set(historyState$.history.get().length - 1);
  },

  goBack: () => {
    historyState$.currentIndex.set((prevIndex) => Math.max(prevIndex - 1, 0));
  },

  goForward: () => {
    const historyLength = historyState$.history.get().length;
    historyState$.currentIndex.set((prevIndex) =>
      Math.min(prevIndex + 1, historyLength - 1)
    );
  },

  getCurrentItem: () => {
    const currentIndex = historyState$.currentIndex.get();
    return historyState$.history.get()[currentIndex] || null;
  },

  getHistory: () => historyState$.history.get(),

  deleteOne: (id: number) => {
    historyState$.history.set((prevHistory) =>
      prevHistory.filter((item) => item.id !== id)
    );
  },

  clearHistory: () => {
    historyState$.history.set([]);
    historyState$.currentIndex.set(-1);
  },

  canGoBack: () => {
    const currentHistory = historyState$.history.get();
    return currentHistory.length > 1;
  },

  updateVerse: (newVerse: number) => {
    const currentIndex = historyState$.currentIndex.get();
    if (
      currentIndex >= 0 &&
      currentIndex < historyState$.history.get().length
    ) {
      historyState$.history.set((prevHistory) => {
        const updatedHistory = [...prevHistory];
        updatedHistory[currentIndex] = {
          ...updatedHistory[currentIndex],
          verse: newVerse,
        };
        return updatedHistory;
      });
    }
  },
});
