import { observable } from "@legendapp/state";

import { pb } from "@/globalConfig";
import { TNote } from "@/types";
import { authState$ } from "./authState";

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
        id: item.id as any,
        title: item.title,
        note_text: item.note_text,
        uuid: item.uuid,
        created_at: item.created,
        updated_at: item.updated,
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
        note_text: note.note_text,
        user: user.id,
        uuid: note.uuid,
      });

      const createdNote: TNote = {
        id: newNote.id as any,
        title: newNote.title,
        note_text: newNote.note_text,
        uuid: newNote.uuid,
        created_at: newNote.created,
        updated_at: newNote.updated,
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
        note_text: note.note_text,
      });

      const resultNote: TNote = {
        id: updatedNote.id as any,
        title: updatedNote.title,
        note_text: updatedNote.note_text,
        uuid: updatedNote.uuid,
        created_at: updatedNote.created,
        updated_at: updatedNote.updated,
      };

      // Update the local state
      const currentNotes = notesState$.notes.get();
      const updatedNotes = currentNotes.map((mappedNote: TNote) =>
        (mappedNote.id as any) === id ? resultNote : mappedNote
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
      const updatedNotes = currentNotes.filter((n: TNote) => (n.id as any) !== id);

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
    return notes.find((note: TNote) => (note.id as any) === id);
  },

  clearError: () => {
    notesState$.error.set(null);
  },
});
