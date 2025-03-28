import { observable } from "@legendapp/state";

import { pb } from "@/globalConfig";
import { authState$ } from "./authState";

export interface TNote {
  id: string;
  title: string;
  content: string;
  created?: string;
  updated?: string;
}

export interface NotesState {
  notes: TNote[];
  isLoading: boolean;
  error: string | null;

  fetchNotes: () => Promise<TNote[]>;
  addNote: (note: TNote) => Promise<TNote>;
  updateNote: (id: string, note: Partial<TNote>) => Promise<TNote>;
  deleteNote: (id: string) => Promise<boolean>;
  getNoteById: (id: string) => TNote | undefined;
  clearError: () => void;
}

export const notesState$ = observable<NotesState>({
  notes: [],
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    try {
      notesState$.isLoading.set(true);
      notesState$.error.set(null);

      const user = authState$.user.get();

      if (!user) {
        throw new Error("No hay usuario autenticado para obtener notas");
      }

      const result = await pb.collection("notes").getList(1, 100, {
        filter: `user = "${user.id}"`,
        sort: "-created",
      });

      const notes = result.items.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        tags: item.tags || [],
        verseReference: item.verseReference || "",
        created: item.created,
        updated: item.updated,
      }));

      notesState$.notes.set(notes);
      return notes;
    } catch (error: any) {
      const errorMessage = error.message || "Error al obtener notas";
      notesState$.error.set(errorMessage);
      console.error("Error fetching notes:", error);
      return [];
    } finally {
      notesState$.isLoading.set(false);
    }
  },

  addNote: async (note: TNote) => {
    try {
      notesState$.isLoading.set(true);
      notesState$.error.set(null);

      const user = authState$.user.get();

      if (!user) {
        throw new Error("No hay usuario autenticado para crear nota");
      }

      const newNote = await pb.collection("notes").create({
        title: note.title,
        content: note.content,
        user: user.id,
      });

      const createdNote: TNote = {
        id: newNote.id,
        title: newNote.title,
        content: newNote.content,
        created: newNote.created,
        updated: newNote.updated,
      };

      // Update the local state
      const currentNotes = notesState$.notes.get();
      notesState$.notes.set([createdNote, ...currentNotes]);

      return createdNote;
    } catch (error: any) {
      const errorMessage = error.message || "Error al crear nota";
      notesState$.error.set(errorMessage);
      console.error("Error adding note:", error);
      throw error;
    } finally {
      notesState$.isLoading.set(false);
    }
  },

  updateNote: async (id: string, note: Partial<TNote>) => {
    try {
      notesState$.isLoading.set(true);
      notesState$.error.set(null);

      const user = authState$.user.get();

      if (!user) {
        throw new Error("No hay usuario autenticado para actualizar nota");
      }

      const updatedNote = await pb.collection("notes").update(id, {
        title: note.title,
        content: note.content,
      });

      const resultNote: TNote = {
        id: updatedNote.id,
        title: updatedNote.title,
        content: updatedNote.content,
        created: updatedNote.created,
        updated: updatedNote.updated,
      };

      // Update the local state
      const currentNotes = notesState$.notes.get();
      const updatedNotes = currentNotes.map((mappedNote: TNote) =>
        mappedNote.id === id ? resultNote : mappedNote
      );

      notesState$.notes.set(updatedNotes);

      return resultNote;
    } catch (error: any) {
      const errorMessage = error.message || "Error al actualizar nota";
      notesState$.error.set(errorMessage);
      console.error("Error updating note:", error);
      throw error;
    } finally {
      notesState$.isLoading.set(false);
    }
  },

  deleteNote: async (id: string) => {
    try {
      notesState$.isLoading.set(true);
      notesState$.error.set(null);

      const user = authState$.user.get();

      if (!user) {
        throw new Error("No hay usuario autenticado para eliminar nota");
      }

      await pb.collection("notes").delete(id);

      // Update the local state
      const currentNotes = notesState$.notes.get();
      const updatedNotes = currentNotes.filter((n: TNote) => n.id !== id);

      notesState$.notes.set(updatedNotes);

      return true;
    } catch (error: any) {
      const errorMessage = error.message || "Error al eliminar nota";
      notesState$.error.set(errorMessage);
      console.error("Error deleting note:", error);
      return false;
    } finally {
      notesState$.isLoading.set(false);
    }
  },

  getNoteById: (id: string): TNote | undefined => {
    const notes = notesState$.notes.get();
    return notes.find((note: TNote) => note.id === id);
  },

  clearError: () => {
    notesState$.error.set(null);
  },
});
