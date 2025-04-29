import {
  DELETE_NOTE,
  DELETE_NOTE_ALL,
  GET_ALL_NOTE,
  GET_NOTE_BY_ID,
  INSERT_INTO_NOTE,
  UPDATE_NOTE_BY_ID,
} from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { TNote } from "@/types";
import * as Crypto from 'expo-crypto';
import { Alert } from "react-native";

export const useNoteService = () => {
  const { executeSql } = useDBContext();

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

  const generateAndAssignUUID = async () => {
    try {
        // First check if we've already generated UUIDs
      if (storedData$.isUUIDGenerated.get()) {
        return true;
      }

      // Get all notes that don't have a UUID or have an empty UUID
      const query = `SELECT id FROM notes WHERE uuid IS NULL OR uuid = '' OR uuid = 'null' OR uuid = 'undefined'`;
      const notes = await executeSql<TNote>(query, [], "generateUUID");
      
      if (notes.length === 0) {
        // If no notes need UUIDs, mark as generated and return
        storedData$.isUUIDGenerated.set(true);
        return true;
      }

      // For each note without a UUID, generate a new one
      for (const row of notes) {
        const newUUID = Crypto.randomUUID();
        await executeSql(`UPDATE notes SET uuid = ? WHERE id = ?`, [newUUID, row.id]);
      }

      // After generating UUIDs, update the flag
      storedData$.isUUIDGenerated.set(true);
      
      return true;
    } catch (error) {
      console.error("Error al generar UUIDs:", error);
      Alert.alert("Error", "No se pudieron generar UUIDs para las notas");
      return false;
    }
  }

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
      console.error("Error al crear nota:", error);
      Alert.alert("Error", "No se pudo crear la nota");
      return false;
    }
  };

  const updateNote = async (
    id: number,
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
    } catch (error) {
      console.error(`Error al actualizar nota con ID ${id}:`, error);
      Alert.alert("Error", "No se pudo actualizar la nota");
      return false;
    }
  };

  const deleteNote = async (id: number): Promise<boolean> => {
    try {
      await executeSql(DELETE_NOTE, [id], "deleteNote");
      return true;
    } catch (error) {
      console.error(`Error al eliminar nota con ID ${id}:`, error);
      Alert.alert("Error", "No se pudo eliminar la nota");
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

  return {
    getAllNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    deleteAllNotes,
    generateAndAssignUUID
  };
};
