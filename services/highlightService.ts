import {
  GET_ALL_HIGHLIGHTED_VERSES,
  GET_ALL_HIGHLIGHTED_VERSES_BY_BOOK_AND_CHAPTER,
  INSERT_HIGHLIGHTED_VERSE,
  UPDATE_HIGHLIGHTED_VERSE,
  SOFT_DELETE_HIGHLIGHTED_VERSE,
  GET_HIGHLIGHTED_VERSE_BY_UUID,
} from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { useNetwork } from "@/context/NetworkProvider";
import { authState$ } from "@/state/authState";
import { pb } from "@/globalConfig";
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
  updated_at?: string | null;
  deleted_at?: string | null;
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
      return highlights || [];
    } catch (error) {
      console.error("Error al obtener versículos destacados:", error);
      return [];
    }
  };

  const getAllHighlightedVersesByBookAndChapter = async (
    bookNumber: number, 
    chapter: number
  ): Promise<THighlightedVerse[]> => {
    try {
      const highlights = await executeSql<THighlightedVerse>(
        GET_ALL_HIGHLIGHTED_VERSES_BY_BOOK_AND_CHAPTER,
        [bookNumber, chapter],
        "getAllHighlightedVersesByBookAndChapter"
      );
      return highlights || [];
    } catch (error) {
      console.error("Error al obtener versículos destacados:", error);
      return [];
    }
  };

  const getHighlightByUUID = async (uuid: string): Promise<THighlightedVerse | null> => {
    try {
      const results = await executeSql<THighlightedVerse>(
        GET_HIGHLIGHTED_VERSE_BY_UUID, 
        [uuid], 
        "getHighlightByUUID"
      );
      return results?.[0] || null;
    } catch (error) {
      console.error("Error getting highlight by UUID:", error);
      return null;
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
      const updatedAt = new Date().toISOString();

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
          updatedAt,
        ],
        "createHighlight"
      );

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

        const updatedAt = new Date().toISOString();

        await executeSql(
          UPDATE_HIGHLIGHTED_VERSE,
          [data.style, data.color, updatedAt, bookNumber, chapter, verse],
          "updateHighlight"
        );

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
    []
  );

  const deleteHighlight = async (
    bookNumber: number,
    chapter: number,
    verse: number,
    uuid?: string
  ): Promise<boolean> => {
    try {
      const deletedAt = new Date().toISOString();

      // Soft delete locally
      await executeSql(
        SOFT_DELETE_HIGHLIGHTED_VERSE,
        [deletedAt, deletedAt, bookNumber, chapter, verse],
        "softDeleteHighlight"
      );

      // If we have UUID and user is authenticated, also soft delete in cloud
      if (uuid && user) {
        try {
          const cloudHighlight = await pb.collection("highlighted_verses").getFirstListItem(
            `uuid = "${uuid}" && user = "${user.id}"`
          ).catch(() => null);

          if (cloudHighlight) {
            await pb.collection("highlighted_verses").update(cloudHighlight.id, {
              deleted_at: deletedAt,
            });
            console.log(`[HighlightService] Soft deleted cloud highlight with UUID: ${uuid}`);
          }
        } catch (cloudError) {
          console.error(`[HighlightService] Error soft deleting from cloud:`, cloudError);
          // Continue - local delete succeeded
        }
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

      for (const highlight of importData.highlights) {
        await createHighlight(highlight, false);
      }
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
    getHighlightByUUID,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    importHighlights,
    exportHighlights,
  };
};
