import NoteList from "components/note";
import { GET_ALL_NOTE } from "constants/Queries";
import { useDBContext } from "context/databaseContext";
import React, { useEffect, useRef, useState } from "react";
import { RootStackScreenProps, TNote } from "types";

const Notes: React.FC<RootStackScreenProps<"Notes"> | any> = (props) => {
  const { myBibleDB, executeSql } = useDBContext();
  const [data, setData] = useState<TNote | any>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    if (!myBibleDB || !executeSql) return;
    const getNotes = async () => {
      const notes = await executeSql(myBibleDB, GET_ALL_NOTE, []);
      console.log("getNotes", shouldFetch, notes.length);
      setData(notes ?? []);
    };
    getNotes();

    return () => {};
  }, [shouldFetch, myBibleDB, executeSql]);

  return <NoteList data={data} setShouldFetch={setShouldFetch} />;
};

export default Notes;
