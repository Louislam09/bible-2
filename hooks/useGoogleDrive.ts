import { useEffect, useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import { google } from "googleapis";

// Definición de tipos
type Note = {
  id: string;
  name: string;
  content: string;
};

type ConflictResolution = "keep_local" | "keep_remote" | "keep_both";

type ResolveConflict = (
  noteId: string,
  localContent: string,
  remoteContent: string
) => Promise<ConflictResolution>;

export function useGoogleDrive() {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Configurar la autenticación de Google
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "TU_CLIENT_ID",
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      setUserToken(response.authentication.accessToken);
    }
  }, [response]);

  // Función para iniciar sesión
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      await promptAsync();
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar conflictos
  const handleConflict = async (
    noteId: string,
    noteContent: string,
    remoteContent: string,
    resolveConflict: ResolveConflict
  ): Promise<void> => {
    const userDecision = await resolveConflict(
      noteId,
      noteContent,
      remoteContent
    );

    switch (userDecision) {
      case "keep_local":
        await uploadOrUpdateNote(noteId, noteContent);
        break;
      case "keep_remote":
        break;
      case "keep_both":
        await uploadOrUpdateNote(`${noteId}_local`, noteContent);
        break;
      default:
        console.log("Conflicto no resuelto");
    }
  };

  // Función para subir o actualizar una nota en Google Drive
  const uploadOrUpdateNote = async (
    noteId: string,
    noteContent: string
  ): Promise<void> => {
    if (!userToken) return;
    setLoading(true);

    try {
      const drive = google.drive({ version: "v3", auth: userToken });

      const response = await drive.files.list({
        q: `name='nota-${noteId}.txt' and trashed=false`,
        fields: "files(id, name)",
      });

      if (response.data.files.length > 0) {
        const fileId = response.data.files[0].id;
        await drive.files.update({
          fileId: fileId,
          media: {
            mimeType: "text/plain",
            body: noteContent,
          },
        });
      } else {
        await drive.files.create({
          resource: {
            name: `nota-${noteId}.txt`,
            mimeType: "text/plain",
          },
          media: {
            mimeType: "text/plain",
            body: noteContent,
          },
        });
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Función para sincronizar (descargar) las notas desde Google Drive
  const syncNotesFromDrive = async (
    resolveConflict: ResolveConflict
  ): Promise<void> => {
    if (!userToken) return;
    setLoading(true);

    try {
      const drive = google.drive({ version: "v3", auth: userToken });
      const response = await drive.files.list({
        q: "mimeType='text/plain' and trashed=false",
        fields: "files(id, name)",
      });

      const syncedNotes: Note[] = [];
      for (const file of response.data.files) {
        const noteResponse = await drive.files.get({
          fileId: file.id,
          alt: "media",
        });
        const remoteContent = noteResponse.data;

        const localNote = notes.find((note) => note.name === file.name);
        if (localNote && localNote.content !== remoteContent) {
          await handleConflict(
            file.name,
            localNote.content,
            remoteContent,
            resolveConflict
          );
        } else {
          syncedNotes.push({
            id: file.id,
            name: file.name,
            content: remoteContent,
          });
        }
      }

      setNotes(syncedNotes);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    uploadOrUpdateNote,
    syncNotesFromDrive,
    notes,
    loading,
    error,
  };
}
