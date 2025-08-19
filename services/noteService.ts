import {
  DELETE_NOTE,
  DELETE_NOTE_ALL,
  GET_ALL_NOTE,
  GET_NOTE_BY_ID,
  GET_NOTES_BY_IDS,
  INSERT_INTO_NOTE,
  UPDATE_NOTE_BY_ID,
} from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import { useNetwork } from "@/context/NetworkProvider";
import { pb } from "@/globalConfig";
import { authState$ } from "@/state/authState";
import { notesState$ } from "@/state/notesState";
import { TNote } from "@/types";
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

export const useNoteService = () => {
  const { executeSql } = useDBContext();
  const netInfo = useNetwork();
  const { isConnected } = netInfo!
  const user = authState$.user.get();

  const getAllNotes = async (): Promise<TNote[]> => {
    try {
      const notes = await executeSql<TNote>(GET_ALL_NOTE, [], "getAllNotes");
      return notes;
    } catch (error) {
      console.error("Error al obtener notas:", error);
      Alert.alert("Error", "No se pudieron cargar las notas");
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
      Alert.alert("Error", "No se pudo cargar la nota");
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
      Alert.alert("Error", "No se pudieron cargar las notas");
      return null;
    }
  };

  const createNote = async (data: Partial<TNote>, sendToCloud: boolean = true): Promise<boolean> => {
    try {
      const newUUID = data.uuid || Crypto.randomUUID();
      const createdAt = data.created_at || new Date().toISOString();
      const updatedAt = data.updated_at || new Date().toISOString();
      await executeSql(
        INSERT_INTO_NOTE,
        [newUUID, data.title, data.note_text, createdAt, updatedAt],
        "createNote"
      );
      const createdNotes = {
        id: 0,
        title: data.title || '',
        note_text: data.note_text || '',
        uuid: newUUID,
        created_at: createdAt,
        updated_at: updatedAt,
      }


      if (isConnected && sendToCloud && user) {
        await notesState$.addNote(createdNotes)
      }

      return true;
    } catch (error) {
      console.log("Error al crear nota:", error);
      Alert.alert("Error", "No se pudo crear la nota");
      return false;
    }
  };

  const updateNote = async (
    id: number | string,
    data: Partial<TNote>,
    sendToCloud: boolean = false
  ): Promise<boolean> => {
    try {
      const updatedAt = data.updated_at || new Date().toISOString();
      await executeSql(
        UPDATE_NOTE_BY_ID,
        [data.title, data.note_text, updatedAt, id],
        "updateNote"
      );

      if (isConnected && sendToCloud && user) {
        const existing = await pb.collection("notes").getFirstListItem(`uuid = "${data.uuid}"`);
        await notesState$.updateNote(existing.id, {
          title: data.title || '',
          note_text: data.note_text || '',
        })
      }

      return true;
    } catch (error: any) {
      console.error(`Error al actualizar nota con ID ${data.uuid}:`, error.message, error.originalError);
      Alert.alert("Error", "No se pudo actualizar la nota");
      return false;
    }
  };

  const deleteNote = async (data: Partial<TNote>): Promise<boolean> => {
    try {
      await executeSql(DELETE_NOTE, [data.id], "deleteNote");

      if (isConnected) {
        const existing = await pb.collection("notes").getFirstListItem(`uuid = "${data.uuid}"`);
        await notesState$.deleteNote(existing.id)
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
      Alert.alert("Error", "No se pudieron eliminar todas las notas");
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
    } finally {
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
        await createNote(note, false);
      });
    } catch (err) {
      console.log(
        "Error al importar notas: " +
        (err instanceof Error ? err.message : String(err))
      );
    } finally {
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
