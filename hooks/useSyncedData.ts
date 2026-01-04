/**
 * Synced Data Hooks
 * 
 * React hooks for accessing and modifying synced data.
 * Uses TinyBase for local storage with background PocketBase sync.
 */

import { useCallback, useMemo } from 'react';
import { use$ } from '@legendapp/state/react';
import * as Crypto from 'expo-crypto';

import { useSync, useSyncStore, syncState$ } from '@/context/SyncContext';
import {
  addFavorite as storeAddFavorite,
  removeFavorite as storeRemoveFavorite,
  isFavorite as storeIsFavorite,
  addHighlight as storeAddHighlight,
  updateHighlight as storeUpdateHighlight,
  removeHighlight as storeRemoveHighlight,
  findHighlight as storeFindHighlight,
  getHighlightsByChapter as storeGetHighlightsByChapter,
  addNote as storeAddNote,
  updateNote as storeUpdateNote,
  removeNote as storeRemoveNote,
  getNoteByUuid as storeGetNoteByUuid,
  setSetting as storeSetSetting,
  getSetting as storeGetSetting,
  addHistoryEntry as storeAddHistoryEntry,
  clearHistory as storeClearHistory,
  removeHistoryEntry as storeRemoveHistoryEntry,
  FavoriteRecord,
  HighlightRecord,
  NoteRecord,
  HistoryRecord,
  HighlightStyle,
} from '@/lib/sync';
import { scheduleSync } from '@/lib/sync/syncManager';

// ============================================
// FAVORITES HOOK
// ============================================

export interface UseFavoritesReturn {
  favorites: Record<string, FavoriteRecord>;
  favoritesList: Array<FavoriteRecord & { uuid: string }>;
  addFavorite: (bookNumber: number, chapter: number, verse: number) => string | null;
  removeFavorite: (uuid: string) => void;
  removeFavoriteByVerse: (bookNumber: number, chapter: number, verse: number) => void;
  isFavorite: (bookNumber: number, chapter: number, verse: number) => string | null;
  isLoading: boolean;
}

export function useFavorites(): UseFavoritesReturn {
  const store = useSyncStore();
  const favorites = use$(() => syncState$.favorites.get());
  const isLoading = use$(() => syncState$.isLoading.get());

  const favoritesList = useMemo(() => {
    return Object.entries(favorites).map(([uuid, record]) => ({
      uuid,
      ...record,
    }));
  }, [favorites]);

  const addFavorite = useCallback(
    (bookNumber: number, chapter: number, verse: number): string | null => {
      if (!store) return null;

      // Check if already favorite
      const existing = storeIsFavorite(store, bookNumber, chapter, verse);
      if (existing) return existing;

      const uuid = Crypto.randomUUID();
      storeAddFavorite(store, uuid, {
        book_number: bookNumber,
        chapter,
        verse,
      });

      return uuid;
    },
    [store]
  );

  const removeFavorite = useCallback(
    (uuid: string) => {
      if (!store) return;
      storeRemoveFavorite(store, uuid);
    },
    [store]
  );

  const removeFavoriteByVerse = useCallback(
    (bookNumber: number, chapter: number, verse: number) => {
      if (!store) return;
      const uuid = storeIsFavorite(store, bookNumber, chapter, verse);
      if (uuid) {
        storeRemoveFavorite(store, uuid);
      }
    },
    [store]
  );

  const isFavorite = useCallback(
    (bookNumber: number, chapter: number, verse: number): string | null => {
      if (!store) return null;
      return storeIsFavorite(store, bookNumber, chapter, verse);
    },
    [store]
  );

  return {
    favorites,
    favoritesList,
    addFavorite,
    removeFavorite,
    removeFavoriteByVerse,
    isFavorite,
    isLoading,
  };
}

// ============================================
// HIGHLIGHTS HOOK
// ============================================

export interface UseHighlightsReturn {
  highlights: Record<string, HighlightRecord>;
  highlightsList: Array<HighlightRecord & { uuid: string }>;
  addHighlight: (
    bookNumber: number,
    chapter: number,
    verse: number,
    style: HighlightStyle,
    color: string
  ) => string | null;
  updateHighlight: (uuid: string, style: HighlightStyle, color: string) => void;
  removeHighlight: (uuid: string) => void;
  removeHighlightByVerse: (bookNumber: number, chapter: number, verse: number) => void;
  findHighlight: (
    bookNumber: number,
    chapter: number,
    verse: number
  ) => { uuid: string; record: HighlightRecord } | null;
  getHighlightsByChapter: (
    bookNumber: number,
    chapter: number
  ) => Record<string, HighlightRecord>;
  isLoading: boolean;
}

export function useHighlights(): UseHighlightsReturn {
  const store = useSyncStore();
  const highlights = use$(() => syncState$.highlights.get());
  const isLoading = use$(() => syncState$.isLoading.get());

  const highlightsList = useMemo(() => {
    return Object.entries(highlights).map(([uuid, record]) => ({
      uuid,
      ...record,
    }));
  }, [highlights]);

  const addHighlight = useCallback(
    (
      bookNumber: number,
      chapter: number,
      verse: number,
      style: HighlightStyle,
      color: string
    ): string | null => {
      if (!store) return null;

      // Check if already highlighted - update instead
      const existing = storeFindHighlight(store, bookNumber, chapter, verse);
      if (existing) {
        storeUpdateHighlight(store, existing.uuid, { style, color });
        return existing.uuid;
      }

      const uuid = Crypto.randomUUID();
      storeAddHighlight(store, uuid, {
        book_number: bookNumber,
        chapter,
        verse,
        style,
        color,
      });

      return uuid;
    },
    [store]
  );

  const updateHighlight = useCallback(
    (uuid: string, style: HighlightStyle, color: string) => {
      if (!store) return;
      storeUpdateHighlight(store, uuid, { style, color });
    },
    [store]
  );

  const removeHighlight = useCallback(
    (uuid: string) => {
      if (!store) return;
      storeRemoveHighlight(store, uuid);
    },
    [store]
  );

  const removeHighlightByVerse = useCallback(
    (bookNumber: number, chapter: number, verse: number) => {
      if (!store) return;
      const existing = storeFindHighlight(store, bookNumber, chapter, verse);
      if (existing) {
        storeRemoveHighlight(store, existing.uuid);
      }
    },
    [store]
  );

  const findHighlight = useCallback(
    (bookNumber: number, chapter: number, verse: number) => {
      if (!store) return null;
      return storeFindHighlight(store, bookNumber, chapter, verse);
    },
    [store]
  );

  const getHighlightsByChapter = useCallback(
    (bookNumber: number, chapter: number) => {
      if (!store) return {};
      return storeGetHighlightsByChapter(store, bookNumber, chapter);
    },
    [store]
  );

  return {
    highlights,
    highlightsList,
    addHighlight,
    updateHighlight,
    removeHighlight,
    removeHighlightByVerse,
    findHighlight,
    getHighlightsByChapter,
    isLoading,
  };
}

// ============================================
// NOTES HOOK
// ============================================

export interface UseNotesReturn {
  notes: Record<string, NoteRecord>;
  notesList: Array<NoteRecord & { uuid: string }>;
  createNote: (title: string, noteText: string) => string | null;
  updateNote: (uuid: string, title: string, noteText: string) => void;
  deleteNote: (uuid: string) => void;
  getNoteByUuid: (uuid: string) => NoteRecord | null;
  isLoading: boolean;
}

export function useNotes(): UseNotesReturn {
  const store = useSyncStore();
  const notes = use$(() => syncState$.notes.get());
  const isLoading = use$(() => syncState$.isLoading.get());

  const notesList = useMemo(() => {
    return Object.entries(notes)
      .map(([uuid, record]) => ({
        uuid,
        ...record,
      }))
      .sort((a, b) => b.updated_at - a.updated_at);
  }, [notes]);

  const createNote = useCallback(
    (title: string, noteText: string): string | null => {
      if (!store) return null;

      const uuid = Crypto.randomUUID();
      storeAddNote(store, uuid, {
        title,
        note_text: noteText,
      });

      return uuid;
    },
    [store]
  );

  const updateNote = useCallback(
    (uuid: string, title: string, noteText: string) => {
      if (!store) return;
      storeUpdateNote(store, uuid, { title, note_text: noteText });
    },
    [store]
  );

  const deleteNote = useCallback(
    (uuid: string) => {
      if (!store) return;
      storeRemoveNote(store, uuid);
    },
    [store]
  );

  const getNoteByUuid = useCallback(
    (uuid: string): NoteRecord | null => {
      if (!store) return null;
      return storeGetNoteByUuid(store, uuid);
    },
    [store]
  );

  return {
    notes,
    notesList,
    createNote,
    updateNote,
    deleteNote,
    getNoteByUuid,
    isLoading,
  };
}

// ============================================
// SETTINGS HOOK
// ============================================

export interface UseSettingsReturn {
  settings: Record<string, any>;
  getSetting: <T = any>(key: string) => T | null;
  setSetting: (key: string, value: any) => void;
  isLoading: boolean;
}

export function useSettings(): UseSettingsReturn {
  const store = useSyncStore();
  const settings = use$(() => syncState$.settings.get());
  const isLoading = use$(() => syncState$.isLoading.get());

  const getSetting = useCallback(
    <T = any>(key: string): T | null => {
      if (!store) return null;
      return storeGetSetting<T>(store, key);
    },
    [store]
  );

  const setSetting = useCallback(
    (key: string, value: any) => {
      if (!store) return;
      storeSetSetting(store, key, value);
    },
    [store]
  );

  return {
    settings,
    getSetting,
    setSetting,
    isLoading,
  };
}

// ============================================
// HISTORY HOOK
// ============================================

export interface UseHistoryReturn {
  history: Array<HistoryRecord & { uuid: string }>;
  addToHistory: (book: string, chapter: number, verse: number) => string | null;
  clearHistory: () => void;
  removeHistoryEntry: (uuid: string) => void;
  isLoading: boolean;
}

export function useHistory(): UseHistoryReturn {
  const store = useSyncStore();
  const history = use$(() => syncState$.history.get());
  const isLoading = use$(() => syncState$.isLoading.get());

  const addToHistory = useCallback(
    (book: string, chapter: number, verse: number): string | null => {
      if (!store) return null;

      // Check if last entry is the same
      const currentHistory = history;
      if (currentHistory.length > 0) {
        const last = currentHistory[0];
        if (last.book === book && last.chapter === chapter && last.verse === verse) {
          return last.uuid;
        }
      }

      const uuid = Crypto.randomUUID();
      storeAddHistoryEntry(store, uuid, {
        book,
        chapter,
        verse,
      });

      return uuid;
    },
    [store, history]
  );

  const clearHistory = useCallback(() => {
    if (!store) return;
    storeClearHistory(store);
  }, [store]);

  const removeHistoryEntry = useCallback(
    (uuid: string) => {
      if (!store) return;
      storeRemoveHistoryEntry(store, uuid);
    },
    [store]
  );

  return {
    history,
    addToHistory,
    clearHistory,
    removeHistoryEntry,
    isLoading,
  };
}

// ============================================
// SYNC STATUS HOOK
// ============================================

export interface UseSyncStatusReturn {
  isSyncing: boolean;
  lastSyncAt: number | null;
  pendingChanges: number;
  error: string | null;
  triggerSync: () => Promise<boolean>;
}

export function useSyncStatus(): UseSyncStatusReturn {
  const { triggerSync } = useSync();
  const syncStatus = use$(() => syncState$.syncStatus.get());

  return {
    ...syncStatus,
    triggerSync,
  };
}

