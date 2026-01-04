/**
 * PocketBase Sync Service
 * 
 * Handles bidirectional sync between TinyBase and PocketBase
 * Uses last-write-wins conflict resolution based on updated_at timestamps
 */

import { pb } from '@/globalConfig';
import { Store } from 'tinybase';
import {
  COLLECTION_MAP,
  SyncTableId,
  FavoriteRecord,
  HighlightRecord,
  NoteRecord,
  SettingRecord,
  HistoryRecord,
} from './types';
import {
  getDirtyRecords,
  markAsSynced,
  importRecord,
  purgeDeletedRecords,
} from './store';

interface SyncResult {
  pushed: number;
  pulled: number;
  errors: string[];
}

/**
 * Get the current authenticated user ID
 */
function getUserId(): string | null {
  if (pb.authStore.isValid && pb.authStore.record) {
    return pb.authStore.record.id;
  }
  return null;
}

/**
 * Sync favorites with PocketBase
 */
async function syncFavorites(store: Store, userId: string): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, pulled: 0, errors: [] };
  const collection = COLLECTION_MAP.favorites;

  try {
    // PUSH: Upload dirty local records
    const dirtyRecords = getDirtyRecords(store, 'favorites');

    for (const { uuid, record } of dirtyRecords) {
      try {
        const fav = record as FavoriteRecord;

        if (fav.is_deleted) {
          // Try to delete from server
          try {
            const existing = await pb.collection(collection).getFirstListItem(`uuid = "${uuid}"`);
            await pb.collection(collection).delete(existing.id);
          } catch (e: any) {
            // 404 is fine - already deleted
            if (e?.status !== 404) throw e;
          }
        } else {
          // Upsert to server
          try {
            const existing = await pb.collection(collection).getFirstListItem(`uuid = "${uuid}"`);
            await pb.collection(collection).update(existing.id, {
              book_number: fav.book_number,
              chapter: fav.chapter,
              verse: fav.verse,
            });
          } catch (e: any) {
            if (e?.status === 404) {
              // Create new
              await pb.collection(collection).create({
                uuid,
                user: userId,
                book_number: fav.book_number,
                chapter: fav.chapter,
                verse: fav.verse,
              });
            } else {
              throw e;
            }
          }
        }

        markAsSynced(store, 'favorites', uuid);
        result.pushed++;
      } catch (error: any) {
        result.errors.push(`Favorite ${uuid}: ${error.message}`);
      }
    }

    // PULL: Fetch remote records
    const remoteRecords = await pb.collection(collection).getFullList({
      filter: `user = "${userId}"`,
    });

    for (const remote of remoteRecords) {
      const remoteUpdatedAt = new Date(remote.updated).getTime();
      const imported = importRecord(store, 'favorites', remote.uuid, {
        book_number: remote.book_number,
        chapter: remote.chapter,
        verse: remote.verse,
        is_deleted: false,
      }, remoteUpdatedAt);

      if (imported) result.pulled++;
    }

    // Clean up deleted records that have been synced
    purgeDeletedRecords(store, 'favorites');
  } catch (error: any) {
    result.errors.push(`Favorites sync failed: ${error.message}`);
  }

  return result;
}

/**
 * Sync highlights with PocketBase
 */
async function syncHighlights(store: Store, userId: string): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, pulled: 0, errors: [] };
  const collection = COLLECTION_MAP.highlights;

  try {
    // PUSH
    const dirtyRecords = getDirtyRecords(store, 'highlights');

    for (const { uuid, record } of dirtyRecords) {
      try {
        const highlight = record as HighlightRecord;

        if (highlight.is_deleted) {
          try {
            const existing = await pb.collection(collection).getFirstListItem(`uuid = "${uuid}"`);
            await pb.collection(collection).delete(existing.id);
          } catch (e: any) {
            if (e?.status !== 404) throw e;
          }
        } else {
          try {
            const existing = await pb.collection(collection).getFirstListItem(`uuid = "${uuid}"`);
            await pb.collection(collection).update(existing.id, {
              book_number: highlight.book_number,
              chapter: highlight.chapter,
              verse: highlight.verse,
              style: highlight.style,
              color: highlight.color,
            });
          } catch (e: any) {
            if (e?.status === 404) {
              await pb.collection(collection).create({
                uuid,
                user: userId,
                book_number: highlight.book_number,
                chapter: highlight.chapter,
                verse: highlight.verse,
                style: highlight.style,
                color: highlight.color,
              });
            } else {
              throw e;
            }
          }
        }

        markAsSynced(store, 'highlights', uuid);
        result.pushed++;
      } catch (error: any) {
        result.errors.push(`Highlight ${uuid}: ${error.message}`);
      }
    }

    // PULL
    const remoteRecords = await pb.collection(collection).getFullList({
      filter: `user = "${userId}"`,
    });

    for (const remote of remoteRecords) {
      const remoteUpdatedAt = new Date(remote.updated).getTime();
      const imported = importRecord(store, 'highlights', remote.uuid, {
        book_number: remote.book_number,
        chapter: remote.chapter,
        verse: remote.verse,
        style: remote.style,
        color: remote.color,
        is_deleted: false,
      }, remoteUpdatedAt);

      if (imported) result.pulled++;
    }

    purgeDeletedRecords(store, 'highlights');
  } catch (error: any) {
    result.errors.push(`Highlights sync failed: ${error.message}`);
  }

  return result;
}

/**
 * Sync notes with PocketBase
 */
async function syncNotes(store: Store, userId: string): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, pulled: 0, errors: [] };
  const collection = COLLECTION_MAP.notes;

  try {
    // PUSH
    const dirtyRecords = getDirtyRecords(store, 'notes');

    for (const { uuid, record } of dirtyRecords) {
      try {
        const note = record as NoteRecord;

        if (note.is_deleted) {
          try {
            const existing = await pb.collection(collection).getFirstListItem(`uuid = "${uuid}"`);
            await pb.collection(collection).delete(existing.id);
          } catch (e: any) {
            if (e?.status !== 404) throw e;
          }
        } else {
          try {
            const existing = await pb.collection(collection).getFirstListItem(`uuid = "${uuid}"`);
            await pb.collection(collection).update(existing.id, {
              title: note.title,
              note_text: note.note_text,
            });
          } catch (e: any) {
            if (e?.status === 404) {
              await pb.collection(collection).create({
                uuid,
                user: userId,
                title: note.title,
                note_text: note.note_text,
              });
            } else {
              throw e;
            }
          }
        }

        markAsSynced(store, 'notes', uuid);
        result.pushed++;
      } catch (error: any) {
        result.errors.push(`Note ${uuid}: ${error.message}`);
      }
    }

    // PULL
    const remoteRecords = await pb.collection(collection).getFullList({
      filter: `user = "${userId}"`,
      sort: '-created',
    });

    for (const remote of remoteRecords) {
      const remoteUpdatedAt = new Date(remote.updated).getTime();
      const remoteCreatedAt = new Date(remote.created).getTime();
      const imported = importRecord(store, 'notes', remote.uuid, {
        title: remote.title,
        note_text: remote.note_text,
        created_at: remoteCreatedAt,
        is_deleted: false,
      }, remoteUpdatedAt);

      if (imported) result.pulled++;
    }

    purgeDeletedRecords(store, 'notes');
  } catch (error: any) {
    result.errors.push(`Notes sync failed: ${error.message}`);
  }

  return result;
}

/**
 * Sync settings with PocketBase
 * Settings are stored as a single JSON blob in user_settings collection
 */
async function syncSettings(store: Store, userId: string): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, pulled: 0, errors: [] };
  const collection = COLLECTION_MAP.settings;

  try {
    // Get all local settings
    const localSettings = store.getTable('settings');
    const settingsToSync: Record<string, any> = {};
    let latestLocalUpdate = 0;

    for (const [key, record] of Object.entries(localSettings)) {
      const setting = record as SettingRecord;
      if (!setting.is_deleted) {
        try {
          settingsToSync[key] = JSON.parse(setting.value);
        } catch {
          settingsToSync[key] = setting.value;
        }
        if (setting.updated_at > latestLocalUpdate) {
          latestLocalUpdate = setting.updated_at;
        }
      }
    }

    // Try to get existing settings from server
    try {
      const existingList = await pb.collection(collection).getList(1, 1, {
        filter: `user = "${userId}"`,
      });

      if (existingList.items.length > 0) {
        const existing = existingList.items[0];
        const remoteUpdatedAt = new Date(existing.updated).getTime();
        const remoteSettings = existing.settings as Record<string, any>;

        // Merge: remote settings with local, local wins if newer
        if (remoteSettings && typeof remoteSettings === 'object') {
          for (const [key, value] of Object.entries(remoteSettings)) {
            const localSetting = localSettings[key] as SettingRecord | undefined;
            // Import if no local or remote is newer
            if (!localSetting || remoteUpdatedAt > (localSetting.updated_at || 0)) {
              store.setRow('settings', key, {
                value: JSON.stringify(value),
                updated_at: remoteUpdatedAt,
                synced_at: Date.now(),
                is_deleted: false,
              });
              result.pulled++;
            }
          }
        }

        // Push local changes if newer
        if (latestLocalUpdate > remoteUpdatedAt) {
          await pb.collection(collection).update(existing.id, {
            settings: settingsToSync,
          });
          result.pushed++;
        }
      } else {
        // No remote settings, create new
        if (Object.keys(settingsToSync).length > 0) {
          await pb.collection(collection).create({
            user: userId,
            settings: settingsToSync,
          });
          result.pushed++;
        }
      }

      // Mark all settings as synced
      for (const key of Object.keys(localSettings)) {
        markAsSynced(store, 'settings', key);
      }
    } catch (error: any) {
      result.errors.push(`Settings sync failed: ${error.message}`);
    }
  } catch (error: any) {
    result.errors.push(`Settings sync failed: ${error.message}`);
  }

  return result;
}

/**
 * Sync history with PocketBase
 */
async function syncHistory(store: Store, userId: string): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, pulled: 0, errors: [] };
  const collection = COLLECTION_MAP.history;

  try {
    // Get local history
    const localHistory = store.getTable('history');

    // Push local history entries that aren't synced
    for (const [uuid, record] of Object.entries(localHistory)) {
      const entry = record as HistoryRecord & { synced_at?: number | null };
      if (entry.synced_at === null || entry.synced_at === undefined) {
        try {
          // Check if exists
          try {
            await pb.collection(collection).getFirstListItem(`uuid = "${uuid}"`);
            // Already exists, just mark as synced
          } catch (e: any) {
            if (e?.status === 404) {
              // Create new
              await pb.collection(collection).create({
                uuid,
                user: userId,
                book: entry.book,
                chapter: entry.chapter,
                verse: entry.verse,
              });
              result.pushed++;
            } else {
              throw e;
            }
          }

          // Mark as synced
          store.setCell('history', uuid, 'synced_at', Date.now());
        } catch (error: any) {
          result.errors.push(`History ${uuid}: ${error.message}`);
        }
      }
    }

    // Pull remote history
    const remoteRecords = await pb.collection(collection).getFullList({
      filter: `user = "${userId}"`,
      sort: '-created',
    });

    for (const remote of remoteRecords) {
      const existingLocal = store.getRow('history', remote.uuid);
      if (!existingLocal) {
        store.setRow('history', remote.uuid, {
          book: remote.book,
          chapter: remote.chapter,
          verse: remote.verse,
          created_at: new Date(remote.created).getTime(),
          synced_at: Date.now(),
        });
        result.pulled++;
      }
    }
  } catch (error: any) {
    result.errors.push(`History sync failed: ${error.message}`);
  }

  return result;
}

/**
 * Main sync function - syncs all tables
 */
export async function syncAll(store: Store): Promise<{
  success: boolean;
  results: Record<SyncTableId, SyncResult>;
  totalPushed: number;
  totalPulled: number;
  errors: string[];
}> {
  const userId = getUserId();
  if (!userId) {
    return {
      success: false,
      results: {} as any,
      totalPushed: 0,
      totalPulled: 0,
      errors: ['No authenticated user'],
    };
  }

  console.log('[PocketBase Sync] Starting full sync...');

  const results: Record<SyncTableId, SyncResult> = {
    favorites: await syncFavorites(store, userId),
    highlights: await syncHighlights(store, userId),
    notes: await syncNotes(store, userId),
    settings: await syncSettings(store, userId),
    history: await syncHistory(store, userId),
  };

  const totalPushed = Object.values(results).reduce((sum, r) => sum + r.pushed, 0);
  const totalPulled = Object.values(results).reduce((sum, r) => sum + r.pulled, 0);
  const allErrors = Object.values(results).flatMap((r) => r.errors);

  console.log(`[PocketBase Sync] Complete. Pushed: ${totalPushed}, Pulled: ${totalPulled}, Errors: ${allErrors.length}`);

  return {
    success: allErrors.length === 0,
    results,
    totalPushed,
    totalPulled,
    errors: allErrors,
  };
}

/**
 * Sync a specific table only
 */
export async function syncTable(store: Store, tableId: SyncTableId): Promise<SyncResult> {
  const userId = getUserId();
  if (!userId) {
    return { pushed: 0, pulled: 0, errors: ['No authenticated user'] };
  }

  switch (tableId) {
    case 'favorites':
      return syncFavorites(store, userId);
    case 'highlights':
      return syncHighlights(store, userId);
    case 'notes':
      return syncNotes(store, userId);
    case 'settings':
      return syncSettings(store, userId);
    case 'history':
      return syncHistory(store, userId);
    default:
      return { pushed: 0, pulled: 0, errors: [`Unknown table: ${tableId}`] };
  }
}

/**
 * Check if user is authenticated and can sync
 */
export function canSync(): boolean {
  return pb.authStore.isValid && pb.authStore.record !== null;
}

