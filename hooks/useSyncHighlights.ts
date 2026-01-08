import {
    GET_ALL_HIGHLIGHTED_VERSES_INCLUDING_DELETED,
    GET_OLD_SOFT_DELETED_HIGHLIGHTS,
    DELETE_OLD_SOFT_DELETED_HIGHLIGHTS,
    UPDATE_HIGHLIGHTED_VERSE_FROM_SYNC,
    INSERT_HIGHLIGHTED_VERSE_FROM_SYNC,
} from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { pb } from "@/globalConfig";
import { authState$ } from "@/state/authState";
import { bibleState$ } from "@/state/bibleState";
import { THighlightedVerse, HighlightStyle } from "@/services/highlightService";
import * as Crypto from "expo-crypto";

/**
 * Cloud highlight type from PocketBase
 */
interface CloudHighlight {
    id: string;
    uuid: string;
    book_number: number;
    chapter: number;
    verse: number;
    style: HighlightStyle;
    color: string;
    created: string;
    updated: string;
    deleted_at: string | null;
}

/**
 * Robust Highlights Sync Hook with Soft Delete Support
 * 
 * Features:
 * - UUID-only matching
 * - Full pagination support via getFullList()
 * - Last-write-wins conflict resolution for style/color changes
 * - Soft delete support with tombstones (deleted_at field)
 * - Multi-device compatible - deletions propagate across devices
 * - 7-day cleanup of permanently deleted highlights
 */
export const useSyncHighlights = () => {
    const { executeSql } = useDBContext();

    // ============================================
    // DATA FETCHING
    // ============================================

    /**
     * Fetch ALL highlights from local SQLite database (including soft-deleted for sync)
     */
    const fetchAllLocalHighlightsIncludingDeleted = async (): Promise<THighlightedVerse[]> => {
        try {
            const highlights = await executeSql<THighlightedVerse>(
                GET_ALL_HIGHLIGHTED_VERSES_INCLUDING_DELETED,
                [],
                "fetchAllLocalHighlightsIncludingDeleted"
            );
            return highlights || [];
        } catch (error) {
            console.error("[HighSync] Error fetching local highlights:", error);
            return [];
        }
    };

    /**
     * Fetch ALL highlights from PocketBase cloud (including soft-deleted)
     */
    const fetchAllCloudHighlights = async (): Promise<CloudHighlight[]> => {
        try {
            const user = authState$.user.get();
            if (!user) {
                console.log("[HighSync] No authenticated user, skipping cloud fetch");
                return [];
            }

            const result = await pb.collection("highlighted_verses").getFullList({
                filter: `user = "${user.id}"`,
                sort: "-updated",
            });

            return result.map((item) => ({
                id: item.id,
                uuid: item.uuid,
                book_number: item.book_number,
                chapter: item.chapter,
                verse: item.verse,
                style: item.style,
                color: item.color,
                created: item.created,
                updated: item.updated,
                deleted_at: item.deleted_at || null,
            }));
        } catch (error) {
            console.error("[HighSync] Error fetching cloud highlights:", error);
            return [];
        }
    };

    // ============================================
    // CLOUD OPERATIONS
    // ============================================

    /**
     * Create a new highlight in PocketBase cloud
     */
    const createHighlightInCloud = async (highlight: THighlightedVerse, uuid: string): Promise<string | null> => {
        try {
            const user = authState$.user.get();
            if (!user) {
                throw new Error("No authenticated user");
            }

            const result = await pb.collection("highlighted_verses").create({
                uuid: uuid,
                book_number: highlight.book_number,
                chapter: highlight.chapter,
                verse: highlight.verse,
                style: highlight.style,
                color: highlight.color,
                user: user.id,
                deleted_at: highlight.deleted_at || null,
            });

            console.log(`[HighSync] Created cloud highlight: ${highlight.book_number}:${highlight.chapter}:${highlight.verse} (uuid: ${uuid})`);
            return result.id;
        } catch (error: any) {
            console.error(`[HighSync] Error creating cloud highlight:`, error.message);
            return null;
        }
    };

    /**
     * Update an existing highlight in PocketBase cloud
     */
    const updateHighlightInCloud = async (highlight: THighlightedVerse, cloudId: string): Promise<boolean> => {
        try {
            await pb.collection("highlighted_verses").update(cloudId, {
                style: highlight.style,
                color: highlight.color,
                deleted_at: highlight.deleted_at || null,
            });

            console.log(`[HighSync] Updated cloud highlight${highlight.deleted_at ? ' (deleted)' : ''}`);
            return true;
        } catch (error: any) {
            console.error(`[HighSync] Error updating cloud highlight:`, error.message);
            return false;
        }
    };

    /**
     * Permanently delete a highlight from PocketBase cloud
     */
    const permanentlyDeleteFromCloud = async (cloudId: string): Promise<boolean> => {
        try {
            await pb.collection("highlighted_verses").delete(cloudId);
            console.log(`[HighSync] Permanently deleted cloud highlight: ${cloudId}`);
            return true;
        } catch (error: any) {
            if (error?.status === 404) {
                return true; // Already deleted
            }
            console.error(`[HighSync] Error deleting cloud highlight:`, error.message);
            return false;
        }
    };

    // ============================================
    // LOCAL OPERATIONS
    // ============================================

    /**
     * Update local highlight's UUID after cloud creation
     */
    const updateLocalHighlightUUID = async (localId: number, uuid: string): Promise<boolean> => {
        try {
            await executeSql(
                `UPDATE highlighted_verses SET uuid = ? WHERE id = ?`,
                [uuid, localId],
                "updateLocalHighlightUUID"
            );
            return true;
        } catch (error) {
            console.error(`[HighSync] Error updating local UUID:`, error);
            return false;
        }
    };

    /**
     * Update local highlight from cloud data (including style, color, deleted_at)
     */
    const updateLocalHighlightFromCloud = async (
        uuid: string,
        cloudHighlight: CloudHighlight
    ): Promise<boolean> => {
        try {
            await executeSql(
                UPDATE_HIGHLIGHTED_VERSE_FROM_SYNC,
                [
                    cloudHighlight.style,
                    cloudHighlight.color,
                    cloudHighlight.updated,
                    cloudHighlight.deleted_at,
                    uuid,
                ],
                "updateLocalHighlightFromCloud"
            );
            console.log(`[HighSync] Updated local highlight from cloud${cloudHighlight.deleted_at ? ' (deleted)' : ''}`);
            return true;
        } catch (error) {
            console.error(`[HighSync] Error updating local highlight from cloud:`, error);
            return false;
        }
    };

    /**
     * Insert a new highlight from cloud into local database
     */
    const insertLocalHighlightFromCloud = async (cloudHighlight: CloudHighlight): Promise<boolean> => {
        try {
            await executeSql(
                INSERT_HIGHLIGHTED_VERSE_FROM_SYNC,
                [
                    cloudHighlight.book_number,
                    cloudHighlight.chapter,
                    cloudHighlight.verse,
                    cloudHighlight.style,
                    cloudHighlight.color,
                    cloudHighlight.uuid,
                    cloudHighlight.created,
                    cloudHighlight.updated,
                    cloudHighlight.deleted_at,
                ],
                "insertLocalHighlightFromCloud"
            );
            console.log(`[HighSync] Inserted local highlight from cloud: ${cloudHighlight.book_number}:${cloudHighlight.chapter}:${cloudHighlight.verse}${cloudHighlight.deleted_at ? ' (deleted)' : ''}`);
            return true;
        } catch (error) {
            console.error(`[HighSync] Error inserting local highlight from cloud:`, error);
            return false;
        }
    };

    // ============================================
    // CLEANUP - Permanent deletion after 7 days
    // ============================================

    /**
     * Permanently delete highlights that have been soft-deleted for more than 7 days
     */
    const cleanupOldDeletedHighlights = async (): Promise<{ cleaned: number }> => {
        const result = { cleaned: 0 };

        try {
            const user = authState$.user.get();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const cutoff = sevenDaysAgo.toISOString();

            console.log(`[HighCleanup] Looking for highlights deleted before: ${cutoff}`);

            const oldDeletedHighlights = await executeSql<THighlightedVerse>(
                GET_OLD_SOFT_DELETED_HIGHLIGHTS,
                [cutoff],
                "getOldDeletedHighlights"
            );

            if (oldDeletedHighlights.length === 0) {
                console.log("[HighCleanup] No old deleted highlights to clean up");
                return result;
            }

            console.log(`[HighCleanup] Found ${oldDeletedHighlights.length} highlights to permanently delete`);

            // Delete from cloud first
            if (user) {
                for (const highlight of oldDeletedHighlights) {
                    if (highlight.uuid) {
                        try {
                            const cloudHighlight = await pb.collection("highlighted_verses").getFirstListItem(
                                `uuid = "${highlight.uuid}" && user = "${user.id}"`
                            ).catch(() => null);

                            if (cloudHighlight) {
                                await permanentlyDeleteFromCloud(cloudHighlight.id);
                            }
                        } catch (error) {
                            console.error(`[HighCleanup] Error deleting cloud highlight ${highlight.uuid}:`, error);
                        }
                    }
                }
            }

            // Permanently delete from local database
            await executeSql(
                DELETE_OLD_SOFT_DELETED_HIGHLIGHTS,
                [cutoff],
                "cleanupDeletedHighlights"
            );

            result.cleaned = oldDeletedHighlights.length;
            console.log(`[HighCleanup] Permanently deleted ${result.cleaned} highlights older than 7 days`);

        } catch (error) {
            console.error("[HighCleanup] Error during cleanup:", error);
        }

        return result;
    };

    // ============================================
    // SYNC ALGORITHMS
    // ============================================

    const getTimestamp = (dateString: string | number | undefined | null): number => {
        if (!dateString) return 0;
        try {
            return new Date(dateString).getTime();
        } catch {
            return 0;
        }
    };

    /**
     * Full bidirectional sync between local and cloud with soft delete support
     */
    const syncHighlights = async (): Promise<{ success: boolean; synced: number; errors: number }> => {
        const result = { success: true, synced: 0, errors: 0 };

        try {
            const user = authState$.user.get();
            if (!user) {
                console.log("[HighSync] No authenticated user, skipping sync");
                return { success: false, synced: 0, errors: 0 };
            }

            bibleState$.isSyncingHighlights.set(true);
            console.log("[HighSync] Starting full sync with soft delete support...");

            // 1. Run cleanup first
            await cleanupOldDeletedHighlights();

            // 2. Fetch all highlights (including soft-deleted)
            const localHighlights = await fetchAllLocalHighlightsIncludingDeleted();
            const cloudHighlights = await fetchAllCloudHighlights();

            console.log(`[HighSync] Found ${localHighlights.length} local highlights, ${cloudHighlights.length} cloud highlights`);

            // 3. Build UUID maps for O(1) lookups
            const localByUUID = new Map<string, THighlightedVerse>();
            const localWithoutUUID: THighlightedVerse[] = [];

            for (const highlight of localHighlights) {
                if (highlight.uuid) {
                    localByUUID.set(highlight.uuid, highlight);
                } else {
                    localWithoutUUID.push(highlight);
                }
            }

            const cloudByUUID = new Map(cloudHighlights.map(h => [h.uuid, h]));

            // 4. Process local highlights WITHOUT UUID (legacy - shouldn't happen often as uuid is NOT NULL)
            for (const localHighlight of localWithoutUUID) {
                if (localHighlight.deleted_at) continue;

                try {
                    const newUUID = Crypto.randomUUID();
                    const cloudId = await createHighlightInCloud(localHighlight, newUUID);

                    if (cloudId && localHighlight.id) {
                        await updateLocalHighlightUUID(localHighlight.id, newUUID);
                        result.synced++;
                    } else {
                        result.errors++;
                    }
                } catch (error) {
                    console.error(`[HighSync] Error processing legacy highlight ${localHighlight.id}:`, error);
                    result.errors++;
                }
            }

            // 5. Process local highlights WITH UUID
            for (const [uuid, localHighlight] of localByUUID) {
                try {
                    const cloudHighlight = cloudByUUID.get(uuid);

                    if (cloudHighlight) {
                        const localTime = getTimestamp(localHighlight.updated_at) || getTimestamp(localHighlight.created_at);
                        const cloudTime = getTimestamp(cloudHighlight.updated) || getTimestamp(cloudHighlight.created);
                        const localDeletedAt = getTimestamp(localHighlight.deleted_at);
                        const cloudDeletedAt = getTimestamp(cloudHighlight.deleted_at);

                        // Handle deletion sync
                        if (localHighlight.deleted_at && !cloudHighlight.deleted_at) {
                            await updateHighlightInCloud(localHighlight, cloudHighlight.id);
                            result.synced++;
                        } else if (!localHighlight.deleted_at && cloudHighlight.deleted_at) {
                            await updateLocalHighlightFromCloud(uuid, cloudHighlight);
                            result.synced++;
                        } else if (localHighlight.deleted_at && cloudHighlight.deleted_at) {
                            if (localDeletedAt > cloudDeletedAt) {
                                await updateHighlightInCloud(localHighlight, cloudHighlight.id);
                            } else if (cloudDeletedAt > localDeletedAt) {
                                await updateLocalHighlightFromCloud(uuid, cloudHighlight);
                            }
                        } else {
                            // Neither deleted - sync based on timestamps (includes style/color changes)
                            if (localTime > cloudTime) {
                                await updateHighlightInCloud(localHighlight, cloudHighlight.id);
                                result.synced++;
                            } else if (cloudTime > localTime) {
                                await updateLocalHighlightFromCloud(uuid, cloudHighlight);
                                result.synced++;
                            }
                        }
                    } else {
                        // Highlight only exists locally - upload to cloud
                        const cloudId = await createHighlightInCloud(localHighlight, uuid);
                        if (cloudId) result.synced++;
                        else result.errors++;
                    }
                } catch (error) {
                    console.error(`[HighSync] Error processing highlight ${uuid}:`, error);
                    result.errors++;
                }
            }

            // 6. Process cloud-only highlights
            for (const [uuid, cloudHighlight] of cloudByUUID) {
                if (!localByUUID.has(uuid)) {
                    try {
                        const success = await insertLocalHighlightFromCloud(cloudHighlight);
                        if (success) result.synced++;
                        else result.errors++;
                    } catch (error) {
                        console.error(`[HighSync] Error inserting cloud highlight ${uuid}:`, error);
                        result.errors++;
                    }
                }
            }

            console.log(`[HighSync] Complete. Synced: ${result.synced}, Errors: ${result.errors}`);
            result.success = result.errors === 0;

        } catch (error) {
            console.error("[HighSync] Fatal error during sync:", error);
            result.success = false;
            result.errors++;
        } finally {
            bibleState$.toggleReloadHighlights?.();
            bibleState$.isSyncingHighlights.set(false);
        }

        return result;
    };

    return {
        syncHighlights,
        cleanupOldDeletedHighlights,
    };
};

