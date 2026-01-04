/**
 * SQLite Persister for TinyBase using the official expo-sqlite persister
 * 
 * Uses TinyBase's built-in createExpoSqlitePersister for expo-sqlite integration.
 * Saves TinyBase store data to a separate user_sync.db database.
 * 
 * @see https://tinybase.org/api/persister-expo-sqlite/
 */

import * as SQLite from 'expo-sqlite';
import { Store } from 'tinybase';
import { createExpoSqlitePersister, ExpoSqlitePersister } from 'tinybase/persisters/persister-expo-sqlite';

const USER_SYNC_DB_NAME = 'user_sync.db';

interface PersisterWrapper {
  persister: ExpoSqlitePersister | null;
  db: SQLite.SQLiteDatabase | null;
  store: Store;
  autoSaveListenerId: string | null;
  isLoading: boolean;
  isSaving: boolean;
}

/**
 * Creates a persister that saves TinyBase data to expo-sqlite
 * using the official TinyBase expo-sqlite persister
 */
export async function createSQLitePersister(store: Store): Promise<PersisterWrapper> {
  const wrapper: PersisterWrapper = {
    persister: null,
    db: null,
    store,
    autoSaveListenerId: null,
    isLoading: false,
    isSaving: false,
  };

  try {
    // Open or create the database
    wrapper.db = await SQLite.openDatabaseAsync(USER_SYNC_DB_NAME);

    // Create the official TinyBase expo-sqlite persister
    // Using JSON serialization mode with table name 'tinybase_store'
    wrapper.persister = createExpoSqlitePersister(
      store,
      wrapper.db,
      'tinybase_store', // Table name for JSON serialization
      // Optional: Log SQL commands in development
      __DEV__ ? (sql, params) => {
        // console.log('[TinyBase SQL]', sql, params);
      } : undefined,
      // Optional: Handle ignored errors
      (error) => {
        console.warn('[TinyBase Persister] Ignored error:', error);
      }
    );

    console.log('[Persister] Created TinyBase expo-sqlite persister');
  } catch (error) {
    console.error('[Persister] Error creating persister:', error);
    throw error;
  }

  return wrapper;
}

/**
 * Load all data from SQLite into the TinyBase store
 */
export async function loadFromSQLite(wrapper: PersisterWrapper): Promise<void> {
  if (!wrapper.persister || wrapper.isLoading) return;

  wrapper.isLoading = true;

  try {
    await wrapper.persister.load();
    console.log('[Persister] Loaded data from SQLite');
  } catch (error) {
    console.error('[Persister] Error loading from SQLite:', error);
    throw error;
  } finally {
    wrapper.isLoading = false;
  }
}

/**
 * Save all TinyBase data to SQLite
 */
export async function saveToSQLite(wrapper: PersisterWrapper): Promise<void> {
  if (!wrapper.persister || wrapper.isSaving) return;

  wrapper.isSaving = true;

  try {
    await wrapper.persister.save();
    console.log('[Persister] Saved data to SQLite');
  } catch (error) {
    console.error('[Persister] Error saving to SQLite:', error);
    throw error;
  } finally {
    wrapper.isSaving = false;
  }
}

/**
 * Save a specific table to SQLite
 * Note: With JSON serialization, this saves the entire store
 */
export async function saveTableToSQLite(
  wrapper: PersisterWrapper,
  _tableId: string
): Promise<void> {
  // With JSON serialization mode, we save the entire store
  await saveToSQLite(wrapper);
}

/**
 * Start auto-saving - the persister will automatically save on store changes
 */
export async function startAutoSave(wrapper: PersisterWrapper): Promise<void> {
  if (!wrapper.persister) return;

  try {
    // Start auto-save mode - persister will save whenever store changes
    await wrapper.persister.startAutoSave();
    console.log('[Persister] Auto-save started');
  } catch (error) {
    console.error('[Persister] Error starting auto-save:', error);
  }
}

/**
 * Stop auto-saving
 */
export function stopAutoSave(wrapper: PersisterWrapper): void {
  if (!wrapper.persister) return;

  try {
    wrapper.persister.stopAutoSave();
    console.log('[Persister] Auto-save stopped');
  } catch (error) {
    console.error('[Persister] Error stopping auto-save:', error);
  }
}

/**
 * Set up listeners to save on store changes (manual approach)
 * Use this if you prefer manual control over auto-save
 */
export function setupChangeListeners(wrapper: PersisterWrapper): () => void {
  // Debounce saves to avoid too many writes
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;
  const DEBOUNCE_MS = 1000;

  const handleChange = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
      saveToSQLite(wrapper).catch((e) =>
        console.error('[Persister] Change-triggered save error:', e)
      );
    }, DEBOUNCE_MS);
  };

  // Listen to all table changes
  const listenerId = wrapper.store.addTablesListener(handleChange);

  // Return cleanup function
  return () => {
    wrapper.store.delListener(listenerId);
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
  };
}

/**
 * Close the database connection and destroy the persister
 */
export async function closePersister(wrapper: PersisterWrapper): Promise<void> {
  stopAutoSave(wrapper);

  // Final save before closing
  try {
    await saveToSQLite(wrapper);
  } catch (error) {
    console.warn('[Persister] Error during final save:', error);
  }

  if (wrapper.persister) {
    wrapper.persister.destroy();
    wrapper.persister = null;
  }

  if (wrapper.db) {
    await wrapper.db.closeAsync();
    wrapper.db = null;
  }

  console.log('[Persister] Closed');
}

/**
 * Clear all persisted data (for testing/reset)
 */
export async function clearPersistedData(wrapper: PersisterWrapper): Promise<void> {
  if (!wrapper.db) return;

  try {
    await wrapper.db.execAsync('DROP TABLE IF EXISTS tinybase_store');
    console.log('[Persister] Cleared all persisted data');
  } catch (error) {
    console.error('[Persister] Error clearing data:', error);
  }
}

/**
 * Get the persister status
 */
export function getPersisterStatus(wrapper: PersisterWrapper): {
  isLoading: boolean;
  isSaving: boolean;
  isAutoSaving: boolean;
} {
  return {
    isLoading: wrapper.isLoading,
    isSaving: wrapper.isSaving,
    isAutoSaving: wrapper.persister?.isAutoSaving() ?? false,
  };
}
