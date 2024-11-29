import { useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import {
  dbFileExt,
  defaultDatabases,
  getDatabaseExt,
  isDefaultDatabase,
} from "@/constants/databaseNames";
import { VersionItem } from "./useInstalledBible";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import {
  GET_COMPARE_BOOK_CHAPTER_VERSE,
  SEARCH_DICTIONARY_WORD,
} from "@/constants/Queries";
import { DATABASE_TYPE, DictionaryData } from "@/types";
import WORDS from "@/constants/words";
import { pluralToSingular } from "@/utils/removeAccent";

interface Verse {
  book_number: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface DatabaseData {
  dbShortName: string;
  words: DictionaryData[];
}

interface Row {
  [key: string]: any;
}

type UseCompareVersesProps = {
  searchParam: string;
  enabled: boolean;
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

const useDictionaryData = ({
  searchParam,
  databases,
  executeSql,
  enabled,
}: UseCompareVersesProps) => {
  const [data, setData] = useState<DatabaseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dicExt = getDatabaseExt(DATABASE_TYPE.DICTIONARY);

  useEffect(() => {
    if (!enabled) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const results: DatabaseData[] = [];
        for (const databaseItem of databases) {
          const dbID = databaseItem.id;
          const dbNameWithExt = `${dbID}${dicExt}`;
          const db = await SQLite.openDatabaseAsync(dbNameWithExt);
          const queryResult = await executeSql?.(db, SEARCH_DICTIONARY_WORD, [
            `${searchParam}%`,
          ]);

          await db.closeAsync();
          results.push({
            dbShortName: databaseItem.name,
            words: queryResult as DictionaryData[],
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
  }, [searchParam, enabled, databases]);

  return { data, loading, error };
};

export default useDictionaryData;
