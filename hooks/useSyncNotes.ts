import {
    GET_ALL_NOTES_INCLUDING_DELETED,
    GET_OLD_SOFT_DELETED_NOTES,
    DELETE_OLD_SOFT_DELETED_NOTES,
} from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { pb } from "@/globalConfig";
import { authState$ } from "@/state/authState";
import { bibleState$ } from "@/state/bibleState";
import { TNote } from "@/types";
import * as Crypto from "expo-crypto";

/**
 * Cloud note type from PocketBase
 */
interface CloudNote {
    id: string;
    uuid: string;
    title: string;
    note_text: string;
    created: string;
    updated: string;
    deleted_at: string | null;
}

/**
 * Robust Notes Sync Hook with Soft Delete Support
 * 
 * Features:
 * - UUID-only matching (no title matching to avoid duplicates)
 * - Full pagination support via getFullList()
 * - Last-write-wins conflict resolution
 * - Soft delete support with tombstones (deleted_at field)
 * - Multi-device compatible - deletions propagate across devices
 * - 7-day cleanup of permanently deleted notes
 * - Preserves existing data
 */
export const useSyncNotes = () => {
    const { executeSql } = useDBContext();

    // ============================================
    // DATA FETCHING
    // ============================================

    /**
     * Fetch ALL notes from local SQLite database (including soft-deleted for sync)
     */
    const fetchAllLocalNotesIncludingDeleted = async (): Promise<TNote[]> => {
        try {
            const notes = await executeSql<TNote>(
                GET_ALL_NOTES_INCLUDING_DELETED,
                [],
                "fetchAllLocalNotesIncludingDeleted"
            );
            return notes || [];
        } catch (error) {
            console.error("[Sync] Error fetching local notes:", error);
            return [];
        }
    };

    /**
     * Fetch ALL notes from PocketBase cloud (including soft-deleted)
     */
    const fetchAllCloudNotes = async (): Promise<CloudNote[]> => {
        try {
            const user = authState$.user.get();
            if (!user) {
                console.log("[Sync] No authenticated user, skipping cloud fetch");
                return [];
            }

            // Use getFullList to fetch ALL notes without pagination limits
            const result = await pb.collection("notes").getFullList({
                filter: `user = "${user.id}"`,
                sort: "-updated",
            });

            return result.map((item) => ({
                id: item.id,
                uuid: item.uuid,
                title: item.title || "",
                note_text: item.note_text || "",
                created: item.created,
                updated: item.updated,
                deleted_at: item.deleted_at || null,
            }));
        } catch (error) {
            console.error("[Sync] Error fetching cloud notes:", error);
            return [];
        }
    };

    // ============================================
    // CLOUD OPERATIONS
    // ============================================

    /**
     * Create a new note in PocketBase cloud
     */
    const createNoteInCloud = async (note: TNote, uuid: string): Promise<string | null> => {
        try {
            const user = authState$.user.get();
            if (!user) {
                throw new Error("No authenticated user");
            }

            const result = await pb.collection("notes").create({
                uuid: uuid,
                title: note.title || "",
                note_text: note.note_text || "",
                user: user.id,
                deleted_at: note.deleted_at || null,
            });

            console.log(`[Sync] Created cloud note: ${note.title} (uuid: ${uuid})`);
            return result.id;
        } catch (error: any) {
            console.error(`[Sync] Error creating cloud note:`, error.message);
            return null;
        }
    };

    /**
     * Update an existing note in PocketBase cloud (including deleted_at)
     */
    const updateNoteInCloud = async (note: TNote, cloudId: string): Promise<boolean> => {
        try {
            await pb.collection("notes").update(cloudId, {
                title: note.title || "",
                note_text: note.note_text || "",
                deleted_at: note.deleted_at || null,
            });

            console.log(`[Sync] Updated cloud note: ${note.title}${note.deleted_at ? ' (deleted)' : ''}`);
            return true;
        } catch (error: any) {
            console.error(`[Sync] Error updating cloud note:`, error.message);
            return false;
        }
    };

    /**
     * Permanently delete a note from PocketBase cloud
     */
    const permanentlyDeleteFromCloud = async (cloudId: string): Promise<boolean> => {
        try {
            await pb.collection("notes").delete(cloudId);
            console.log(`[Sync] Permanently deleted cloud note: ${cloudId}`);
            return true;
        } catch (error: any) {
            if (error?.status === 404) {
                return true; // Already deleted
            }
            console.error(`[Sync] Error deleting cloud note:`, error.message);
            return false;
        }
    };

    // ============================================
    // LOCAL OPERATIONS
    // ============================================

    /**
     * Update local note's UUID after cloud creation
     */
    const updateLocalNoteUUID = async (localId: number, uuid: string): Promise<boolean> => {
        try {
            await executeSql(
                `UPDATE notes SET uuid = ? WHERE id = ?`,
                [uuid, localId],
                "updateLocalNoteUUID"
            );
            return true;
        } catch (error) {
            console.error(`[Sync] Error updating local UUID:`, error);
            return false;
        }
    };

    /**
     * Update local note with cloud data (including deleted_at)
     */
    const updateLocalNoteFromCloud = async (
        localId: number,
        cloudNote: CloudNote
    ): Promise<boolean> => {
        try {
            await executeSql(
                `UPDATE notes SET title = ?, note_text = ?, updated_at = ?, created_at = ?, uuid = ?, deleted_at = ? WHERE id = ?`,
                [
                    cloudNote.title,
                    cloudNote.note_text,
                    cloudNote.updated,
                    cloudNote.created,
                    cloudNote.uuid,
                    cloudNote.deleted_at,
                    localId,
                ],
                "updateLocalNoteFromCloud"
            );
            console.log(`[Sync] Updated local note from cloud: ${cloudNote.title}${cloudNote.deleted_at ? ' (deleted)' : ''}`);
            return true;
        } catch (error) {
            console.error(`[Sync] Error updating local note from cloud:`, error);
            return false;
        }
    };

    /**
     * Soft delete a local note (set deleted_at)
     */
    const softDeleteLocalNote = async (localId: number, deletedAt: string): Promise<boolean> => {
        try {
            await executeSql(
                `UPDATE notes SET deleted_at = ?, updated_at = ? WHERE id = ?`,
                [deletedAt, deletedAt, localId],
                "softDeleteLocalNote"
            );
            return true;
        } catch (error) {
            console.error(`[Sync] Error soft deleting local note:`, error);
            return false;
        }
    };

    /**
     * Insert a new note from cloud into local database
     */
    const insertLocalNoteFromCloud = async (cloudNote: CloudNote): Promise<boolean> => {
        try {
            await executeSql(
                `INSERT INTO notes (title, note_text, uuid, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    cloudNote.title,
                    cloudNote.note_text,
                    cloudNote.uuid,
                    cloudNote.created,
                    cloudNote.updated,
                    cloudNote.deleted_at,
                ],
                "insertLocalNoteFromCloud"
            );
            console.log(`[Sync] Inserted local note from cloud: ${cloudNote.title}${cloudNote.deleted_at ? ' (deleted)' : ''}`);
            return true;
        } catch (error) {
            console.error(`[Sync] Error inserting local note from cloud:`, error);
            return false;
        }
    };

    // ============================================
    // CLEANUP - Permanent deletion after 7 days
    // ============================================

    /**
     * Permanently delete notes that have been soft-deleted for more than 7 days
     * Deletes from BOTH local SQLite and PocketBase cloud
     */
    const cleanupOldDeletedNotes = async (): Promise<{ cleaned: number }> => {
        const result = { cleaned: 0 };

        try {
            const user = authState$.user.get();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const cutoff = sevenDaysAgo.toISOString();

            console.log(`[Cleanup] Looking for notes deleted before: ${cutoff}`);

            // 1. Get all locally soft-deleted notes older than 7 days
            const oldDeletedNotes = await executeSql<TNote>(
                GET_OLD_SOFT_DELETED_NOTES,
                [cutoff],
                "getOldDeletedNotes"
            );

            if (oldDeletedNotes.length === 0) {
                console.log("[Cleanup] No old deleted notes to clean up");
                return result;
            }

            console.log(`[Cleanup] Found ${oldDeletedNotes.length} notes to permanently delete`);

            // 2. Delete from cloud first (if user is authenticated and note has UUID)
            if (user) {
                for (const note of oldDeletedNotes) {
                    if (note.uuid) {
                        try {
                            const cloudNote = await pb.collection("notes").getFirstListItem(
                                `uuid = "${note.uuid}" && user = "${user.id}"`
                            ).catch(() => null);

                            if (cloudNote) {
                                await permanentlyDeleteFromCloud(cloudNote.id);
                            }
                        } catch (error) {
                            // Continue with other notes even if one fails
                            console.error(`[Cleanup] Error deleting cloud note ${note.uuid}:`, error);
                        }
                    }
                }
            }

            // 3. Permanently delete from local database
            await executeSql(
                DELETE_OLD_SOFT_DELETED_NOTES,
                [cutoff],
                "cleanupDeletedNotes"
            );

            result.cleaned = oldDeletedNotes.length;
            console.log(`[Cleanup] Permanently deleted ${result.cleaned} notes older than 7 days`);

        } catch (error) {
            console.error("[Cleanup] Error during cleanup:", error);
        }

        return result;
    };

    // ============================================
    // SYNC ALGORITHMS
    // ============================================

    /**
     * Get timestamp in milliseconds for comparison
     */
    const getTimestamp = (dateString: string | undefined | null): number => {
        if (!dateString) return 0;
        try {
            return new Date(dateString).getTime();
        } catch {
            return 0;
        }
    };

    /**
     * Full bidirectional sync between local and cloud with soft delete support
     * 
     * Algorithm:
     * 1. Run cleanup of notes deleted > 7 days
     * 2. Fetch all local notes (including soft-deleted)
     * 3. Fetch all cloud notes (including soft-deleted)
     * 4. Build UUID lookup maps
     * 5. Process local notes:
     *    - No UUID: Generate UUID, upload to cloud
     *    - Has UUID, exists in cloud: Compare timestamps + deleted_at, sync accordingly
     *    - Has UUID, not in cloud: Upload to cloud
     * 6. Process cloud-only notes: Insert locally (including deleted ones for tombstone sync)
     */
    const syncNotes = async (): Promise<{ success: boolean; synced: number; errors: number }> => {
        const result = { success: true, synced: 0, errors: 0 };

        try {
            const user = authState$.user.get();
            if (!user) {
                console.log("[Sync] No authenticated user, skipping sync");
                return { success: false, synced: 0, errors: 0 };
            }

            bibleState$.isSyncingNotes.set(true);
            console.log("[Sync] Starting full sync with soft delete support...");

            // 1. Run cleanup first
            await cleanupOldDeletedNotes();

            // 2. Fetch all notes (including soft-deleted)
            const localNotes = await fetchAllLocalNotesIncludingDeleted();
            const cloudNotes = await fetchAllCloudNotes();

            console.log(`[Sync] Found ${localNotes.length} local notes, ${cloudNotes.length} cloud notes`);

            // 3. Build UUID maps for O(1) lookups
            const localByUUID = new Map<string, TNote>();
            const localWithoutUUID: TNote[] = [];

            for (const note of localNotes) {
                if (note.uuid) {
                    localByUUID.set(note.uuid, note);
                } else {
                    localWithoutUUID.push(note);
                }
            }

            const cloudByUUID = new Map(cloudNotes.map(n => [n.uuid, n]));

            // 4. Process local notes WITHOUT UUID (legacy notes - only if not deleted)
            for (const localNote of localWithoutUUID) {
                if (localNote.deleted_at) {
                    // Skip deleted notes without UUID - they'll be cleaned up eventually
                    continue;
                }

                try {
                    const newUUID = Crypto.randomUUID();
                    const cloudId = await createNoteInCloud(localNote, newUUID);

                    if (cloudId) {
                        await updateLocalNoteUUID(localNote.id, newUUID);
                        result.synced++;
                    } else {
                        result.errors++;
                    }
                } catch (error) {
                    console.error(`[Sync] Error processing legacy note ${localNote.id}:`, error);
                    result.errors++;
                }
            }

            // 5. Process local notes WITH UUID
            for (const [uuid, localNote] of localByUUID) {
                try {
                    const cloudNote = cloudByUUID.get(uuid);

                    if (cloudNote) {
                        // Note exists in both - compare timestamps and deleted_at
                        const localTime = getTimestamp(localNote.updated_at) || getTimestamp(localNote.created_at);
                        const cloudTime = getTimestamp(cloudNote.updated) || getTimestamp(cloudNote.created);
                        const localDeletedAt = getTimestamp(localNote.deleted_at);
                        const cloudDeletedAt = getTimestamp(cloudNote.deleted_at);

                        // Handle deletion sync
                        if (localNote.deleted_at && !cloudNote.deleted_at) {
                            // Local is deleted, cloud is not - sync deletion to cloud
                            await updateNoteInCloud(localNote, cloudNote.id);
                            result.synced++;
                        } else if (!localNote.deleted_at && cloudNote.deleted_at) {
                            // Cloud is deleted, local is not - sync deletion to local
                            await softDeleteLocalNote(localNote.id, cloudNote.deleted_at);
                            result.synced++;
                        } else if (localNote.deleted_at && cloudNote.deleted_at) {
                            // Both deleted - use most recent deletion time
                            if (localDeletedAt > cloudDeletedAt) {
                                await updateNoteInCloud(localNote, cloudNote.id);
                            } else if (cloudDeletedAt > localDeletedAt) {
                                await softDeleteLocalNote(localNote.id, cloudNote.deleted_at);
                            }
                            // Already synced
                        } else {
                            // Neither deleted - normal content sync (last write wins)
                            if (localTime > cloudTime) {
                                await updateNoteInCloud(localNote, cloudNote.id);
                                result.synced++;
                            } else if (cloudTime > localTime) {
                                await updateLocalNoteFromCloud(localNote.id, cloudNote);
                                result.synced++;
                            }
                        }
                    } else {
                        // Note only exists locally - upload to cloud (even if deleted, for tombstone)
                        const cloudId = await createNoteInCloud(localNote, uuid);
                        if (cloudId) result.synced++;
                        else result.errors++;
                    }
                } catch (error) {
                    console.error(`[Sync] Error processing note ${uuid}:`, error);
                    result.errors++;
                }
            }

            // 6. Process cloud-only notes (created on other devices or tombstones)
            for (const [uuid, cloudNote] of cloudByUUID) {
                if (!localByUUID.has(uuid)) {
                    try {
                        // Insert the note locally (even if deleted - for tombstone tracking)
                        const success = await insertLocalNoteFromCloud(cloudNote);
                        if (success) result.synced++;
                        else result.errors++;
                    } catch (error) {
                        console.error(`[Sync] Error inserting cloud note ${uuid}:`, error);
                        result.errors++;
                    }
                }
            }

            console.log(`[Sync] Complete. Synced: ${result.synced}, Errors: ${result.errors}`);
            result.success = result.errors === 0;

        } catch (error) {
            console.error("[Sync] Fatal error during sync:", error);
            result.success = false;
            result.errors++;
        } finally {
            bibleState$.toggleReloadNotes();
            bibleState$.isSyncingNotes.set(false);
        }

        return result;
    };

    /**
     * Sync a single note (useful for quick save after edit)
     */
    const syncSingleNote = async (note: TNote): Promise<boolean> => {
        try {
            const user = authState$.user.get();
            if (!user) {
                console.log("[Sync] No authenticated user, skipping single note sync");
                return false;
            }

            bibleState$.isSyncingNotes.set(true);

            // If note doesn't have UUID, generate one and upload
            if (!note.uuid) {
                const newUUID = Crypto.randomUUID();
                const cloudId = await createNoteInCloud(note, newUUID);

                if (cloudId) {
                    await updateLocalNoteUUID(note.id, newUUID);
                    console.log(`[Sync] Single note uploaded with new UUID: ${newUUID}`);
                    return true;
                }
                return false;
            }

            // Find the cloud version
            const cloudNote = await pb.collection("notes").getFirstListItem(
                `uuid = "${note.uuid}" && user = "${user.id}"`
            ).catch(() => null);

            if (cloudNote) {
                // Update cloud with current local state (including deleted_at)
                await pb.collection("notes").update(cloudNote.id, {
                    title: note.title || "",
                    note_text: note.note_text || "",
                    deleted_at: note.deleted_at || null,
                });
                console.log(`[Sync] Single note synced to cloud: ${note.title}`);
            } else {
                // Note doesn't exist in cloud - create it
                await createNoteInCloud(note, note.uuid);
                console.log(`[Sync] Single note created in cloud: ${note.title}`);
            }

            return true;
        } catch (error) {
            console.error("[Sync] Error syncing single note:", error);
            return false;
        } finally {
            bibleState$.toggleReloadNotes();
            bibleState$.isSyncingNotes.set(false);
        }
    };

    /**
     * Download all cloud notes to local (respects soft deletes)
     */
    const downloadCloudNotesToLocal = async (): Promise<boolean> => {
        try {
            const user = authState$.user.get();
            if (!user) {
                console.log("[Sync] No authenticated user, skipping download");
                return false;
            }

            bibleState$.isSyncingNotes.set(true);
            console.log("[Sync] Downloading cloud notes to local...");

            const cloudNotes = await fetchAllCloudNotes();
            const localNotes = await fetchAllLocalNotesIncludingDeleted();

            // Build local UUID map
            const localByUUID = new Map<string, TNote>();
            for (const note of localNotes) {
                if (note.uuid) {
                    localByUUID.set(note.uuid, note);
                }
            }

            let downloaded = 0;
            let updated = 0;

            for (const cloudNote of cloudNotes) {
                // Skip downloading notes that are soft-deleted in cloud
                if (cloudNote.deleted_at) {
                    const localNote = localByUUID.get(cloudNote.uuid);
                    if (localNote && !localNote.deleted_at) {
                        // Sync the deletion to local
                        await softDeleteLocalNote(localNote.id, cloudNote.deleted_at);
                        updated++;
                    }
                    continue;
                }

                const localNote = localByUUID.get(cloudNote.uuid);

                if (localNote) {
                    // Update existing local note
                    const cloudTime = getTimestamp(cloudNote.updated);
                    const localTime = getTimestamp(localNote.updated_at);

                    if (cloudTime > localTime) {
                        await updateLocalNoteFromCloud(localNote.id, cloudNote);
                        updated++;
                    }
                } else {
                    // Insert new local note
                    await insertLocalNoteFromCloud(cloudNote);
                    downloaded++;
                }
            }

            console.log(`[Sync] Download complete. New: ${downloaded}, Updated: ${updated}`);
            return true;
        } catch (error) {
            console.error("[Sync] Error downloading cloud notes:", error);
            return false;
        } finally {
            bibleState$.toggleReloadNotes();
            bibleState$.isSyncingNotes.set(false);
        }
    };

    return {
        syncNotes,
        syncSingleNote,
        downloadCloudNotesToLocal,
        cleanupOldDeletedNotes,
    };
};
