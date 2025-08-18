import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import Note from "@/components/note";
import { useNoteService } from "@/services/noteService";
import { bibleState$ } from "@/state/bibleState";
import { TNote } from "@/types";
import { use$ } from "@legendapp/state/react";
import React, { useEffect, useState } from "react";

type NotesProps = {};

const Notes: React.FC<NotesProps> = ({ }) => {
  const { getAllNotes } = useNoteService();
  const [data, setData] = useState<TNote | any>(null);
  const reloadNotes = use$(() => bibleState$.reloadNotes.get())

  useEffect(() => {
    const getNotes = async () => {
      const notes = await getAllNotes();
      setData(notes ?? []);
    };
    getNotes();
  }, [reloadNotes]);

  return (
    <>
      <Note data={data} />
    </>
  );
};

export default Notes;
