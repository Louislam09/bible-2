/**
 * TinyBase Store for local-first user data
 * 
 * This store manages: favorites, highlights, notes, settings, history
 * Bible content is NOT managed here - it stays in the existing SQLite databases
 */

import { createStore, Store } from 'tinybase';
import {
    FavoriteRecord,
    HighlightRecord,
    NoteRecord,
    SettingRecord,
    HistoryRecord,
    SyncTableId,
} from './types';

// Store instance singleton
let storeInstance: Store | null = null;

/**
 * Creates and returns the TinyBase store instance
 * Uses singleton pattern to ensure only one store exists
 */
export function createSyncStore(): Store {
    if (storeInstance) {
        return storeInstance;
    }

    const store = createStore();

    // Initialize tables with empty data
    // TinyBase will infer the schema from the data we add
    store.setTables({
        favorites: {},
        highlights: {},
        notes: {},
        settings: {},
        history: {},
    });

    storeInstance = store;
    return store;
}

/**
 * Get the existing store instance
 * Throws if store hasn't been created yet
 */
export function getStore(): Store {
    if (!storeInstance) {
        throw new Error('Store not initialized. Call createSyncStore() first.');
    }
    return storeInstance;
}

/**
 * Check if store is initialized
 */
export function isStoreInitialized(): boolean {
    return storeInstance !== null;
}

// ============================================
// FAVORITES OPERATIONS
// ============================================

export function addFavorite(
    store: Store,
    uuid: string,
    data: Omit<FavoriteRecord, 'updated_at' | 'synced_at' | 'is_deleted'>
): void {
    store.setRow('favorites', uuid, {
        book_number: data.book_number,
        chapter: data.chapter,
        verse: data.verse,
        text: data.text || '',
        updated_at: Date.now(),
        synced_at: null,
        is_deleted: false,
    });
}

export function removeFavorite(store: Store, uuid: string): void {
    // Soft delete for sync purposes
    const existing = store.getRow('favorites', uuid);
    if (existing) {
        store.setRow('favorites', uuid, {
            ...existing,
            is_deleted: true,
            updated_at: Date.now(),
            synced_at: null,
        });
    }
}

export function getFavorites(store: Store): Record<string, FavoriteRecord> {
    const table = store.getTable('favorites') as unknown as Record<string, FavoriteRecord>;
    // Filter out deleted records
    const result: Record<string, FavoriteRecord> = {};
    for (const [uuid, record] of Object.entries(table)) {
        if (!record.is_deleted) {
            result[uuid] = record;
        }
    }
    return result;
}

export function isFavorite(
    store: Store,
    bookNumber: number,
    chapter: number,
    verse: number
): string | null {
    const favorites = getFavorites(store);
    for (const [uuid, fav] of Object.entries(favorites)) {
        if (
            fav.book_number === bookNumber &&
            fav.chapter === chapter &&
            fav.verse === verse
        ) {
            return uuid;
        }
    }
    return null;
}

// ============================================
// HIGHLIGHTS OPERATIONS
// ============================================

export function addHighlight(
    store: Store,
    uuid: string,
    data: Omit<HighlightRecord, 'updated_at' | 'synced_at' | 'is_deleted'>
): void {
    store.setRow('highlights', uuid, {
        book_number: data.book_number,
        chapter: data.chapter,
        verse: data.verse,
        style: data.style,
        color: data.color,
        text: data.text || '',
        updated_at: Date.now(),
        synced_at: null,
        is_deleted: false,
    });
}

export function updateHighlight(
    store: Store,
    uuid: string,
    data: Partial<Pick<HighlightRecord, 'style' | 'color'>>
): void {
    const existing = store.getRow('highlights', uuid);
    if (existing) {
        store.setRow('highlights', uuid, {
            ...existing,
            ...data,
            updated_at: Date.now(),
            synced_at: null,
        });
    }
}

export function removeHighlight(store: Store, uuid: string): void {
    const existing = store.getRow('highlights', uuid);
    if (existing) {
        store.setRow('highlights', uuid, {
            ...existing,
            is_deleted: true,
            updated_at: Date.now(),
            synced_at: null,
        });
    }
}

export function getHighlights(store: Store): Record<string, HighlightRecord> {
    const table = store.getTable('highlights') as unknown as Record<string, HighlightRecord>;
    const result: Record<string, HighlightRecord> = {};
    for (const [uuid, record] of Object.entries(table)) {
        if (!record.is_deleted) {
            result[uuid] = record;
        }
    }
    return result;
}

export function getHighlightsByChapter(
    store: Store,
    bookNumber: number,
    chapter: number
): Record<string, HighlightRecord> {
    const highlights = getHighlights(store);
    const result: Record<string, HighlightRecord> = {};
    for (const [uuid, highlight] of Object.entries(highlights)) {
        if (highlight.book_number === bookNumber && highlight.chapter === chapter) {
            result[uuid] = highlight;
        }
    }
    return result;
}

export function findHighlight(
    store: Store,
    bookNumber: number,
    chapter: number,
    verse: number
): { uuid: string; record: HighlightRecord } | null {
    const highlights = getHighlights(store);
    for (const [uuid, highlight] of Object.entries(highlights)) {
        if (
            highlight.book_number === bookNumber &&
            highlight.chapter === chapter &&
            highlight.verse === verse
        ) {
            return { uuid, record: highlight };
        }
    }
    return null;
}

// ============================================
// NOTES OPERATIONS
// ============================================

export function addNote(
    store: Store,
    uuid: string,
    data: Omit<NoteRecord, 'updated_at' | 'synced_at' | 'is_deleted' | 'created_at'>
): void {
    const now = Date.now();
    store.setRow('notes', uuid, {
        ...data,
        created_at: now,
        updated_at: now,
        synced_at: null,
        is_deleted: false,
    });
}

export function updateNote(
    store: Store,
    uuid: string,
    data: Partial<Pick<NoteRecord, 'title' | 'note_text'>>
): void {
    const existing = store.getRow('notes', uuid);
    if (existing) {
        store.setRow('notes', uuid, {
            ...existing,
            ...data,
            updated_at: Date.now(),
            synced_at: null,
        });
    }
}

export function removeNote(store: Store, uuid: string): void {
    const existing = store.getRow('notes', uuid);
    if (existing) {
        store.setRow('notes', uuid, {
            ...existing,
            is_deleted: true,
            updated_at: Date.now(),
            synced_at: null,
        });
    }
}

export function getNotes(store: Store): Record<string, NoteRecord> {
    const table = store.getTable('notes') as unknown as Record<string, NoteRecord>;
    const result: Record<string, NoteRecord> = {};
    for (const [uuid, record] of Object.entries(table)) {
        if (!record.is_deleted) {
            result[uuid] = record;
        }
    }
    return result;
}

export function getNoteByUuid(store: Store, uuid: string): NoteRecord | null {
    const row = store.getRow('notes', uuid) as unknown as NoteRecord | undefined;
    if (row && !row.is_deleted) {
        return row;
    }
    return null;
}

// ============================================
// SETTINGS OPERATIONS
// ============================================

export function setSetting(store: Store, key: string, value: any): void {
    store.setRow('settings', key, {
        value: JSON.stringify(value),
        updated_at: Date.now(),
        synced_at: null,
        is_deleted: false,
    });
}

export function getSetting<T = any>(store: Store, key: string): T | null {
    const row = store.getRow('settings', key) as unknown as SettingRecord | undefined;
    if (row && !row.is_deleted) {
        try {
            return JSON.parse(row.value) as T;
        } catch {
            return null;
        }
    }
    return null;
}

export function getAllSettings(store: Store): Record<string, any> {
    const table = store.getTable('settings') as unknown as Record<string, SettingRecord>;
    const result: Record<string, any> = {};
    for (const [key, record] of Object.entries(table)) {
        if (!record.is_deleted) {
            try {
                result[key] = JSON.parse(record.value);
            } catch {
                result[key] = record.value;
            }
        }
    }
    return result;
}

// ============================================
// HISTORY OPERATIONS
// ============================================

export function addHistoryEntry(
    store: Store,
    uuid: string,
    data: Omit<HistoryRecord, 'created_at'>
): void {
    store.setRow('history', uuid, {
        ...data,
        created_at: Date.now(),
    });
}

export function getHistory(store: Store): Record<string, HistoryRecord> {
    return store.getTable('history') as unknown as Record<string, HistoryRecord>;
}

export function getHistoryList(store: Store): Array<HistoryRecord & { uuid: string }> {
    const table = getHistory(store);
    return Object.entries(table)
        .map(([uuid, record]) => ({ uuid, ...record }))
        .sort((a, b) => b.created_at - a.created_at);
}

export function clearHistory(store: Store): void {
    store.setTable('history', {});
}

export function removeHistoryEntry(store: Store, uuid: string): void {
    store.delRow('history', uuid);
}

// ============================================
// SYNC HELPERS
// ============================================

/**
 * Get all dirty (unsynced) records from a table
 */
export function getDirtyRecords(
    store: Store,
    tableId: SyncTableId
): Array<{ uuid: string; record: any }> {
    const table = store.getTable(tableId);
    const dirty: Array<{ uuid: string; record: any }> = [];

    for (const [uuid, record] of Object.entries(table)) {
        const rec = record as any;
        // A record is dirty if synced_at is null or updated_at > synced_at
        if (rec.synced_at === null || rec.updated_at > rec.synced_at) {
            dirty.push({ uuid, record: rec });
        }
    }

    return dirty;
}

/**
 * Mark a record as synced
 */
export function markAsSynced(store: Store, tableId: SyncTableId, uuid: string): void {
    const existing = store.getRow(tableId, uuid);
    if (existing) {
        store.setCell(tableId, uuid, 'synced_at', Date.now());
    }
}

/**
 * Import a record from remote (used during sync/migration)
 * Only updates if remote is newer (last-write-wins)
 */
export function importRecord(
    store: Store,
    tableId: SyncTableId,
    uuid: string,
    remoteRecord: any,
    remoteUpdatedAt: number
): boolean {
    const existing = store.getRow(tableId, uuid) as any;

    // If no local record, or remote is newer, update
    if (!existing || remoteUpdatedAt > (existing.updated_at || 0)) {
        store.setRow(tableId, uuid, {
            ...remoteRecord,
            updated_at: remoteUpdatedAt,
            synced_at: Date.now(),
        });
        return true;
    }

    return false;
}

/**
 * Permanently delete synced records that are marked as deleted
 * Call this after successful sync to clean up
 */
export function purgeDeletedRecords(store: Store, tableId: SyncTableId): void {
    const table = store.getTable(tableId);
    for (const [uuid, record] of Object.entries(table)) {
        const rec = record as any;
        if (rec.is_deleted && rec.synced_at !== null) {
            store.delRow(tableId, uuid);
        }
    }
}

