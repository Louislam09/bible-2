import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as SQLite from "expo-sqlite";
import { useDBContext } from '@/context/databaseContext';
import { GET_ALL_NOTE, INSERT_IMPORTED_INTO_NOTE } from '@/constants/Queries';

type Note = {
  id: number;
  title: string;
  note_text: string;
  created_at: string;
  updated_at: string | null;
};

type UseNotesExportImport = {
  exportNotes: () => Promise<void>;
  importNotes: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const useNotesExportImport = (): UseNotesExportImport => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { myBibleDB, executeSql } = useDBContext();

  const getAllNotes = async () => {
    if (!myBibleDB || !executeSql) return;
    const notes = await executeSql(myBibleDB, GET_ALL_NOTE, []);
    return notes as Note[]
  };

  const saveNote = async (note: Note) => {
    if (!myBibleDB || !executeSql) return;
    await executeSql(myBibleDB, INSERT_IMPORTED_INTO_NOTE,
      [
        note.title,
        note.note_text,
        note.created_at,
        note.updated_at
      ]);
  };

  const exportNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all notes from the database
      const notes = await getAllNotes();

      // Create export data with metadata
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        notes,
      };

      // Create temporary file
      const fileUri = `${FileSystem.documentDirectory}bible_notes_export.json`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(exportData, null, 2)
      );

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Bible Notes',
          UTI: 'public.json'
        });
      }
    } catch (err) {
      setError('Failed to export notes: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const importNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Pick a document
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      if (result.canceled) {
        return;
      }

      // Read the file
      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const importData = JSON.parse(fileContent);

      // Validate the import data
      if (!importData.version || !Array.isArray(importData.notes)) {
        throw new Error('Invalid import file format');
      }

      importData.notes.forEach(async (note: Note) => {
        await saveNote(note);
      });

    } catch (err) {
      setError('Failed to import notes: ' + (err instanceof Error ? err.message : String(err)));
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