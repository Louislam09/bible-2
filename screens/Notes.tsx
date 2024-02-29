import NoteList from "components/note";
import { GET_ALL_NOTE } from "constants/Queries";
import { useDBContext } from "context/databaseContext";
import React, { useEffect, useRef, useState } from "react";
import { RootStackScreenProps, TNote } from "types";

const Notes: React.FC<RootStackScreenProps<"Notes">> = (props) => {
  const { myBibleDB, executeSql } = useDBContext();
  const [data, setData] = useState<TNote | any>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    const getNotes = async () => {
      if (myBibleDB && executeSql) {
        executeSql(myBibleDB, GET_ALL_NOTE, [])
          .then((notes) => {
            setData(notes ?? []);
          })
          .catch((error) => {
            console.error("Error:Notes:", error);
          });
      }
    };

    getNotes();

    return () => {};
  }, [shouldFetch]);

  return <NoteList data={data} setShouldFetch={setShouldFetch} />;
};

export default Notes;
