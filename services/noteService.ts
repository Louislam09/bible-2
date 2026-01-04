/**
 * Note Service
 * 
 * Now uses TinyBase for local-first storage with PocketBase sync.
 * Legacy SQLite operations are kept for migration compatibility.
 */

import {
  DELETE_NOTE,
  DELETE_NOTE_ALL,
  GET_ALL_NOTE,
  GET_NOTE_BY_ID,
  GET_NOTES_BY_IDS,
  INSERT_INTO_NOTE,
  UPDATE_NOTE_BY_ID,
} from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { useNotes } from "@/hooks/useSyncedData";
import { TNote } from "@/types";
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

/**
 * Hook for note operations using TinyBase (recommended)
 */
export const useNoteService = () => {
  const { mainBibleService } = useDBContext();
  const { executeSql } = mainBibleService;
  const {
    notes,
    notesList,
    createNote: tinyCreateNote,
    updateNote: tinyUpdateNote,
    deleteNote: tinyDeleteNote,
    getNoteByUuid,
    isLoading,
  } = useNotes();

  /**
   * Get all notes from TinyBase
   */
  const getAllNotes = (): TNote[] => {
    return notesList.map((note) => ({
      id: note.uuid as any, // Use uuid as id for compatibility
      title: note.title,
      note_text: note.note_text,
      uuid: note.uuid,
      created_at: new Date(note.created_at).toISOString(),
      updated_at: new Date(note.updated_at).toISOString(),
    }));
  };

  /**
   * Get a note by its UUID
   */
  const getNoteById = (id: number | string): TNote | null => {
    const uuid = String(id);
    const note = getNoteByUuid(uuid);
    if (note) {
      return {
        id: uuid as any,
        title: note.title,
        note_text: note.note_text,
        uuid,
        created_at: new Date(note.created_at).toISOString(),
        updated_at: new Date(note.updated_at).toISOString(),
      };
    }
    return null;
  };

  /**
   * Get notes by multiple IDs/UUIDs
   */
  const getNotesByIds = (ids: (number | string)[]): TNote[] | null => {
    if (ids.length === 0) return null;

    const result: TNote[] = [];
    for (const id of ids) {
      const uuid = String(id);
      const note = getNoteByUuid(uuid);
      if (note) {
        result.push({
          id: uuid as any,
          title: note.title,
          note_text: note.note_text,
          uuid,
          created_at: new Date(note.created_at).toISOString(),
          updated_at: new Date(note.updated_at).toISOString(),
        });
      }
    }

    return result.length > 0 ? result : null;
  };

  /**
   * Create a new note
   */
  const createNote = (data: Partial<TNote>): TNote | null => {
    const uuid = tinyCreateNote(data.title || '', data.note_text || '');
    if (uuid) {
      const note = getNoteByUuid(uuid);
      if (note) {
        return {
          id: uuid as any,
          title: note.title,
          note_text: note.note_text,
          uuid,
          created_at: new Date(note.created_at).toISOString(),
          updated_at: new Date(note.updated_at).toISOString(),
        };
      }
    }
    return null;
  };

  /**
   * Update an existing note
   */
  const updateNote = (
    id: number | string,
    data: Partial<TNote>
  ): TNote | null => {
    const uuid = String(id);
    tinyUpdateNote(uuid, data.title || '', data.note_text || '');

    const note = getNoteByUuid(uuid);
    if (note) {
      return {
        id: uuid as any,
        title: note.title,
        note_text: note.note_text,
        uuid,
        created_at: new Date(note.created_at).toISOString(),
        updated_at: new Date(note.updated_at).toISOString(),
      };
    }
    return null;
  };

  /**
   * Delete a note
   */
  const deleteNote = (data: Partial<TNote>): boolean => {
    const uuid = data.uuid || String(data.id);
    tinyDeleteNote(uuid);
    return true;
  };

  /**
   * Delete all notes
   */
  const deleteAllNotes = (): boolean => {
    // Delete each note individually
    for (const uuid of Object.keys(notes)) {
      tinyDeleteNote(uuid);
    }
    return true;
  };

  /**
   * Export notes to JSON file
   */
  const exportNotes = async (noteIds?: number[]) => {
    try {
      const allNotes = getAllNotes();
      const notesToExport = noteIds
        ? allNotes.filter((n) => n.id && noteIds.includes(n.id as any))
        : allNotes;

      const exportData = {
        version: "1.0",
        exportDate: new Date().toString(),
        notes: notesToExport,
      };

      const fileUri = `${FileSystem.documentDirectory}bible_notes_export.json`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(exportData, null, 2)
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Guardar en el dispositivo",
          UTI: "public.json",
        });
      }
    } catch (err) {
      console.log(
        "Error al guardar nota en el dispositivo: " +
        (err instanceof Error ? err.message : String(err))
      );
    }
  };

  /**
   * Import notes from JSON file
   */
  const importNotes = async () => {
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

      if (!importData.version || !Array.isArray(importData.notes)) {
        throw new Error("Formato de archivo de importación no válido");
      }

      for (const note of importData.notes) {
        createNote(note);
      }
    } catch (err) {
      console.log(
        "Error al importar notas: " +
        (err instanceof Error ? err.message : String(err))
      );
    }
  };

  return {
    // Data
    notes,
    notesList,
    isLoading,
    // Methods
    getAllNotes,
    getNoteById,
    getNotesByIds,
    createNote,
    updateNote,
    deleteNote,
    deleteAllNotes,
    // Import/Export
    importNotes,
    exportNotes,
  };
};

/**
 * Legacy hook that uses direct SQLite access
 * @deprecated Use useNoteService instead
 */
export const useLegacyNoteService = () => {
  const { mainBibleService } = useDBContext();
  const { executeSql } = mainBibleService;

  const getAllNotes = async (): Promise<TNote[]> => {
    try {
      const notes = await executeSql<TNote>(GET_ALL_NOTE, [], "getAllNotes");
      return notes;
    } catch (error) {
      console.error("Error al obtener notas:", error);
      return [];
    }
  };

  const getNoteById = async (id: number): Promise<TNote | null> => {
    try {
      const notes = await executeSql<TNote>(
        GET_NOTE_BY_ID,
        [id],
        "getNoteById"
      );
      return notes.length > 0 ? notes[0] : null;
    } catch (error) {
      console.error(`Error al obtener nota con ID ${id}:`, error);
      return null;
    }
  };

  const getNotesByIds = async (ids: number[]): Promise<TNote[] | null> => {
    if (ids.length === 0) return null;

    const placeholders = ids.map(() => "?").join(", ");
    const query = `${GET_NOTES_BY_IDS} (${placeholders})`;

    try {
      const notes = await executeSql<TNote>(query, ids, "getNoteById");
      return notes.length > 0 ? notes : null;
    } catch (error) {
      console.error(`Error al obtener notas con IDs ${ids}:`, error);
      return null;
    }
  };

  const createNote = async (data: Partial<TNote>): Promise<TNote | null> => {
    try {
      const newUUID = data.uuid || Crypto.randomUUID();
      const createdAt = data.created_at || new Date().toISOString();
      const updatedAt = data.updated_at || new Date().toISOString();

      await executeSql(
        INSERT_INTO_NOTE,
        [newUUID, data.title, data.note_text, createdAt, updatedAt],
        "createNote"
      );

      const insertedNotes = await executeSql<TNote>(
        `SELECT * FROM notes WHERE uuid = ?`,
        [newUUID],
        "getCreatedNote"
      );

      if (insertedNotes.length > 0) {
        return insertedNotes[0];
      }

      return {
        id: 0,
        title: data.title || '',
        note_text: data.note_text || '',
        uuid: newUUID,
        created_at: createdAt,
        updated_at: updatedAt,
      };
    } catch (error) {
      console.error("Error al crear nota:", error);
      return null;
    }
  };

  const updateNote = async (
    id: number | string,
    data: Partial<TNote>
  ): Promise<TNote | null> => {
    try {
      const updatedAt = data.updated_at || new Date().toISOString();
      await executeSql(
        UPDATE_NOTE_BY_ID,
        [data.title, data.note_text, updatedAt, id],
        "updateNote"
      );

      const updatedNotes = await executeSql<TNote>(
        GET_NOTE_BY_ID,
        [id],
        "getUpdatedNote"
      );

      if (updatedNotes.length > 0) {
        return updatedNotes[0];
      }

      return null;
    } catch (error: any) {
      console.error(`Error al actualizar nota con ID ${id}:`, error.message);
      return null;
    }
  };

  const deleteNote = async (data: Partial<TNote>): Promise<boolean> => {
    try {
      await executeSql(DELETE_NOTE, [data.id], "deleteNote");
      return true;
    } catch (error) {
      console.error(`Error al eliminar nota con ID ${data.id}:`, error);
      return false;
    }
  };

  const deleteAllNotes = async (): Promise<boolean> => {
    try {
      await executeSql(DELETE_NOTE_ALL, [], "deleteAllNotes");
      return true;
    } catch (error) {
      console.error("Error al eliminar todas las notas:", error);
      return false;
    }
  };

  return {
    getAllNotes,
    getNoteById,
    getNotesByIds,
    createNote,
    updateNote,
    deleteNote,
    deleteAllNotes,
  };
};
