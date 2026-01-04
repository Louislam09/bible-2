/**
 * Highlight Service
 * 
 * Now uses TinyBase for local-first storage with PocketBase sync.
 * Legacy SQLite operations are kept for migration compatibility.
 */

import {
  DELETE_HIGHLIGHTED_VERSE,
  GET_ALL_HIGHLIGHTED_VERSES,
  GET_ALL_HIGHLIGHTED_VERSES_BY_BOOK_AND_CHAPTER,
  INSERT_HIGHLIGHTED_VERSE,
  UPDATE_HIGHLIGHTED_VERSE,
} from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { useHighlights } from "@/hooks/useSyncedData";
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

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

/**
 * Hook for highlight operations using TinyBase (recommended)
 */
export const useHighlightService = () => {
  const { executeSql } = useDBContext();
  const {
    highlights,
    highlightsList,
    addHighlight: tinyAddHighlight,
    updateHighlight: tinyUpdateHighlight,
    removeHighlight: tinyRemoveHighlight,
    removeHighlightByVerse,
    findHighlight,
    getHighlightsByChapter,
    isLoading,
  } = useHighlights();

  /**
   * Get all highlighted verses from TinyBase
   */
  const getAllHighlightedVerses = (): THighlightedVerse[] => {
    return highlightsList.map((h) => ({
      id: undefined,
      book_number: h.book_number,
      chapter: h.chapter,
      verse: h.verse,
      style: h.style,
      color: h.color,
      uuid: h.uuid,
      created_at: h.updated_at,
    }));
  };

  /**
   * Get highlighted verses by book and chapter
   */
  const getAllHighlightedVersesByBookAndChapter = (
    bookNumber: number,
    chapter: number
  ): THighlightedVerse[] => {
    const chapterHighlights = getHighlightsByChapter(bookNumber, chapter);
    return Object.entries(chapterHighlights).map(([uuid, h]) => ({
      id: undefined,
      book_number: h.book_number,
      chapter: h.chapter,
      verse: h.verse,
      style: h.style,
      color: h.color,
      uuid,
      created_at: h.updated_at,
    }));
  };

  /**
   * Create a new highlight
   */
  const createHighlight = (
    data: Partial<THighlightedVerse>
  ): string | null => {
    if (!data.book_number || !data.chapter || !data.verse || !data.style || !data.color) {
      console.error("Missing required data for highlight");
      return null;
    }

    return tinyAddHighlight(
      data.book_number,
      data.chapter,
      data.verse,
      data.style,
      data.color
    );
  };

  /**
   * Update an existing highlight
   */
  const updateHighlight = (
    bookNumber: number,
    chapter: number,
    verse: number,
    data: Partial<Pick<THighlightedVerse, 'style' | 'color'>>
  ): boolean => {
    if (!data.style || !data.color) {
      console.error("Style and color required for update");
      return false;
    }

    const existing = findHighlight(bookNumber, chapter, verse);
    if (existing) {
      tinyUpdateHighlight(existing.uuid, data.style, data.color);
      return true;
    }

    return false;
  };

  /**
   * Delete a highlight
   */
  const deleteHighlight = (
    bookNumber: number,
    chapter: number,
    verse: number
  ): boolean => {
    removeHighlightByVerse(bookNumber, chapter, verse);
    return true;
  };

  /**
   * Check if a verse is highlighted
   */
  const isHighlighted = (
    bookNumber: number,
    chapter: number,
    verse: number
  ): THighlightedVerse | null => {
    const found = findHighlight(bookNumber, chapter, verse);
    if (found) {
      return {
        id: undefined,
        book_number: found.record.book_number,
        chapter: found.record.chapter,
        verse: found.record.verse,
        style: found.record.style,
        color: found.record.color,
        uuid: found.uuid,
        created_at: found.record.updated_at,
      };
    }
    return null;
  };

  /**
   * Export highlights to JSON file
   */
  const exportHighlights = async (highlightIds?: number[]) => {
    try {
      const allHighlights = getAllHighlightedVerses();
      const highlightsToExport = highlightIds
        ? allHighlights.filter((h) => h.id && highlightIds.includes(h.id))
        : allHighlights;

      const exportData = {
        version: "1.0",
        exportDate: new Date().toString(),
        highlights: highlightsToExport,
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

  /**
   * Import highlights from JSON file
   */
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
        createHighlight(highlight);
      }
    } catch (err) {
      console.log(
        "Error al importar destacados: " +
        (err instanceof Error ? err.message : String(err))
      );
    }
  };

  return {
    // Data
    highlights,
    highlightsList,
    isLoading,
    // Methods
    getAllHighlightedVerses,
    getAllHighlightedVersesByBookAndChapter,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    isHighlighted,
    findHighlight,
    removeHighlightByUuid: tinyRemoveHighlight,
    // Import/Export
    importHighlights,
    exportHighlights,
  };
};

/**
 * Legacy hook that uses direct SQLite access
 * @deprecated Use useHighlightService instead
 */
export const useLegacyHighlightService = () => {
  const { executeSql } = useDBContext();

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
      return highlights;
    } catch (error) {
      console.error("Error al obtener versículos destacados:", error);
      return [];
    }
  };

  const createHighlight = async (
    data: Partial<THighlightedVerse>
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

      return true;
    } catch (error) {
      console.error("Error al crear destacado:", error);
      return false;
    }
  };

  const updateHighlight = async (
    bookNumber: number,
    chapter: number,
    verse: number,
    data: Partial<Pick<THighlightedVerse, 'style' | 'color'>>
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

      return true;
    } catch (error: any) {
      console.error(
        `Error al actualizar destacado (${bookNumber}:${chapter}:${verse}):`,
        error.message
      );
      return false;
    }
  };

  const deleteHighlight = async (
    bookNumber: number,
    chapter: number,
    verse: number
  ): Promise<boolean> => {
    try {
      await executeSql(
        DELETE_HIGHLIGHTED_VERSE,
        [bookNumber, chapter, verse],
        "deleteHighlight"
      );

      return true;
    } catch (error) {
      console.error(
        `Error al eliminar destacado (${bookNumber}:${chapter}:${verse}):`,
        error
      );
      return false;
    }
  };

  return {
    getAllHighlightedVerses,
    getAllHighlightedVersesByBookAndChapter,
    createHighlight,
    updateHighlight,
    deleteHighlight,
  };
};
