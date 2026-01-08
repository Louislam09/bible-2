import {
    GET_ALL_FAVORITE_VERSES_INCLUDING_DELETED,
    GET_OLD_SOFT_DELETED_FAVORITES,
    DELETE_OLD_SOFT_DELETED_FAVORITES,
    UPDATE_FAVORITE_VERSE_FROM_SYNC,
    INSERT_FAVORITE_VERSE_FROM_SYNC,
} from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { pb } from "@/globalConfig";
import { authState$ } from "@/state/authState";
import { bibleState$ } from "@/state/bibleState";
import { TFavoriteVerse } from "@/services/favoriteVerseService";
import * as Crypto from "expo-crypto";

/**
 * Cloud favorite type from PocketBase
 */
interface CloudFavorite {
    id: string;
    uuid: string;
    book_number: number;
    chapter: number;
    verse: number;
    created: string;
    updated: string;
    deleted_at: string | null;
}

/**
 * Robust Favorites Sync Hook with Soft Delete Support
 * 
 * Features:
 * - UUID-only matching
 * - Full pagination support via getFullList()
 * - Last-write-wins conflict resolution
 * - Soft delete support with tombstones (deleted_at field)
 * - Multi-device compatible - deletions propagate across devices
 * - 7-day cleanup of permanently deleted favorites
 */
export const useSyncFavorites = () => {
    const { executeSql } = useDBContext();

    // ============================================
    // DATA FETCHING
    // ============================================

    /**
     * Fetch ALL favorites from local SQLite database (including soft-deleted for sync)
     */
    const fetchAllLocalFavoritesIncludingDeleted = async (): Promise<TFavoriteVerse[]> => {
        try {
            const favorites = await executeSql<TFavoriteVerse>(
                GET_ALL_FAVORITE_VERSES_INCLUDING_DELETED,
                [],
                "fetchAllLocalFavoritesIncludingDeleted"
            );
            return favorites || [];
        } catch (error) {
            console.warn("[FavSync] Error fetching local favorites:", error);
            return [];
        }
    };

    /**
     * Fetch ALL favorites from PocketBase cloud (including soft-deleted)
     */
    const fetchAllCloudFavorites = async (): Promise<CloudFavorite[]> => {
        try {
            const user = authState$.user.get();
            if (!user) {
                console.log("[FavSync] No authenticated user, skipping cloud fetch");
                return [];
            }

            const result = await pb.collection("favorite_verses").getFullList({
                filter: `user = "${user.id}"`,
                sort: "-updated_at",
            });

            return result.map((item) => ({
                id: item.id,
                uuid: item.uuid,
                book_number: item.book_number,
                chapter: item.chapter,
                verse: item.verse,
                created: item.created,
                updated: item.updated,
                deleted_at: item.deleted_at || null,
            }));
        } catch (error: any) {
            console.error("[FavSync] Error fetching cloud favorites:", error, error.originalError);
            return [];
        }
    };

    // ============================================
    // CLOUD OPERATIONS
    // ============================================

    /**
     * Create a new favorite in PocketBase cloud
     */
    const createFavoriteInCloud = async (fav: TFavoriteVerse, uuid: string): Promise<string | null> => {
        try {
            const user = authState$.user.get();
            if (!user) {
                throw new Error("No authenticated user");
            }

            const result = await pb.collection("favorite_verses").create({
                uuid: uuid,
                book_number: fav.book_number,
                chapter: fav.chapter,
                verse: fav.verse,
                user: user.id,
                deleted_at: fav.deleted_at || null,
            });

            console.log(`[FavSync] Created cloud favorite: ${fav.book_number}:${fav.chapter}:${fav.verse} (uuid: ${uuid})`);
            return result.id;
        } catch (error: any) {
            console.error(`[FavSync] Error creating cloud favorite:`, error.message);
            return null;
        }
    };

    /**
     * Update an existing favorite in PocketBase cloud (mainly for deleted_at)
     */
    const updateFavoriteInCloud = async (fav: TFavoriteVerse, cloudId: string): Promise<boolean> => {
        try {
            await pb.collection("favorite_verses").update(cloudId, {
                deleted_at: fav.deleted_at || null,
            });

            console.log(`[FavSync] Updated cloud favorite${fav.deleted_at ? ' (deleted)' : ''}`);
            return true;
        } catch (error: any) {
            console.error(`[FavSync] Error updating cloud favorite:`, error.message);
            return false;
        }
    };

    /**
     * Permanently delete a favorite from PocketBase cloud
     */
    const permanentlyDeleteFromCloud = async (cloudId: string): Promise<boolean> => {
        try {
            await pb.collection("favorite_verses").delete(cloudId);
            console.log(`[FavSync] Permanently deleted cloud favorite: ${cloudId}`);
            return true;
        } catch (error: any) {
            if (error?.status === 404) {
                return true; // Already deleted
            }
            console.error(`[FavSync] Error deleting cloud favorite:`, error.message);
            return false;
        }
    };

    // ============================================
    // LOCAL OPERATIONS
    // ============================================

    /**
     * Update local favorite's UUID after cloud creation
     */
    const updateLocalFavoriteUUID = async (localId: number, uuid: string): Promise<boolean> => {
        try {
            await executeSql(
                `UPDATE favorite_verses SET uuid = ? WHERE id = ?`,
                [uuid, localId],
                "updateLocalFavoriteUUID"
            );
            return true;
        } catch (error) {
            console.error(`[FavSync] Error updating local UUID:`, error);
            return false;
        }
    };

    /**
     * Soft delete a local favorite (set deleted_at)
     */
    const softDeleteLocalFavorite = async (localId: number, deletedAt: string): Promise<boolean> => {
        try {
            await executeSql(
                UPDATE_FAVORITE_VERSE_FROM_SYNC,
                [deletedAt, deletedAt, null], // updated_at, deleted_at - but this query uses uuid
                "softDeleteLocalFavorite"
            );
            return true;
        } catch (error) {
            console.error(`[FavSync] Error soft deleting local favorite:`, error);
            return false;
        }
    };

    /**
     * Update local favorite from cloud data (including deleted_at)
     */
    const updateLocalFavoriteFromCloud = async (
        uuid: string,
        cloudFav: CloudFavorite
    ): Promise<boolean> => {
        try {
            await executeSql(
                UPDATE_FAVORITE_VERSE_FROM_SYNC,
                [cloudFav.updated, cloudFav.deleted_at, uuid],
                "updateLocalFavoriteFromCloud"
            );
            console.log(`[FavSync] Updated local favorite from cloud${cloudFav.deleted_at ? ' (deleted)' : ''}`);
            return true;
        } catch (error) {
            console.error(`[FavSync] Error updating local favorite from cloud:`, error);
            return false;
        }
    };

    /**
     * Insert a new favorite from cloud into local database
     */
    const insertLocalFavoriteFromCloud = async (cloudFav: CloudFavorite): Promise<boolean> => {
        try {
            await executeSql(
                INSERT_FAVORITE_VERSE_FROM_SYNC,
                [
                    cloudFav.book_number,
                    cloudFav.chapter,
                    cloudFav.verse,
                    cloudFav.uuid,
                    cloudFav.created,
                    cloudFav.updated,
                    cloudFav.deleted_at,
                ],
                "insertLocalFavoriteFromCloud"
            );
            console.log(`[FavSync] Inserted local favorite from cloud: ${cloudFav.book_number}:${cloudFav.chapter}:${cloudFav.verse}${cloudFav.deleted_at ? ' (deleted)' : ''}`);
            return true;
        } catch (error) {
            console.error(`[FavSync] Error inserting local favorite from cloud:`, error);
            return false;
        }
    };

    // ============================================
    // CLEANUP - Permanent deletion after 7 days
    // ============================================

    /**
     * Permanently delete favorites that have been soft-deleted for more than 7 days
     */
    const cleanupOldDeletedFavorites = async (): Promise<{ cleaned: number }> => {
        const result = { cleaned: 0 };

        try {
            const user = authState$.user.get();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const cutoff = sevenDaysAgo.toISOString();

            console.log(`[FavCleanup] Looking for favorites deleted before: ${cutoff}`);

            const oldDeletedFavorites = await executeSql<TFavoriteVerse>(
                GET_OLD_SOFT_DELETED_FAVORITES,
                [cutoff],
                "getOldDeletedFavorites"
            );

            if (oldDeletedFavorites.length === 0) {
                console.log("[FavCleanup] No old deleted favorites to clean up");
                return result;
            }

            console.log(`[FavCleanup] Found ${oldDeletedFavorites.length} favorites to permanently delete`);

            // Delete from cloud first
            if (user) {
                for (const fav of oldDeletedFavorites) {
                    if (fav.uuid) {
                        try {
                            const cloudFav = await pb.collection("favorite_verses").getFirstListItem(
                                `uuid = "${fav.uuid}" && user = "${user.id}"`
                            ).catch(() => null);

                            if (cloudFav) {
                                await permanentlyDeleteFromCloud(cloudFav.id);
                            }
                        } catch (error) {
                            console.error(`[FavCleanup] Error deleting cloud favorite ${fav.uuid}:`, error);
                        }
                    }
                }
            }

            // Permanently delete from local database
            await executeSql(
                DELETE_OLD_SOFT_DELETED_FAVORITES,
                [cutoff],
                "cleanupDeletedFavorites"
            );

            result.cleaned = oldDeletedFavorites.length;
            console.log(`[FavCleanup] Permanently deleted ${result.cleaned} favorites older than 7 days`);

        } catch (error) {
            console.error("[FavCleanup] Error during cleanup:", error);
        }

        return result;
    };

    // ============================================
    // SYNC ALGORITHMS
    // ============================================

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
     */
    const syncFavorites = async (): Promise<{ success: boolean; synced: number; errors: number }> => {
        const result = { success: true, synced: 0, errors: 0 };

        try {
            const user = authState$.user.get();
            if (!user) {
                console.log("[FavSync] No authenticated user, skipping sync");
                return { success: false, synced: 0, errors: 0 };
            }

            bibleState$.isSyncingFavorites.set(true);
            console.log("[FavSync] Starting full sync with soft delete support...");

            // 1. Run cleanup first
            await cleanupOldDeletedFavorites();

            // 2. Fetch all favorites (including soft-deleted)
            const localFavorites = await fetchAllLocalFavoritesIncludingDeleted();
            const cloudFavorites = await fetchAllCloudFavorites();

            console.log(`[FavSync] Found ${localFavorites.length} local favorites, ${cloudFavorites.length} cloud favorites`);

            // 3. Build UUID maps for O(1) lookups
            const localByUUID = new Map<string, TFavoriteVerse>();
            const localWithoutUUID: TFavoriteVerse[] = [];

            for (const fav of localFavorites) {
                if (fav.uuid) {
                    localByUUID.set(fav.uuid, fav);
                } else {
                    localWithoutUUID.push(fav);
                }
            }

            const cloudByUUID = new Map(cloudFavorites.map(f => [f.uuid, f]));

            // 4. Process local favorites WITHOUT UUID (legacy)
            for (const localFav of localWithoutUUID) {
                if (localFav.deleted_at) continue;

                try {
                    const newUUID = Crypto.randomUUID();
                    const cloudId = await createFavoriteInCloud(localFav, newUUID);

                    if (cloudId && localFav.id) {
                        await updateLocalFavoriteUUID(localFav.id, newUUID);
                        result.synced++;
                    } else {
                        result.errors++;
                    }
                } catch (error) {
                    console.error(`[FavSync] Error processing legacy favorite ${localFav.id}:`, error);
                    result.errors++;
                }
            }

            // 5. Process local favorites WITH UUID
            for (const [uuid, localFav] of localByUUID) {
                try {
                    const cloudFav = cloudByUUID.get(uuid);

                    if (cloudFav) {
                        const localTime = getTimestamp(localFav.updated_at) || getTimestamp(localFav.created_at);
                        const cloudTime = getTimestamp(cloudFav.updated) || getTimestamp(cloudFav.created);
                        const localDeletedAt = getTimestamp(localFav.deleted_at);
                        const cloudDeletedAt = getTimestamp(cloudFav.deleted_at);

                        // Handle deletion sync
                        if (localFav.deleted_at && !cloudFav.deleted_at) {
                            await updateFavoriteInCloud(localFav, cloudFav.id);
                            result.synced++;
                        } else if (!localFav.deleted_at && cloudFav.deleted_at) {
                            await updateLocalFavoriteFromCloud(uuid, cloudFav);
                            result.synced++;
                        } else if (localFav.deleted_at && cloudFav.deleted_at) {
                            if (localDeletedAt > cloudDeletedAt) {
                                await updateFavoriteInCloud(localFav, cloudFav.id);
                            } else if (cloudDeletedAt > localDeletedAt) {
                                await updateLocalFavoriteFromCloud(uuid, cloudFav);
                            }
                        } else {
                            // Neither deleted - sync based on timestamps
                            if (localTime > cloudTime) {
                                await updateFavoriteInCloud(localFav, cloudFav.id);
                                result.synced++;
                            } else if (cloudTime > localTime) {
                                await updateLocalFavoriteFromCloud(uuid, cloudFav);
                                result.synced++;
                            }
                        }
                    } else {
                        // Note only exists locally - upload to cloud
                        const cloudId = await createFavoriteInCloud(localFav, uuid);
                        if (cloudId) result.synced++;
                        else result.errors++;
                    }
                } catch (error) {
                    console.error(`[FavSync] Error processing favorite ${uuid}:`, error);
                    result.errors++;
                }
            }

            // 6. Process cloud-only favorites
            for (const [uuid, cloudFav] of cloudByUUID) {
                if (!localByUUID.has(uuid)) {
                    try {
                        const success = await insertLocalFavoriteFromCloud(cloudFav);
                        if (success) result.synced++;
                        else result.errors++;
                    } catch (error) {
                        console.error(`[FavSync] Error inserting cloud favorite ${uuid}:`, error);
                        result.errors++;
                    }
                }
            }

            console.log(`[FavSync] Complete. Synced: ${result.synced}, Errors: ${result.errors}`);
            result.success = result.errors === 0;

        } catch (error) {
            console.error("[FavSync] Fatal error during sync:", error);
            result.success = false;
            result.errors++;
        } finally {
            bibleState$.toggleReloadFavorites?.();
            bibleState$.isSyncingFavorites.set(false);
        }

        return result;
    };

    return {
        syncFavorites,
        cleanupOldDeletedFavorites,
    };
};

