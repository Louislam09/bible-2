/**
 * Local-first sync system using TinyBase + PocketBase
 * 
 * This module provides:
 * - TinyBase store for local data management
 * - SQLite persistence via expo-sqlite
 * - Background sync with PocketBase
 * - Last-write-wins conflict resolution
 */

// Types
export * from './types';

// Store
export {
  createSyncStore,
  getStore,
  isStoreInitialized,
  // Favorites
  addFavorite,
  removeFavorite,
  getFavorites,
  isFavorite,
  // Highlights
  addHighlight,
  updateHighlight,
  removeHighlight,
  getHighlights,
  getHighlightsByChapter,
  findHighlight,
  // Notes
  addNote,
  updateNote,
  removeNote,
  getNotes,
  getNoteByUuid,
  // Settings
  setSetting,
  getSetting,
  getAllSettings,
  // History
  addHistoryEntry,
  getHistory,
  getHistoryList,
  clearHistory,
  removeHistoryEntry,
  // Sync helpers
  getDirtyRecords,
  markAsSynced,
  importRecord,
  purgeDeletedRecords,
} from './store';

// Persister
export {
  createSQLitePersister,
  loadFromSQLite,
  saveToSQLite,
  saveTableToSQLite,
  startAutoSave,
  stopAutoSave,
  setupChangeListeners,
  closePersister,
  clearPersistedData,
  getPersisterStatus,
} from './persister';

// PocketBase Sync
export {
  syncAll,
  syncTable,
  canSync,
} from './pocketbaseSync';

// Sync Manager
export {
  createSyncManager,
  startSyncManager,
  stopSyncManager,
  getSyncStatus,
  forceSyncNow,
  scheduleSync,
  cancelScheduledSync,
} from './syncManager';

// Migration
export {
  runMigration,
  getMigrationStatus,
  resetMigration,
  needsMigration,
} from './migration';

