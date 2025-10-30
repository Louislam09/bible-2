import { getDatabaseExt } from "@/constants/databaseNames";
import { SEARCH_DICTIONARY_WORD } from "@/constants/Queries";
import { DATABASE_TYPE, DictionaryData } from "@/types";
import * as SQLite from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { VersionItem } from "./useInstalledBible";
import { modalState$ } from "@/state/modalState";

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
  enabled: boolean;
  databases: VersionItem[];
  autoSearch?: boolean;
};

const useDictionaryData = ({
  databases,
  enabled,
  autoSearch = false,
}: UseCompareVersesProps) => {
  const [data, setData] = useState<DatabaseData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dicExt = getDatabaseExt(DATABASE_TYPE.DICTIONARY);

  const executeSql = useCallback(async (
    database: SQLite.SQLiteDatabase,
    sql: string,
    params: any[] = [],
    queryName?: any
  ): Promise<any[]> => {
    try {
      const startTime = Date.now(); // Start timing
      if (!database) {
        throw new Error("Database not initialized");
      }
      const statement = await database.prepareAsync(sql);
      try {
        const result = await statement.executeAsync(params);
        const endTime = Date.now(); // End timing
        const executionTime = endTime - startTime;

        const response = await result.getAllAsync();
        if (queryName) {
          console.log(`Query ${queryName} executed in ${executionTime} ms.`);
        }
        return response as Row[];
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error: any) {
      console.error('Dictionary query error:', error);
      return [];
    }
  }, [])

  const onSearch = useCallback(async ({ searchParam }: { searchParam: string }) => {
    if (!enabled || searchParam.length < 3 || databases.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const results: DatabaseData[] = [];
      for (const databaseItem of databases) {
        const dbID = databaseItem.id;
        const dbNameWithExt = `${dbID}${dicExt}`;
        const db = await SQLite.openDatabaseAsync(dbNameWithExt);
        const queryResult = await executeSql(db, SEARCH_DICTIONARY_WORD, [
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
  }, [enabled, databases]);

  useEffect(() => {
    if (!autoSearch) return;
    onSearch({ searchParam: modalState$.searchWordOnDic.get() });
  }, [autoSearch]);

  return { data, loading, error, onSearch };
};

export default useDictionaryData;
