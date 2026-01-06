/**
 * Data Migration
 * 
 * One-time migration that:
 * 1. Reads existing data from current SQLite tables in Bible DB
 * 2. Reads from PocketBase (if user authenticated)
 * 3. Merges into TinyBase with last-write-wins
 * 4. Sets migration flag in AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { Store } from 'tinybase';
import * as Crypto from 'expo-crypto';

import { pb } from '@/globalConfig';
import { importRecord, addFavorite, addHighlight, addNote, addHistoryEntry, setSetting } from './store';
import { MigrationStatus, SyncTableId, HighlightStyle } from './types';

const MIGRATION_KEY = 'tinybase_migration_status';

/**
 * Get migration status from AsyncStorage
 */
export async function getMigrationStatus(): Promise<MigrationStatus> {
  try {
    const stored = await AsyncStorage.getItem(MIGRATION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[Migration] Error reading migration status:', error);
  }

  return {
    isCompleted: false,
    migratedAt: null,
    tablesProcessed: [],
  };
}

/**
 * Save migration status to AsyncStorage
 */
async function saveMigrationStatus(status: MigrationStatus): Promise<void> {
  try {
    await AsyncStorage.setItem(MIGRATION_KEY, JSON.stringify(status));
  } catch (error) {
    console.error('[Migration] Error saving migration status:', error);
  }
}

/**
 * Get the Bible database instance
 * This reads from the existing Bible database where user data is stored
 */
async function getBibleDatabase(dbName: string): Promise<SQLite.SQLiteDatabase | null> {
  try {
    const db = await SQLite.openDatabaseAsync(dbName);
    return db;
  } catch (error) {
    console.error('[Migration] Error opening Bible database:', error);
    return null;
  }
}

/**
 * Check if a table exists in the database
 */
async function tableExists(db: SQLite.SQLiteDatabase, tableName: string): Promise<boolean> {
  try {
    const result = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName]
    );
    return result.length > 0;
  } catch (error) {
    console.error(`[Migration] Error checking table ${tableName}:`, error);
    return false;
  }
}

/**
 * Migrate favorites from old SQLite table
 */
async function migrateFavoritesFromSQLite(
  store: Store,
  bibleDb: SQLite.SQLiteDatabase
): Promise<number> {
  let count = 0;

  try {
    // Check if table exists first
    if (!(await tableExists(bibleDb, 'favorite_verses'))) {
      console.log('[Migration] No favorite_verses table found, skipping');
      return 0;
    }

    const rows = await bibleDb.getAllAsync<{
      id: number;
      book_number: number;
      chapter: number;
      verse: number;
      uuid: string | null;
    }>('SELECT id, book_number, chapter, verse, uuid FROM favorite_verses');

    for (const row of rows) {
      const uuid = row.uuid || Crypto.randomUUID();
      addFavorite(store, uuid, {
        book_number: row.book_number,
        chapter: row.chapter,
        verse: row.verse,
      });
      count++;
    }

    console.log(`[Migration] Migrated ${count} favorites from SQLite`);
  } catch (error) {
    console.error('[Migration] Error migrating favorites:', error);
  }

  return count;
}

/**
 * Migrate highlights from old SQLite table
 */
async function migrateHighlightsFromSQLite(
  store: Store,
  bibleDb: SQLite.SQLiteDatabase
): Promise<number> {
  let count = 0;

  try {
    // Check if table exists first
    if (!(await tableExists(bibleDb, 'highlighted_verses'))) {
      console.log('[Migration] No highlighted_verses table found, skipping');
      return 0;
    }

    const rows = await bibleDb.getAllAsync<{
      id: number;
      book_number: number;
      chapter: number;
      verse: number;
      style: string;
      color: string;
      uuid: string | null;
      created_at: number | null;
    }>('SELECT id, book_number, chapter, verse, style, color, uuid, created_at FROM highlighted_verses');

    for (const row of rows) {
      const uuid = row.uuid || Crypto.randomUUID();
      addHighlight(store, uuid, {
        book_number: row.book_number,
        chapter: row.chapter,
        verse: row.verse,
        style: (row.style as HighlightStyle) || 'highlight',
        color: row.color || '#FFEB3B',
      });
      count++;
    }

    console.log(`[Migration] Migrated ${count} highlights from SQLite`);
  } catch (error) {
    console.error('[Migration] Error migrating highlights:', error);
  }

  return count;
}

/**
 * Migrate notes from old SQLite table
 */
async function migrateNotesFromSQLite(
  store: Store,
  bibleDb: SQLite.SQLiteDatabase
): Promise<number> {
  let count = 0;

  try {
    // Check if table exists first
    if (!(await tableExists(bibleDb, 'notes'))) {
      console.log('[Migration] No notes table found, skipping');
      return 0;
    }

    const rows = await bibleDb.getAllAsync<{
      id: number;
      title: string;
      note_text: string;
      uuid: string | null;
      created_at: string | null;
      updated_at: string | null;
    }>('SELECT id, title, note_text, uuid, created_at, updated_at FROM notes');

    for (const row of rows) {
      const uuid = row.uuid || Crypto.randomUUID();
      const createdAt = row.created_at ? new Date(row.created_at).getTime() : Date.now();
      const updatedAt = row.updated_at ? new Date(row.updated_at).getTime() : createdAt;

      // Use importRecord to handle the timestamps properly
      importRecord(store, 'notes', uuid, {
        title: row.title || '',
        note_text: row.note_text || '',
        created_at: createdAt,
        is_deleted: false,
      }, updatedAt);

      count++;
    }

    console.log(`[Migration] Migrated ${count} notes from SQLite`);
  } catch (error) {
    console.error('[Migration] Error migrating notes:', error);
  }

  return count;
}

/**
 * Migrate history from old SQLite table
 */
async function migrateHistoryFromSQLite(
  store: Store,
  bibleDb: SQLite.SQLiteDatabase
): Promise<number> {
  let count = 0;

  try {
    // Check if history table exists
    if (!(await tableExists(bibleDb, 'history'))) {
      console.log('[Migration] No history table found, skipping');
      return 0;
    }

    const rows = await bibleDb.getAllAsync<{
      id: number;
      book: string;
      chapter: number;
      verse: number;
      created_at: string | null;
    }>('SELECT id, book, chapter, verse, created_at FROM history ORDER BY created_at DESC LIMIT 100');

    for (const row of rows) {
      const uuid = Crypto.randomUUID();
      addHistoryEntry(store, uuid, {
        book: row.book,
        chapter: row.chapter,
        verse: row.verse,
      });
      count++;
    }

    console.log(`[Migration] Migrated ${count} history entries from SQLite`);
  } catch (error) {
    console.error('[Migration] Error migrating history:', error);
  }

  return count;
}

/**
 * Migrate favorites from PocketBase
 */
async function migrateFavoritesFromPocketBase(store: Store, userId: string): Promise<number> {
  let count = 0;

  try {
    const records = await pb.collection('favorite_verses').getFullList({
      filter: `user = "${userId}"`,
    });

    for (const record of records) {
      const updatedAt = new Date(record.updated).getTime();
      const imported = importRecord(store, 'favorites', record.uuid, {
        book_number: record.book_number,
        chapter: record.chapter,
        verse: record.verse,
        is_deleted: false,
      }, updatedAt);

      if (imported) count++;
    }

    console.log(`[Migration] Imported ${count} favorites from PocketBase`);
  } catch (error) {
    console.error('[Migration] Error importing favorites from PocketBase:', error);
  }

  return count;
}

/**
 * Migrate notes from PocketBase
 */
async function migrateNotesFromPocketBase(store: Store, userId: string): Promise<number> {
  let count = 0;

  try {
    const records = await pb.collection('notes').getFullList({
      filter: `user = "${userId}"`,
    });

    for (const record of records) {
      const updatedAt = new Date(record.updated).getTime();
      const createdAt = new Date(record.created).getTime();
      const imported = importRecord(store, 'notes', record.uuid, {
        title: record.title,
        note_text: record.note_text,
        created_at: createdAt,
        is_deleted: false,
      }, updatedAt);

      if (imported) count++;
    }

    console.log(`[Migration] Imported ${count} notes from PocketBase`);
  } catch (error) {
    console.error('[Migration] Error importing notes from PocketBase:', error);
  }

  return count;
}

/**
 * Migrate settings from AsyncStorage (LocalstoreContext)
 */
async function migrateSettingsFromAsyncStorage(store: Store): Promise<number> {
  let count = 0;

  // Keys that should NOT be migrated (runtime/local-only state)
  const NON_SYNCABLE_KEYS = [
    'isDataLoaded',
    'isSyncedWithCloud',
    'token',
    'user',
    'dbTableCreated',
    'isUUIDGenerated',
    'isFavUUIDGenerated',
  ];

  try {
    // The LocalstoreContext stores settings under 'bibleStorage' key
    const storedData = await AsyncStorage.getItem('bibleStorage');

    if (storedData) {
      const settings = JSON.parse(storedData);
      const now = Date.now();

      if (settings && typeof settings === 'object') {
        for (const [key, value] of Object.entries(settings)) {
          if (!NON_SYNCABLE_KEYS.includes(key) && value !== undefined && value !== null) {
            setSetting(store, key, value);
            count++;
          }
        }
      }

      console.log(`[Migration] Migrated ${count} settings from AsyncStorage`);
    }
  } catch (error) {
    console.error('[Migration] Error migrating settings from AsyncStorage:', error);
  }

  return count;
}

/**
 * Migrate settings from PocketBase
 */
async function migrateSettingsFromPocketBase(store: Store, userId: string): Promise<number> {
  let count = 0;

  try {
    const records = await pb.collection('user_settings').getList(1, 1, {
      filter: `user = "${userId}"`,
    });

    if (records.items.length > 0) {
      const settingsRecord = records.items[0];
      const settings = settingsRecord.settings as Record<string, any>;
      const updatedAt = new Date(settingsRecord.updated).getTime();

      if (settings && typeof settings === 'object') {
        for (const [key, value] of Object.entries(settings)) {
          importRecord(store, 'settings', key, {
            value: JSON.stringify(value),
            is_deleted: false,
          }, updatedAt);
          count++;
        }
      }

      console.log(`[Migration] Imported ${count} settings from PocketBase`);
    }
  } catch (error) {
    console.error('[Migration] Error importing settings from PocketBase:', error);
  }

  return count;
}

/**
 * Run the full migration
 */
export async function runMigration(
  store: Store,
  bibleDbName: string = 'bible.db'
): Promise<{
  success: boolean;
  migrated: Record<SyncTableId, number>;
  errors: string[];
}> {
  const errors: string[] = [];
  const migrated: Record<SyncTableId, number> = {
    favorites: 0,
    highlights: 0,
    notes: 0,
    settings: 0,
    history: 0,
  };

  console.log('[Migration] Starting migration...');

  // Check if already migrated
  const status = await getMigrationStatus();
  if (status.isCompleted) {
    console.log('[Migration] Already migrated, skipping...');
    return { success: true, migrated, errors: [] };
  }

  // 1. Migrate settings from AsyncStorage (LocalstoreContext)
  try {
    migrated.settings = await migrateSettingsFromAsyncStorage(store);
  } catch (error: any) {
    errors.push(`AsyncStorage settings migration error: ${error.message}`);
  }

  // 2. Migrate from local SQLite (Bible database)
  const bibleDb = await getBibleDatabase(bibleDbName);
  if (bibleDb) {
    try {
      migrated.favorites = await migrateFavoritesFromSQLite(store, bibleDb);
      migrated.highlights = await migrateHighlightsFromSQLite(store, bibleDb);
      migrated.notes = await migrateNotesFromSQLite(store, bibleDb);
      migrated.history = await migrateHistoryFromSQLite(store, bibleDb);
    } catch (error: any) {
      errors.push(`SQLite migration error: ${error.message}`);
    } finally {
      await bibleDb.closeAsync();
    }
  } else {
    errors.push('Could not open Bible database for migration');
  }

  // 3. Merge from PocketBase (if authenticated)
  if (pb.authStore.isValid && pb.authStore.record) {
    const userId = pb.authStore.record.id;
    try {
      const pbFavorites = await migrateFavoritesFromPocketBase(store, userId);
      const pbNotes = await migrateNotesFromPocketBase(store, userId);
      const pbSettings = await migrateSettingsFromPocketBase(store, userId);

      // Add to counts (these might be merged, not additional)
      migrated.favorites = Math.max(migrated.favorites, pbFavorites);
      migrated.notes = Math.max(migrated.notes, pbNotes);
      migrated.settings = Math.max(migrated.settings, pbSettings);
    } catch (error: any) {
      errors.push(`PocketBase migration error: ${error.message}`);
    }
  }

  // 4. Save migration status
  const newStatus: MigrationStatus = {
    isCompleted: true,
    migratedAt: Date.now(),
    tablesProcessed: ['favorites', 'highlights', 'notes', 'settings', 'history'],
  };
  await saveMigrationStatus(newStatus);

  const total = Object.values(migrated).reduce((sum, n) => sum + n, 0);
  console.log(`[Migration] Complete. Migrated ${total} records total.`);

  return {
    success: errors.length === 0,
    migrated,
    errors,
  };
}

/**
 * Reset migration status (for testing)
 */
export async function resetMigration(): Promise<void> {
  await AsyncStorage.removeItem(MIGRATION_KEY);
  console.log('[Migration] Reset migration status');
}

/**
 * Check if migration is needed
 */
export async function needsMigration(): Promise<boolean> {
  const status = await getMigrationStatus();
  return !status.isCompleted;
}

