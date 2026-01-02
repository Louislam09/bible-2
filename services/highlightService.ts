import {
  DELETE_HIGHLIGHTED_VERSE,
  GET_ALL_HIGHLIGHTED_VERSES,
  GET_ALL_HIGHLIGHTED_VERSES_BY_BOOK_AND_CHAPTER,
  INSERT_HIGHLIGHTED_VERSE,
  UPDATE_HIGHLIGHTED_VERSE,
} from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { useNetwork } from "@/context/NetworkProvider";
import { authState$ } from "@/state/authState";
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useCallback } from "react";

export type HighlightStyle = 'highlight' | 'underline';

export interface THighlightedVerse {
  id?: number;
  book_number: number;
  chapter: number;
  verse: number;
  style: HighlightStyle;
  color: string;
  uuid: string;
  created_at: number | string;
  text?: string;
  bookName?: string;
}

export const useHighlightService = () => {
  const { executeSql } = useDBContext();
  const netInfo = useNetwork();
  const { isConnected } = netInfo;
  const user = authState$.user.get();

  const getAllHighlightedVerses = async (): Promise<THighlightedVerse[]> => {
    try {
      const highlights = await executeSql<THighlightedVerse>(
        GET_ALL_HIGHLIGHTED_VERSES,
        [],
        "getAllHighlightedVerses"
      );
      return highlights;
    } catch (error) {
      console.error("Error al obtener versículos destacados:", error);
      return [];
    }
  };

  const getAllHighlightedVersesByBookAndChapter = async (bookNumber: number, chapter: number): Promise<THighlightedVerse[]> => {
    try {
      const highlights = await executeSql<THighlightedVerse>(
        GET_ALL_HIGHLIGHTED_VERSES_BY_BOOK_AND_CHAPTER,
        [bookNumber, chapter],
        "getAllHighlightedVersesByBookAndChapter"
      );
      return highlights;
    }
    catch (error) {
      console.error("Error al obtener versículos destacados:", error);
      return [];
    }
  };

  const createHighlight = async (
    data: Partial<THighlightedVerse>,
    sendToCloud: boolean = true
  ): Promise<boolean> => {
    try {
      if (!data.book_number || !data.chapter || !data.verse || !data.style || !data.color) {
        throw new Error("Faltan datos requeridos para crear el destacado");
      }

      const newUUID = data.uuid || Crypto.randomUUID();
      const createdAt = data.created_at || Date.now();

      await executeSql(
        INSERT_HIGHLIGHTED_VERSE,
        [
          data.book_number,
          data.chapter,
          data.verse,
          data.style,
          data.color,
          newUUID,
          createdAt,
        ],
        "createHighlight"
      );

      const createdHighlight = {
        id: 0,
        book_number: data.book_number,
        chapter: data.chapter,
        verse: data.verse,
        style: data.style,
        color: data.color,
        uuid: newUUID,
        created_at: createdAt,
      };

      if (isConnected && sendToCloud && user) {
        // TODO: Add highlight state management if needed
        // await highlightState$.addHighlight(createdHighlight);
      }

      return true;
    } catch (error) {
      console.error("Error al crear destacado:", error);
      return false;
    }
  };

  const updateHighlight = useCallback(
    async (
      bookNumber: number,
      chapter: number,
      verse: number,
      data: Partial<Pick<THighlightedVerse, 'style' | 'color'>>,
      sendToCloud: boolean = false
    ): Promise<boolean> => {
      try {
        if (!data.style || !data.color) {
          throw new Error("Se requieren estilo y color para actualizar el destacado");
        }

        await executeSql(
          UPDATE_HIGHLIGHTED_VERSE,
          [data.style, data.color, bookNumber, chapter, verse],
          "updateHighlight"
        );

        if (isConnected && sendToCloud && user) {
          // TODO: Add highlight state management if needed
          // const existing = await pb.collection("highlighted_verses").getFirstListItem(
          //   `book_number = ${bookNumber} AND chapter = ${chapter} AND verse = ${verse}`
          // );
          // await highlightState$.updateHighlight(existing.id, data);
        }

        return true;
      } catch (error: any) {
        console.error(
          `Error al actualizar destacado (${bookNumber}:${chapter}:${verse}):`,
          error.message,
          error.originalError
        );
        return false;
      }
    },
    [isConnected, user]
  );

  const deleteHighlight = async (
    bookNumber: number,
    chapter: number,
    verse: number,
    uuid?: string
  ): Promise<boolean> => {
    try {
      await executeSql(
        DELETE_HIGHLIGHTED_VERSE,
        [bookNumber, chapter, verse],
        "deleteHighlight"
      );

      if (isConnected && user && uuid) {
        // TODO: Add highlight state management if needed
        // try {
        //   const existing = await pb.collection("highlighted_verses").getFirstListItem(
        //     `uuid = "${uuid}"`
        //   );
        //   await highlightState$.deleteHighlight(existing.id);
        // } catch (error) {
        //   console.error("Error al eliminar destacado de la nube:", error);
        // }
      }

      return true;
    } catch (error) {
      console.error(
        `Error al eliminar destacado (${bookNumber}:${chapter}:${verse}):`,
        error
      );
      return false;
    }
  };

  const exportHighlights = async (highlightIds?: number[]) => {
    try {
      const allHighlights = await getAllHighlightedVerses();
      const highlights = highlightIds
        ? allHighlights.filter((h) => h.id && highlightIds.includes(h.id))
        : allHighlights;

      const exportData = {
        version: "1.0",
        exportDate: new Date().toString(),
        highlights,
      };

      const fileUri = `${FileSystem.documentDirectory}bible_highlights_export.json`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(exportData, null, 2)
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Guardar destacados en el dispositivo",
          UTI: "public.json",
        });
      }
    } catch (err) {
      console.log(
        "Error al guardar destacados en el dispositivo: " +
        (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const importHighlights = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });

      if (result.canceled) {
        return;
      }

      const fileContent = await FileSystem.readAsStringAsync(
        result.assets[0].uri
      );
      const importData = JSON.parse(fileContent);

      if (!importData.version || !Array.isArray(importData.highlights)) {
        throw new Error("Formato de archivo de importación no válido");
      }

      importData.highlights.forEach(async (highlight: THighlightedVerse) => {
        await createHighlight(highlight, false);
      });
    } catch (err) {
      console.log(
        "Error al importar destacados: " +
        (err instanceof Error ? err.message : String(err))
      );
    }
  };

  return {
    getAllHighlightedVerses,
    getAllHighlightedVersesByBookAndChapter,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    importHighlights,
    exportHighlights,
  };
};

