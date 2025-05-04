import { useNoteService } from "@/services/noteService";
import { TNote } from "@/types";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useState } from "react";

type UseNotesExportImport = {
  exportNotes: (noteId?: number[]) => Promise<void>;
  importNotes: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const useNotesExportImport = (): UseNotesExportImport => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createNote, getAllNotes: fetchAllNotes,  getNotesByIds } = useNoteService();

  const getAllNotes = async () => {
    const notes = await fetchAllNotes()
    return notes as TNote[];
  };

  const saveNote = async (note: TNote) => {
    await createNote(note)
  };

  const exportNotes = async (noteIds?: number[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
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
      setError(
        "Error al guardar nota en el dispositivo: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const importNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);

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
        await saveNote(note);
      });
    } catch (err) {
      setError(
        "Error al importar notas: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exportNotes,
    importNotes,
    isLoading,
    error,
  };
};

export default useNotesExportImport;
