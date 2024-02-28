import NoteList from "components/note";
import { GET_ALL_FAVORITE_VERSES } from "constants/Queries";
import { useDBContext } from "context/databaseContext";
import React, { useEffect, useState } from "react";
import { RootStackScreenProps } from "types";

const Notes: React.FC<RootStackScreenProps<"Notes">> = (props) => {
  const { myBibleDB, executeSql } = useDBContext();
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      if (myBibleDB && executeSql) {
        executeSql(myBibleDB, GET_ALL_FAVORITE_VERSES, [])
          .then((verses) => {
            setData(verses ?? []);
          })
          .catch((error) => {
            console.error("Error:Favorite:", error);
          });
      }
    })();

    return () => {};
  }, [myBibleDB]);

  return <NoteList isLoading={false} data={data} />;
};

export default Notes;
