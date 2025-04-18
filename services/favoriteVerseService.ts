import { useDBContext } from "@/context/databaseContext";
import { Alert } from "react-native";
import * as Crypto from 'expo-crypto';
import {
  INSERT_FAVORITE_VERSE,
  DELETE_FAVORITE_VERSE,
  GET_ALL_FAVORITE_VERSES,
  GET_FAVORITE_VERSES_WITHOUT_UUID,
  UPDATE_FAVORITE_VERSE_UUID_BY_ID,
} from "@/constants/Queries";

export const useFavoriteVerseService = () => {
  const { executeSql } = useDBContext();

  const getAllFavoriteVerses = async () => {
    try {
      const verses = await executeSql(GET_ALL_FAVORITE_VERSES, [], "getAllFavoriteVerses");
      return verses;
    } catch (error) {
      console.error("Error loading favorite verses:", error);
      Alert.alert("Error", "No se pudieron cargar los versículos favoritos");
      return [];
    }
  };

  const addFavoriteVerse = async (book_number: number, chapter: number, verse: number) => {
    try {
      await executeSql(
        INSERT_FAVORITE_VERSE,
        [book_number, chapter, verse, book_number, chapter, verse],
        "addFavoriteVerse"
      );
      return true;
    } catch (error) {
      console.error("Error adding favorite verse:", error);
      Alert.alert("Error", "No se pudo agregar el versículo favorito");
      return false;
    }
  };

  const removeFavoriteVerse = async (book_number: number, chapter: number, verse: number) => {
    try {
      await executeSql(
        DELETE_FAVORITE_VERSE,
        [book_number, chapter, verse],
        "removeFavoriteVerse"
      );
      return true;
    } catch (error) {
      console.error("Error removing favorite verse:", error);
      Alert.alert("Error", "No se pudo eliminar el versículo favorito");
      return false;
    }
  };

  const generateAndAssignUUID = async () => {
    try {
      const verses = await executeSql(GET_FAVORITE_VERSES_WITHOUT_UUID, [], "generateFavoriteVerseUUID");
      if (verses.length === 0) {
        console.log("UUIDs already generated for all favorite_verses");
        return true;
      }
      for (const row of verses) {
        const newUUID = Crypto.randomUUID();
        await executeSql(UPDATE_FAVORITE_VERSE_UUID_BY_ID, [newUUID, row.id]);
        console.log(`Assigned UUID ${newUUID} to favorite_verse with ID ${row.id}`);
      }
      console.log(`Successfully generated UUIDs for ${verses.length} favorite_verses`);
      return true;
    } catch (error) {
      console.error("Error generating UUIDs for favorite_verses:", error);
      Alert.alert("Error", "No se pudieron generar UUIDs para los versículos favoritos");
      return false;
    }
  };

  return {
    getAllFavoriteVerses,
    addFavoriteVerse,
    removeFavoriteVerse,
    generateAndAssignUUID,
  };
};
