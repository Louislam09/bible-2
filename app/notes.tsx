import NotesPage from "@/components/note";
import { GET_ALL_NOTE } from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import useParams from '@/hooks/useParams';
import { TNote } from "@/types";
import React, { useEffect, useState } from "react";

type NotesProps = {};
const Notes: React.FC<NotesProps> = ({ }) => {
  const routeParams = useParams<any>();
  const { shouldRefresh } = routeParams as any;
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

    return () => {};
  }, [shouldFetch, myBibleDB, executeSql, shouldRefresh]);

  return <NotesPage data={data} setShouldFetch={setShouldFetch} />;
};

export default Notes;
