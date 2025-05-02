import { observable } from "@legendapp/state";

import { pb } from "@/globalConfig";
import { TNote } from "@/types";
import { authState$ } from "./authState";

export interface NotesState {
  notes: TNote[];
  isLoading: boolean;
  error: string | null;

  fetchNotes: () => Promise<TNote[]>;
  addNote: (note: TNote) => Promise<TNote | undefined>;
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
        throw new Error(
          "No hay usuario autenticado para crear/actualizar nota"
        );
      }

      try {
        const existingNote = await pb
          .collection("notes")
          .getFirstListItem(`uuid = "${note.uuid}"`);

        if (existingNote) {
          const updatedNote = await pb
            .collection("notes")
            .update(existingNote.id, {
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

          const currentNotes = notesState$.notes.get();
          const updatedNotes = currentNotes.map((mappedNote: TNote) =>
            (mappedNote.id as any) === existingNote.id ? resultNote : mappedNote
          );

          notesState$.notes.set(updatedNotes);

          return resultNote;
        }
      } catch (error: any) {
        if (error?.originalError?.response?.code === 404) {
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

          const currentNotes = notesState$.notes.get();
          notesState$.notes.set([createdNote, ...currentNotes]);

          return createdNote;
        }
      throw error;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Error al crear/actualizar nota";
      notesState$.error.set(errorMessage);
      console.error("Error adding/updating note:", error);
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
      const updatedNotes = currentNotes.filter(
        (n: TNote) => (n.id as any) !== id
      );

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

export interface NoteSelectorsState {
  selectedNoteIds: Set<number>;
  unselectNote: (id: number) => void;
  toggleNoteSelection: (id: number) => void;
  clearSelections: () => void;
  isSelected: (id: number) => boolean;
  isSelectionMode: boolean;
  toggleSelectionMode: () => void;
  selectAll: (ids: number[]) => void;
}

export const noteSelectors$ = observable<NoteSelectorsState>({
  selectedNoteIds: new Set(),
  isSelectionMode: false,
  toggleSelectionMode: () => {
    noteSelectors$.isSelectionMode.set(prev => !prev);
  },

  unselectNote: (id: number) => {
    const currentSet = noteSelectors$.selectedNoteIds.get();
    const newSet = new Set(currentSet);
    newSet.delete(id);
    noteSelectors$.selectedNoteIds.set(newSet);
  },

  toggleNoteSelection: (id: number) => {
    const currentSet = noteSelectors$.selectedNoteIds.get();
    const newSet: Set<number> = new Set(currentSet);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }

    if(newSet.size === 0) {
      noteSelectors$.isSelectionMode.set(false);
    } else if(!noteSelectors$.isSelectionMode.get()) {
      noteSelectors$.isSelectionMode.set(true);
    }
    noteSelectors$.selectedNoteIds.set(newSet);
  },

  isSelected: (id: number): boolean => {
    const currentSet = noteSelectors$.selectedNoteIds.get();
    return currentSet.has(id);
  },

  selectAll: (ids: number[]) => {
    const newSet = new Set(ids);
    noteSelectors$.selectedNoteIds.set(newSet);
    if (newSet.size > 0) {
      noteSelectors$.isSelectionMode.set(true);
    }
  },

  clearSelections: () => {
    noteSelectors$.selectedNoteIds.set(new Set<number>());
    noteSelectors$.isSelectionMode.set(false);
  },
});