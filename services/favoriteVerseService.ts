import {
  GET_ALL_FAVORITE_VERSES,
  GET_FAVORITE_VERSES_WITHOUT_UUID,
  INSERT_FAVORITE_VERSE,
  UPDATE_FAVORITE_VERSE_UUID_BY_ID,
  SOFT_DELETE_FAVORITE_VERSE,
  GET_FAVORITE_VERSE_BY_UUID,
} from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { authState$ } from "@/state/authState";
import { pb } from "@/globalConfig";
import * as Crypto from 'expo-crypto';

export interface TFavoriteVerse {
  id?: number;
  book_number: number;
  chapter: number;
  verse: number;
  uuid: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  // Joined fields
  text?: string;
  bookName?: string;
}

export const useFavoriteVerseService = () => {
  const { executeSql } = useDBContext();

  const getAllFavoriteVerses = async (): Promise<TFavoriteVerse[]> => {
    try {
      await generateAndAssignUUID();
      const verses = await executeSql<TFavoriteVerse>(GET_ALL_FAVORITE_VERSES, [], "getAllFavoriteVerses");
      return verses || [];
    } catch (error) {
      console.error("Error loading favorite verses:", error);
      return [];
    }
  };

  const getFavoriteByUUID = async (uuid: string): Promise<TFavoriteVerse | null> => {
    try {
      const results = await executeSql<TFavoriteVerse>(GET_FAVORITE_VERSE_BY_UUID, [uuid], "getFavoriteByUUID");
      return results?.[0] || null;
    } catch (error) {
      console.error("Error getting favorite by UUID:", error);
      return null;
    }
  };

  const addFavoriteVerse = async (
    book_number: number, 
    chapter: number, 
    verse: number, 
    uuid?: string
  ): Promise<boolean> => {
    try {
      const newUUID = uuid || Crypto.randomUUID();
      const now = new Date().toISOString();

      await executeSql(
        INSERT_FAVORITE_VERSE,
        [book_number, chapter, verse, newUUID, now, now, book_number, chapter, verse],
        "addFavoriteVerse"
      );
      return true;
    } catch (error) {
      console.error("Error adding favorite verse:", error);
      return false;
    }
  };

  const removeFavoriteVerse = async (
    book_number: number, 
    chapter: number, 
    verse: number,
    uuid?: string
  ): Promise<boolean> => {
    try {
      const deletedAt = new Date().toISOString();
      
      // Soft delete locally
      await executeSql(
        SOFT_DELETE_FAVORITE_VERSE,
        [deletedAt, deletedAt, book_number, chapter, verse],
        "softDeleteFavoriteVerse"
      );

      // If we have UUID and user is authenticated, also soft delete in cloud
      if (uuid) {
        const user = authState$.user.get();
        if (user) {
          try {
            const cloudFav = await pb.collection("favorite_verses").getFirstListItem(
              `uuid = "${uuid}" && user = "${user.id}"`
            ).catch(() => null);

            if (cloudFav) {
              await pb.collection("favorite_verses").update(cloudFav.id, {
                deleted_at: deletedAt,
              });
              console.log(`[FavoriteService] Soft deleted cloud favorite with UUID: ${uuid}`);
            }
          } catch (cloudError) {
            console.error(`[FavoriteService] Error soft deleting from cloud:`, cloudError);
            // Continue - local delete succeeded
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error removing favorite verse:", error);
      return false;
    }
  };

  const generateAndAssignUUID = async (): Promise<boolean> => {
    try {
      if (storedData$.isFavUUIDGenerated.get()) {
        return true;
      }

      const verses = await executeSql(GET_FAVORITE_VERSES_WITHOUT_UUID, [], "generateFavoriteVerseUUID");
      if (verses.length === 0) {
        storedData$.isFavUUIDGenerated.set(true);
        return true;
      }

      for (const row of verses) {
        const newUUID = Crypto.randomUUID();
        await executeSql(UPDATE_FAVORITE_VERSE_UUID_BY_ID, [newUUID, row.id]);
      }

      storedData$.isFavUUIDGenerated.set(true);
      console.log(`[FavoriteService] Generated UUIDs for ${verses.length} favorite verses`);
      return true;
    } catch (error) {
      console.error("Error generating UUIDs for favorite_verses:", error);
      return false;
    }
  };

  return {
    getAllFavoriteVerses,
    getFavoriteByUUID,
    addFavoriteVerse,
    removeFavoriteVerse,
    generateAndAssignUUID,
  };
};
