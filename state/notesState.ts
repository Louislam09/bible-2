import { observable } from "@legendapp/state";
import { pb } from "@/globalConfig";
import { authState$ } from "./authState";

// Define the note interface
export interface Note {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  verseReference?: string;
  created?: string;
  updated?: string;
}

// Define the notes state interface
export interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  
  // Methods
  fetchNotes: () => Promise<Note[]>;
  addNote: (note: Note) => Promise<Note>;
  updateNote: (id: string, note: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<boolean>;
  getNoteById: (id: string) => Note | undefined;
  getNotesByTag: (tag: string) => Note[];
  getNotesByVerseReference: (reference: string) => Note[];
  clearError: () => void;
}

// Create the observable notes state
export const notesState$ = observable<NotesState>({
  notes: [],
  isLoading: false,
  error: null,
  
  // Fetch all notes for the current user
  fetchNotes: async () => {
    try {
      notesState$.isLoading.set(true);
      notesState$.error.set(null);
      
      const user = authState$.user.get();
      
      if (!user) {
        throw new Error("No hay usuario autenticado para obtener notas");
      }
      
      const result = await pb.collection('notes').getList(1, 100, {
        filter: `user = "${user.id}"`,
        sort: '-created',
      });
      
      const notes = result.items.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        tags: item.tags || [],
        verseReference: item.verseReference || '',
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
  
  // Add a new note
  addNote: async (note: Note) => {
    try {
      notesState$.isLoading.set(true);
      notesState$.error.set(null);
      
      const user = authState$.user.get();
      
      if (!user) {
        throw new Error("No hay usuario autenticado para crear nota");
      }
      
      const newNote = await pb.collection('notes').create({
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        verseReference: note.verseReference || '',
        user: user.id,
      });
      
      const createdNote: Note = {
        id: newNote.id,
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags || [],
        verseReference: newNote.verseReference || '',
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
  
  // Update an existing note
  updateNote: async (id: string, note: Partial<Note>) => {
    try {
      notesState$.isLoading.set(true);
      notesState$.error.set(null);
      
      const user = authState$.user.get();
      
      if (!user) {
        throw new Error("No hay usuario autenticado para actualizar nota");
      }
      
      const updatedNote = await pb.collection('notes').update(id, {
        title: note.title,
        content: note.content,
        tags: note.tags,
        verseReference: note.verseReference,
      });
      
      const resultNote: Note = {
        id: updatedNote.id,
        title: updatedNote.title,
        content: updatedNote.content,
        tags: updatedNote.tags || [],
        verseReference: updatedNote.verseReference || '',
        created: updatedNote.created,
        updated: updatedNote.updated,
      };
      
      // Update the local state
      const currentNotes = notesState$.notes.get();
      const updatedNotes = currentNotes.map((n: Note) => 
        n.id === id ? resultNote : n
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
  
  // Delete a note
  deleteNote: async (id: string) => {
    try {
      notesState$.isLoading.set(true);
      notesState$.error.set(null);
      
      const user = authState$.user.get();
      
      if (!user) {
        throw new Error("No hay usuario autenticado para eliminar nota");
      }
      
      await pb.collection('notes').delete(id);
      
      // Update the local state
      const currentNotes = notesState$.notes.get();
      const updatedNotes = currentNotes.filter((n: Note) => n.id !== id);
      
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
  
  // Get a note by ID
  getNoteById: (id: string): Note | undefined => {
    const notes = notesState$.notes.get();
    return notes.find((note: Note) => note.id === id);
  },
  
  // Get notes by tag
  getNotesByTag: (tag: string) => {
    const notes = notesState$.notes.get();
    return notes.filter((note: Note) => note.tags?.includes(tag));
  },
  
  // Get notes by verse reference
  getNotesByVerseReference: (reference: string) => {
    const notes = notesState$.notes.get();
    return notes.filter((note: Note) => note.verseReference === reference);
  },
  
  // Clear any error
  clearError: () => {
    notesState$.error.set(null);
  }
});
