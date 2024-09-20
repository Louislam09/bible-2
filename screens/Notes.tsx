import NoteList from "components/note";
import { GET_ALL_NOTE } from "constants/Queries";
import { useDBContext } from "context/databaseContext";
import React, { useEffect, useState } from "react";
import { RootStackScreenProps, TNote } from "types";

const Notes: React.FC<RootStackScreenProps<"Notes">> = ({ route }) => {
  const { shouldRefresh } = route.params as any;
  const { myBibleDB, executeSql } = useDBContext();
  const [data, setData] = useState<TNote | any>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    if (!myBibleDB || !executeSql) return;
    const getNotes = async () => {
      const notes = await executeSql(myBibleDB, GET_ALL_NOTE, []);
      setData(notes ?? []);
    };
    getNotes();

    return () => { };
  }, [shouldFetch, myBibleDB, executeSql, shouldRefresh]);

  return <NoteList data={data} setShouldFetch={setShouldFetch} />;
};

export default Notes;
