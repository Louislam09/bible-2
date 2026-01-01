import { GET_ALL_NOTE } from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { pb } from "@/globalConfig";
import { authState$ } from "@/state/authState";
import { bibleState$ } from "@/state/bibleState";
import { notesState$ } from "@/state/notesState";
import { TNote } from "@/types";
import { Alert } from "react-native";

export const useSyncNotes = () => {
    const { executeSql } = useDBContext();

    const fetchLocalNotes = async (): Promise<TNote[]> => {
        try {
            const notes = await executeSql<TNote>(GET_ALL_NOTE, [], "getAllNotes");
            return notes;
        } catch (error) {
            console.error("Error fetching local notes:", error);
            return [];
        }
    };

    const fetchCloudNotes = async (): Promise<TNote[]> => {
        try {
            const user = authState$.user.get();
            if (!user) {
                throw new Error("No hay usuario autenticado para obtener notas");
            }

            const result = await pb.collection("notes").getList(1, 100, {
                filter: `user = "${user.id}"`,
                sort: "-created",
            });

            const notesMapped = result.items.map((item) => ({
                id: item.id as any,
                title: item.title,
                note_text: item.note_text,
                uuid: item.uuid,
                created_at: item.created,
                updated_at: item.updated,
            }));

            return notesMapped;
        } catch (error) {
            console.error("Error fetching cloud notes:", error);
            return [];
        }
    };

    const uploadNoteToCloud = async (note: TNote) => {
        try {
            const resultNote = await notesState$.addNote(note);
            const uuid = resultNote?.uuid || note.uuid

            await executeSql(
                `UPDATE notes SET uuid = ? WHERE id = ?`,
                [uuid, note.id],
                "uploadNote-updateUUID"
            );
        } catch (error: any) {
            console.error("Error uploading note:", error.message, error.originalError);
        }
    };

    const updateNoteInCloud = async (note: TNote) => {
        try {
            const updatedAt = new Date().toISOString();
            const id = note.id as any

            await pb.collection("notes").update(id, {
                title: note.title,
                note_text: note.note_text,
                updated_at: updatedAt,
            });

            await executeSql(
                `UPDATE notes SET updated_at = ? WHERE uuid = ?`,
                [updatedAt, note.uuid],
                "updateNote-syncUpdatedAt"
            );
        } catch (error) {
            console.error("Error updating cloud note:", error);
        }
    };

    const syncNotes = async () => {
        try {
            bibleState$.isSyncingNotes.set(true);
            const localNotes = await fetchLocalNotes();
            const cloudNotes = await fetchCloudNotes();

            for (const localNote of localNotes) {
                const matchingCloudNote = cloudNotes.find(
                    (cloudNote) => cloudNote.uuid === localNote.uuid || cloudNote.title.toLowerCase() === localNote.title.toLowerCase()
                );

                if (matchingCloudNote) {
                    // Always ensure UUID is synced locally
                    await executeSql(
                        `UPDATE notes SET uuid = ? WHERE id = ?`,
                        [matchingCloudNote.uuid, localNote.id],
                        "syncNotes-updateUUID"
                    );

                    const localUpdated = new Date(localNote.updated_at || '').getTime();
                    const cloudUpdated = new Date(matchingCloudNote.updated_at || '').getTime();

                    if (cloudUpdated > localUpdated) {
                        // Cloud version is newer, update local
                        await executeSql(
                            `UPDATE notes SET title = ?, note_text = ?, updated_at = ?, created_at = ? WHERE uuid = ?`,
                            [
                                matchingCloudNote.title,
                                matchingCloudNote.note_text,
                                matchingCloudNote.updated_at,
                                matchingCloudNote.created_at,
                                matchingCloudNote.uuid,
                            ],
                            "syncNotes-updateLocalFromCloud"
                        );
                    } else if (localUpdated > cloudUpdated) {
                        // Local version is newer, update cloud
                        await updateNoteInCloud({ ...localNote, id: matchingCloudNote.id });
                    }
                } else {
                    // No matching cloud note, upload local note
                    await uploadNoteToCloud(localNote);
                }
            }

            // Handle cloud-only notes that don't exist locally
            for (const cloudNote of cloudNotes) {
                const existsLocally = localNotes.find((localNote) => localNote.uuid === cloudNote.uuid);
                if (!existsLocally) {
                    await executeSql(
                        `INSERT INTO notes (title, note_text, uuid, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
                        [cloudNote.title, cloudNote.note_text, cloudNote.uuid, cloudNote.created_at, cloudNote.updated_at],
                        "syncNotes-insertLocalFromCloud"
                    );
                }
            }

            console.log("Sincronización completa entre local y nube.");
        } catch (error) {
            console.error("Error durante la sincronización:", error);
            Alert.alert("Error", "No se pudieron sincronizar las notas");
        } finally {
            bibleState$.toggleReloadNotes();
            bibleState$.isSyncingNotes.set(false);
        }
    };

    const syncSingleNote = async (note: TNote) => {
        try {
            bibleState$.isSyncingNotes.set(true);
            const user = authState$.user.get();
            if (!user) {
                throw new Error("Usuario no autenticado.");
            }

            if (note.uuid) {
                // Try fetching the cloud version by UUID
                const cloudNote = await pb.collection("notes").getFirstListItem(`uuid = "${note.uuid}"`, {
                    sort: "-updated",
                }).catch(() => null);

                if (cloudNote) {
                    const localUpdated = new Date(note.updated_at || "").getTime();
                    const cloudUpdated = new Date(cloudNote.updated || "").getTime();

                    if (cloudUpdated > localUpdated) {
                        // Cloud is newer → update local
                        await executeSql(
                            `UPDATE notes SET title = ?, note_text = ?, updated_at = ?, created_at = ? WHERE uuid = ?`,
                            [cloudNote.title, cloudNote.note_text, cloudNote.updated, cloudNote.created, cloudNote.uuid],
                            "syncSingleNote-updateLocalFromCloud"
                        );
                    } else if (localUpdated > cloudUpdated) {
                        // Local is newer → update cloud
                        await pb.collection("notes").update(cloudNote.id, {
                            title: note.title,
                            note_text: note.note_text,
                            updated_at: note.updated_at,
                        });
                    } else {
                        console.log("syncSingleNote: nota ya sincronizada");
                    }
                } else {
                    await uploadNoteToCloud(note);
                }
            } else {
                await uploadNoteToCloud(note);
            }
        } catch (error) {
            console.error("Error en syncSingleNote:", error);
            Alert.alert("Error", "No se pudo sincronizar la nota individual.");
        } finally {
            bibleState$.isSyncingNotes.set(false);
        }
    };


    const downloadCloudNotesToLocal = async () => {
        try {
            bibleState$.isSyncingNotes.set(true);
            const cloudNotes = await fetchCloudNotes();
            const localNotes = await fetchLocalNotes();

            for (const cloudNote of cloudNotes) {
                const existsLocally = localNotes.find((localNote) => localNote.uuid === cloudNote.uuid);

                if (existsLocally) {
                    const cloudUpdated = new Date(cloudNote.updated_at || '').getTime();
                    const localUpdated = new Date(existsLocally.updated_at || '').getTime();

                    if (cloudUpdated > localUpdated) {
                        await executeSql(
                            `UPDATE notes SET title = ?, note_text = ?, updated_at = ?, created_at = ? WHERE uuid = ?`,
                            [cloudNote.title, cloudNote.note_text, cloudNote.updated_at, cloudNote.created_at, cloudNote.uuid],
                            "updateLocalNote-fromCloud"
                        );
                        console.log(`Nota actualizada: ${cloudNote.title}`);
                    } else {
                        console.log(`Nota ignorada (local más reciente): ${cloudNote.title}`);
                    }
                } else {
                    await executeSql(
                        `INSERT INTO notes (title, note_text, uuid, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
                        [cloudNote.title, cloudNote.note_text, cloudNote.uuid, cloudNote.created_at, cloudNote.updated_at],
                        "insertLocalNote-fromCloud"
                    );
                    console.log(`Nota insertada: ${cloudNote.title}`);
                }
            }

            console.log("Notas de la nube descargadas y almacenadas localmente");
        } catch (error) {
            console.error("Error al descargar y almacenar notas de la nube:", error);
            Alert.alert("Error", "No se pudieron descargar las notas de la nube");
        } finally {
            bibleState$.toggleReloadNotes();
            bibleState$.isSyncingNotes.set(false);
        }
    };

    return {
        syncNotes,
        syncSingleNote,
        downloadCloudNotesToLocal
    };
};
