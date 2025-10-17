import React, { createContext, useContext, useMemo } from "react";
import { useNoteService } from "@/services/noteService";

interface NotesContextType {
  onSaveNote: (note: any) => void;
  onDeleteNote: (id: string) => void;
  onDeleteAllNotes: () => void;
  onUpdateNote: (id: string, note: any) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { onSaveNote, onDeleteNote, onDeleteAllNotes, onUpdateNote } =
    useNoteService();

  const contextValue = useMemo(
    () => ({
      onSaveNote,
      onDeleteNote,
      onDeleteAllNotes,
      onUpdateNote,
    }),
    [onSaveNote, onDeleteNote, onDeleteAllNotes, onUpdateNote]
  );

  return (
    <NotesContext.Provider value={contextValue}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotesContext = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotesContext must be used within a NotesProvider");
  }
  return context;
};
