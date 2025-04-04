import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import Note from "@/components/note";
import { useNoteService } from "@/services/noteService";
import useParams from "@/hooks/useParams";
import { TNote } from "@/types";
import React, { useEffect, useState } from "react";
import { bibleState$ } from "@/state/bibleState";
import { use$ } from "@legendapp/state/react";

type NotesProps = {};

const Notes: React.FC<NotesProps> = ({}) => {
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
    <ScreenWithAnimation duration={800} icon="NotebookPen" title="Mis Notas">
      <Note data={data} />
    </ScreenWithAnimation>
  );
};

export default Notes;
