import {
  DELETE_NOTE_ALL,
  GET_ALL_NOTE,
  GET_NOTE_BY_ID,
  GET_NOTES_BY_IDS,
  INSERT_INTO_NOTE,
  SOFT_DELETE_NOTE,
  UPDATE_NOTE_BY_ID,
} from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { pb } from "@/globalConfig";
import { authState$ } from "@/state/authState";
import { TNote } from "@/types";
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useCallback } from "react";

export const useNoteService = () => {
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
      const notes = await executeSql<TNote>(
        query,
        ids,
        "getNoteById"
      );
      console.log('getNotesByIds - notes', notes.length, ids)
      return notes.length > 0 ? notes : null;
    } catch (error) {
      console.error(`Error al obtener notas con IDs ${ids}:`, error);
      return null;
    }
  };

  const createNote = async (data: Partial<TNote>): Promise<boolean> => {
    try {
      const newUUID = data.uuid || Crypto.randomUUID();
      const createdAt = data.created_at || new Date().toISOString();
      const updatedAt = data.updated_at || new Date().toISOString();
      await executeSql(
        INSERT_INTO_NOTE,
        [newUUID, data.title, data.note_text, createdAt, updatedAt],
        "createNote"
      );

      return true;
    } catch (error) {
      console.log("Error al crear nota:", error);
      return false;
    }
  };

  const updateNote = useCallback(async (
    id: number | string,
    data: Partial<TNote>
  ): Promise<boolean> => {
    try {
      const updatedAt = data.updated_at || new Date().toISOString();
      await executeSql(
        UPDATE_NOTE_BY_ID,
        [data.title, data.note_text, updatedAt, id],
        "updateNote"
      );

      return true;
    } catch (error: any) {
      console.error(`Error al actualizar nota con ID ${id}:`, error.message, error.originalError);
      return false;
    }
  }, []);

  const deleteNote = async (data: Partial<TNote>): Promise<boolean> => {
    try {
      const deletedAt = new Date().toISOString();
      
      // Soft delete locally - set deleted_at timestamp instead of removing
      await executeSql(
        SOFT_DELETE_NOTE,
        [deletedAt, deletedAt, data.id],
        "softDeleteNote"
      );

      // If note has UUID and user is authenticated, also soft delete in cloud
      if (data.uuid) {
        const user = authState$.user.get();
        if (user) {
          try {
            // Find the cloud note by UUID
            const cloudNote = await pb.collection("notes").getFirstListItem(
              `uuid = "${data.uuid}" && user = "${user.id}"`
            ).catch(() => null);

            if (cloudNote) {
              // Soft delete in cloud by setting deleted_at
              await pb.collection("notes").update(cloudNote.id, {
                deleted_at: deletedAt,
              });
              console.log(`[Delete] Soft deleted cloud note with UUID: ${data.uuid}`);
            }
          } catch (cloudError) {
            // Log but don't fail - local delete already succeeded
            console.error(`[Delete] Error soft deleting from cloud:`, cloudError);
          }
        }
      }

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

  const exportNotes = async (noteIds?: number[]) => {
    try {
      const notes = noteIds ? await getNotesByIds(noteIds) : await getAllNotes();

      const exportData = {
        version: "1.0",
        exportDate: new Date().toString(),
        notes,
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

      importData.notes.forEach(async (note: TNote) => {
        await createNote(note);
      });
    } catch (err) {
      console.log(
        "Error al importar notas: " +
        (err instanceof Error ? err.message : String(err))
      );
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
    importNotes,
    exportNotes
  };
};
