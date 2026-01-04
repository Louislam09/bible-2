/**
 * Types for the TinyBase local-first sync system
 */

// Sync metadata added to all records
export interface SyncMetadata {
    updated_at: number;  // Timestamp for last-write-wins
    synced_at: number | null;  // Last successful sync timestamp
    is_deleted: boolean;  // Soft delete flag for sync
}

// Favorite verse record
export interface FavoriteRecord extends SyncMetadata {
    book_number: number;
    chapter: number;
    verse: number;
}

// Highlight record
export type HighlightStyle = 'highlight' | 'underline';

export interface HighlightRecord extends SyncMetadata {
    book_number: number;
    chapter: number;
    verse: number;
    style: HighlightStyle;
    color: string;
}

// Note record
export interface NoteRecord extends SyncMetadata {
    title: string;
    note_text: string;
    created_at: number;
}

// Setting record (key-value)
export interface SettingRecord extends SyncMetadata {
    value: string;  // JSON stringified value
}

// History record
export interface HistoryRecord {
    book: string;
    chapter: number;
    verse: number;
    created_at: number;
}

// Table names
export type SyncTableId = 'favorites' | 'highlights' | 'notes' | 'settings' | 'history';

// PocketBase collection mapping
export const COLLECTION_MAP: Record<SyncTableId, string> = {
    favorites: 'favorite_verses',
    highlights: 'highlighted_verses',
    notes: 'notes',
    settings: 'user_settings',
    history: 'history',
};

// Sync status
export interface SyncStatus {
    isSyncing: boolean;
    lastSyncAt: number | null;
    pendingChanges: number;
    error: string | null;
}

// Migration status
export interface MigrationStatus {
    isCompleted: boolean;
    migratedAt: number | null;
    tablesProcessed: SyncTableId[];
}

