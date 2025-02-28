import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import Note from "@/components/note";
import { Text } from "@/components/Themed";
import { GET_ALL_NOTE } from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import useParams from "@/hooks/useParams";
import { TNote } from "@/types";
import React, { useEffect, useState } from "react";

type NotesProps = {};
type NoteParam = { shouldRefresh: boolean };

const Notes: React.FC<NotesProps> = ({}) => {
  const routeParams = useParams<NoteParam>();
  const { shouldRefresh } = routeParams;
  const { myBibleDB, executeSql } = useDBContext();
  const [data, setData] = useState<TNote | any>(null);
  const [canFetchNote, setCanFetchNote] = useState(false);

  useEffect(() => {
    if (!myBibleDB || !executeSql) return;
    const getNotes = async () => {
      const notes = await executeSql<TNote>(GET_ALL_NOTE);
      setData(notes ?? []);
    };
    getNotes();
  }, [canFetchNote, myBibleDB, executeSql, shouldRefresh]);

  return (
    <ScreenWithAnimation duration={800} icon="NotebookPen" title="Mis Notas">
      <Note data={data} setShouldFetch={setCanFetchNote} />
    </ScreenWithAnimation>
  );
};

export default Notes;
