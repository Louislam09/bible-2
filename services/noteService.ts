import {
  DELETE_NOTE,
  DELETE_NOTE_ALL,
  GET_ALL_NOTE,
  GET_NOTE_BY_ID,
  INSERT_INTO_NOTE,
  UPDATE_NOTE_BY_ID,
} from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import { Alert } from "react-native";

export interface NoteData {
  id?: number;
  title: string;
  note_text: string;
  created_at?: string;
  updated_at?: string;
}

export const useNoteService = () => {
  const { executeSql } = useDBContext();

  const getAllNotes = async (): Promise<NoteData[]> => {
    try {
      const notes = await executeSql<NoteData>(GET_ALL_NOTE, [], "getAllNotes");
      return notes;
    } catch (error) {
      console.error("Error al obtener notas:", error);
      Alert.alert("Error", "No se pudieron cargar las notas");
      return [];
    }
  };

  const getNoteById = async (id: number): Promise<NoteData | null> => {
    try {
      const notes = await executeSql<NoteData>(
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

  const createNote = async (data: {
    title: string;
    content: string;
  }): Promise<boolean> => {
    try {
      await executeSql(
        INSERT_INTO_NOTE,
        [data.title, data.content],
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
    data: { title: string; content: string }
  ): Promise<boolean> => {
    try {
      await executeSql(
        UPDATE_NOTE_BY_ID,
        [data.title, data.content, id],
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
  };
};
