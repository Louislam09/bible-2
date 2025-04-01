import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import Note from "@/components/note";
import { Text } from "@/components/Themed";
import { useNoteService } from "@/services/noteService";
import useParams from "@/hooks/useParams";
import { TNote } from "@/types";
import React, { useEffect, useState } from "react";

type NotesProps = {};
type NoteParam = { shouldRefresh: boolean };

const Notes: React.FC<NotesProps> = ({}) => {
  const routeParams = useParams<NoteParam>();
  const { shouldRefresh } = routeParams;
  const { getAllNotes } = useNoteService();
  const [data, setData] = useState<TNote | any>(null);
  const [canFetchNote, setCanFetchNote] = useState(false);

  useEffect(() => {
    const getNotes = async () => {
      const notes = await getAllNotes();
      setData(notes ?? []);
    };
    getNotes();
  }, [canFetchNote, shouldRefresh]);

  return (
    <ScreenWithAnimation duration={800} icon="NotebookPen" title="Mis Notas">
      <Note data={data} setShouldFetch={setCanFetchNote} />
    </ScreenWithAnimation>
  );
};

export default Notes;
