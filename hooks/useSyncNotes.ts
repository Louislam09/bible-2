import { GET_ALL_NOTE } from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import { pb } from "@/globalConfig";
import { authState$ } from "@/state/authState";
import { TNote } from "@/types";
import * as Crypto from "expo-crypto";
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
            const uuid = note.uuid || Crypto.randomUUID();
            const createdAt = note.created_at || new Date().toISOString();
            const updatedAt = note.updated_at || new Date().toISOString();

            await pb.collection("notes").create({
                uuid,
                title: note.title,
                note_text: note.note_text,
                created_at: createdAt,
                updated_at: updatedAt,
            });

            if (!note.uuid) {
                await executeSql(
                    `UPDATE notes SET uuid = ? WHERE id = ?`,
                    [uuid, note.id],
                    "uploadNote-updateUUID"
                );
            }
        } catch (error) {
            console.error("Error uploading note:", error);
        }
    };

    const updateNoteInCloud = async (note: TNote) => {
        try {
            const updatedAt = new Date().toISOString();

            await pb.collection("notes").update(note.uuid, {
                title: note.title,
                note_text: note.note_text,
                updated_at: updatedAt,
            });

            await executeSql(
                `UPDATE notes SET updated_at = ? WHERE id = ?`,
                [updatedAt, note.id],
                "updateNote-syncUpdatedAt"
            );
        } catch (error) {
            console.error("Error updating cloud note:", error);
        }
    };

    const syncNotes = async () => {
        try {
            const localNotes = await fetchLocalNotes();
            const cloudNotes = await fetchCloudNotes();

            for (const localNote of localNotes) {
                const matchingNote = cloudNotes.find(
                    (cloudNote) =>
                        cloudNote.title === localNote.title
                        //&& cloudNote.note_text === localNote.note_text
                );

                if (matchingNote) {
                    // Ya existe en la nube
                    if (!localNote.uuid) {
                        await executeSql(
                            `UPDATE notes SET uuid = ? WHERE id = ?`,
                            [matchingNote.uuid, localNote.id],
                            "syncNotes-updateUUID"
                        );
                    }
                } else {
                    await uploadNoteToCloud(localNote);
                }
            }

            //   storedData$.isSynced.set(true);
            console.log("Notas sincronizadas correctamente");
        } catch (error) {
            console.error("Error durante la sincronización:", error);
            Alert.alert("Error", "No se pudieron sincronizar las notas");
        }
    };

    const syncSingleNote = async (note: TNote) => {
        try {
            if (note.uuid) {
                await updateNoteInCloud(note);
            } else {
                await uploadNoteToCloud(note);
            }
        } catch (error) {
            console.error("Error sync de nota individual:", error);
        }
    };

    return {
        syncNotes,
        syncSingleNote,
    };
};
