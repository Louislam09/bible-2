import {
  DELETE_FAVORITE_VERSE,
  GET_ALL_FAVORITE_VERSES,
  GET_FAVORITE_VERSES_WITHOUT_UUID,
  INSERT_FAVORITE_VERSE,
  UPDATE_FAVORITE_VERSE_UUID_BY_ID,
} from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import * as Crypto from 'expo-crypto';
import { Alert } from "react-native";

export const useFavoriteVerseService = () => {
  const { executeSql } = useDBContext();

  const getAllFavoriteVerses = async () => {
    try {
      await generateAndAssignUUID();
      const verses = await executeSql(GET_ALL_FAVORITE_VERSES, [], "getAllFavoriteVerses");
      return verses;
    } catch (error) {
      console.error("Error loading favorite verses:", error);
      Alert.alert("Error", "No se pudieron cargar los versículos favoritos");
      return [];
    }
  };

  const addFavoriteVerse = async (book_number: number, chapter: number, verse: number, uuid?: string) => {
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

      if (storedData$.isFavUUIDGenerated.get()) {
        return true;
      }

      const verses = await executeSql(GET_FAVORITE_VERSES_WITHOUT_UUID, [], "generateFavoriteVerseUUID");
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
