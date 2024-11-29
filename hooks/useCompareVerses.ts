import { useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import {
  dbFileExt,
  defaultDatabases,
  isDefaultDatabase,
} from "@/constants/databaseNames";
import { VersionItem } from "./useInstalledBible";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { GET_COMPARE_BOOK_CHAPTER_VERSE } from "@/constants/Queries";

interface Verse {
  book_number: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface DatabaseData {
  dbItem: VersionItem;
  value: Verse;
}

interface Row {
  [key: string]: any;
}

type UseCompareVersesProps = {
  book: string;
  chapter: number;
  verse: number;
  databases: VersionItem[];
  executeSql:
    | ((
        db: SQLite.SQLiteDatabase,
        sql: string,
        params?: any[]
      ) => Promise<Row[]>)
    | null
    | undefined;
};

const useCompareVerses = ({
  book,
  chapter,
  verse,
  databases,
  executeSql,
}: UseCompareVersesProps) => {
  const [data, setData] = useState<DatabaseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const currentBook = DB_BOOK_NAMES.find(
    (x) => x.longName === book
  )?.bookNumber;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const results: DatabaseData[] = [];
        for (const databaseItem of databases) {
          const dbID = databaseItem.id;
          const _isDefaultDatabase = isDefaultDatabase(dbID);
          const dbNameWithExt = _isDefaultDatabase
            ? `${databaseItem.id}.db`
            : `${databaseItem.id}${dbFileExt}`;
          const db = await SQLite.openDatabaseAsync(dbNameWithExt);
          const queryResult = await executeSql?.(
            db,
            GET_COMPARE_BOOK_CHAPTER_VERSE,
            [currentBook, chapter, verse]
          );

          results.push({
            dbItem: databaseItem,
            value: queryResult?.[0] as Verse,
          });
        }

        setData(results);
      } catch (error) {
        setError("Error fetching data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [book, chapter, verse]);

  return { data, loading, error };
};

export default useCompareVerses;
