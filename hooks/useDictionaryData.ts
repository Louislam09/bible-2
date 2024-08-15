import { useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import {
  dbFileExt,
  defaultDatabases,
  getDatabaseExt,
  isDefaultDatabase,
} from "constants/databaseNames";
import { VersionItem } from "./useInstalledBible";
import { DB_BOOK_NAMES } from "constants/BookNames";
import {
  GET_COMPARE_BOOK_CHAPTER_VERSE,
  SEARCH_DICTIONARY_WORD,
} from "constants/Queries";
import { DATABASE_TYPE, DictionaryData } from "types";
import WORDS from "constants/words";

interface Verse {
  book_number: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface DatabaseData {
  dbItem: VersionItem;
  value: DictionaryData;
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
            `${searchParam}`,
          ]);

          results.push({
            dbItem: databaseItem,
            value: queryResult?.[0] as DictionaryData,
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
    console.log({ enabled });
    if (!enabled) return;
    console.log({ searchParam });
    console.log(
      WORDS.find((x) => x.name_lower === searchParam.toLowerCase())?.name
    );
    fetchData();
  }, [searchParam, enabled]);

  return { data, loading, error };
};

export default useDictionaryData;
