/**
 * History State
 * 
 * Navigation history for Bible reading.
 * Now integrates with TinyBase for persistence and sync.
 */

import { observable } from "@legendapp/state";
import { format } from "date-fns";
import { syncState$ } from "@/context/SyncContext";
import {
  getStore,
  isStoreInitialized,
  addHistoryEntry as storeAddHistoryEntry,
  clearHistory as storeClearHistory,
  removeHistoryEntry as storeRemoveHistoryEntry,
  getHistoryList,
} from "@/lib/sync";
import * as Crypto from 'expo-crypto';

export type HistoryItem = {
  id?: number;
  uuid?: string;
  book: string;
  chapter: number;
  verse: number;
  created_at: string;
};

export const historyState$ = observable({
  // In-memory history (for immediate UI responsiveness)
  history: [] as HistoryItem[],

  currentIndex: -1,

  /**
   * Add item to history
   * Persists to TinyBase if store is initialized
   */
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

      const uuid = Crypto.randomUUID();
      const newItem: HistoryItem = {
        ...item,
        uuid,
        created_at: format(new Date(), "MMM dd, yyyy - hh:mm a"),
      };

      // Persist to TinyBase if available
      if (isStoreInitialized()) {
        try {
          const store = getStore();
          storeAddHistoryEntry(store, uuid, {
            book: item.book,
            chapter: item.chapter,
            verse: item.verse,
          });
        } catch (error) {
          console.error('[historyState] Error persisting to TinyBase:', error);
        }
      }

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

  getCurrentItem: (): HistoryItem | null => {
    const currentIndex = historyState$.currentIndex.get();
    return historyState$.history.get()[currentIndex] || null;
  },

  getHistory: () => historyState$.history.get(),

  deleteOne: (id: number | string) => {
    historyState$.history.set((prevHistory) =>
      prevHistory.filter((item) => item.id !== id && item.uuid !== id)
    );

    // Remove from TinyBase if available
    if (isStoreInitialized() && typeof id === 'string') {
      try {
        const store = getStore();
        storeRemoveHistoryEntry(store, id);
      } catch (error) {
        console.error('[historyState] Error removing from TinyBase:', error);
      }
    }
  },

  clearHistory: () => {
    historyState$.history.set([]);
    historyState$.currentIndex.set(-1);

    // Clear from TinyBase if available
    if (isStoreInitialized()) {
      try {
        const store = getStore();
        storeClearHistory(store);
      } catch (error) {
        console.error('[historyState] Error clearing TinyBase:', error);
      }
    }
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

  /**
   * Load history from TinyBase store
   * Call this after TinyBase is initialized
   */
  loadFromStore: () => {
    if (!isStoreInitialized()) return;

    try {
      const store = getStore();
      const tinyHistory = getHistoryList(store);
      
      const converted: HistoryItem[] = tinyHistory.map((h) => ({
        uuid: h.uuid,
        book: h.book,
        chapter: h.chapter,
        verse: h.verse,
        created_at: format(new Date(h.created_at), "MMM dd, yyyy - hh:mm a"),
      }));

      historyState$.history.set(converted);
      historyState$.currentIndex.set(converted.length - 1);
    } catch (error) {
      console.error('[historyState] Error loading from TinyBase:', error);
    }
  },

  /**
   * Sync with TinyBase reactive state
   */
  syncWithTinyBase: () => {
    // Subscribe to TinyBase history changes
    const tinyHistory = syncState$.history.get();
    const converted: HistoryItem[] = tinyHistory.map((h) => ({
      uuid: h.uuid,
      book: h.book,
      chapter: h.chapter,
      verse: h.verse,
      created_at: format(new Date(h.created_at), "MMM dd, yyyy - hh:mm a"),
    }));

    historyState$.history.set(converted);
    if (historyState$.currentIndex.get() === -1 && converted.length > 0) {
      historyState$.currentIndex.set(converted.length - 1);
    }
  },
});
