/**
 * Favorite Verse Service
 * 
 * Now uses TinyBase for local-first storage with PocketBase sync.
 * Legacy SQLite operations are kept for migration compatibility.
 */

import {
  DELETE_FAVORITE_VERSE,
  GET_ALL_FAVORITE_VERSES,
  GET_FAVORITE_VERSES_WITHOUT_UUID,
  INSERT_FAVORITE_VERSE,
  UPDATE_FAVORITE_VERSE_UUID_BY_ID,
} from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useFavorites } from "@/hooks/useSyncedData";
import * as Crypto from 'expo-crypto';

/**
 * Hook for favorite verse operations using TinyBase (recommended)
 */
export const useFavoriteVerseService = () => {
  const { executeSql } = useDBContext();
  const {
    favorites,
    favoritesList,
    addFavorite: tinyAddFavorite,
    removeFavorite: tinyRemoveFavorite,
    removeFavoriteByVerse,
    isFavorite,
    isLoading,
  } = useFavorites();

  /**
   * Get all favorite verses from TinyBase
   */
  const getAllFavoriteVerses = () => {
    // Transform to match legacy format
    return favoritesList.map((fav) => ({
      id: fav.uuid, // Use uuid as id for compatibility
      book_number: fav.book_number,
      chapter: fav.chapter,
      verse: fav.verse,
      uuid: fav.uuid,
      text: fav.text,
    }));
  };

  /**
   * Add a verse to favorites
   */
  const addFavoriteVerse = (
    book_number: number,
    chapter: number,
    verse: number,
    text: string = ''
  ): string | null => {
    return tinyAddFavorite(book_number, chapter, verse, text);
  };

  /**
   * Remove a verse from favorites by book/chapter/verse
   */
  const removeFavoriteVerse = (
    book_number: number,
    chapter: number,
    verse: number
  ): void => {
    removeFavoriteByVerse(book_number, chapter, verse);
  };

  /**
   * Check if a verse is favorited
   * Returns the uuid if favorited, null otherwise
   */
  const checkIsFavorite = (
    book_number: number,
    chapter: number,
    verse: number
  ): string | null => {
    return isFavorite(book_number, chapter, verse);
  };

  /**
   * Legacy: Generate UUIDs for old favorites without them
   * This is now handled by migration, kept for backward compatibility
   */
  const generateAndAssignUUID = async () => {
    try {
      if (storedData$.isFavUUIDGenerated.get()) {
        return true;
      }

      const verses = await executeSql(
        GET_FAVORITE_VERSES_WITHOUT_UUID,
        [],
        "generateFavoriteVerseUUID"
      );
      
      if (verses.length === 0) {
        console.log("UUIDs already generated for all favorite_verses");
        storedData$.isFavUUIDGenerated.set(true);
        return true;
      }

      for (const row of verses) {
        const newUUID = Crypto.randomUUID();
        await executeSql(UPDATE_FAVORITE_VERSE_UUID_BY_ID, [newUUID, row.id]);
        console.log(`Assigned UUID ${newUUID} to favorite_verse with ID ${row.id}`);
      }

      storedData$.isFavUUIDGenerated.set(true);
      console.log(`Successfully generated UUIDs for ${verses.length} favorite_verses`);
      return true;
    } catch (error) {
      console.error("Error generating UUIDs for favorite_verses:", error);
      return false;
    }
  };

  return {
    // New TinyBase-based methods
    favorites,
    favoritesList,
    getAllFavoriteVerses,
    addFavoriteVerse,
    removeFavoriteVerse,
    removeFavoriteByUuid: tinyRemoveFavorite,
    isFavorite: checkIsFavorite,
    isLoading,
    // Legacy method for compatibility
    generateAndAssignUUID,
  };
};

/**
 * Legacy hook that uses direct SQLite access
 * @deprecated Use useFavoriteVerseService instead
 */
export const useLegacyFavoriteVerseService = () => {
  const { executeSql } = useDBContext();

  const getAllFavoriteVerses = async () => {
    try {
      const verses = await executeSql(
        GET_ALL_FAVORITE_VERSES,
        [],
        "getAllFavoriteVerses"
      );
      return verses;
    } catch (error) {
      console.error("Error loading favorite verses:", error);
      return [];
    }
  };

  const addFavoriteVerse = async (
    book_number: number,
    chapter: number,
    verse: number,
    uuid?: string
  ) => {
    try {
      const newUUID = uuid || Crypto.randomUUID();

      await executeSql(
        INSERT_FAVORITE_VERSE,
        [book_number, chapter, verse, newUUID, book_number, chapter, verse],
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
    verse: number
  ) => {
    try {
      await executeSql(
        DELETE_FAVORITE_VERSE,
        [book_number, chapter, verse],
        "removeFavoriteVerse"
      );
      return true;
    } catch (error) {
      console.error("Error removing favorite verse:", error);
      return false;
    }
  };

  return {
    getAllFavoriteVerses,
    addFavoriteVerse,
    removeFavoriteVerse,
  };
};
