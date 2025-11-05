import { getDatabaseExt } from "@/constants/databaseNames";
import { SEARCH_DICTIONARY_WORD } from "@/constants/Queries";
import { DATABASE_TYPE, DictionaryData } from "@/types";
import * as SQLite from "expo-sqlite";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { modalState$ } from "@/state/modalState";
import useInstalledModules from "./useInstalledModules";

export interface DatabaseData {
  dbShortName: string;
  words: DictionaryData[];
}

interface Row {
  [key: string]: any;
}

// Helper function outside component to avoid React Compiler issues with try-finally
async function queryDictionaryDatabase(
  databaseItem: { id: string; name: string },
  trimmedSearch: string,
  dicExt: string,
  isAborted: () => boolean
): Promise<DatabaseData> {
  if (isAborted()) {
    throw new Error('Search cancelled');
  }

  const dbNameWithExt = `${databaseItem.id}${dicExt}`;
  let db: SQLite.SQLiteDatabase | null = null;
  let statement: SQLite.SQLiteStatement | null = null;

  try {
    db = await SQLite.openDatabaseAsync(dbNameWithExt);
    statement = await db.prepareAsync(SEARCH_DICTIONARY_WORD);

    const result = await statement.executeAsync([`${trimmedSearch}%`]);
    const response = await result.getAllAsync();

    if (__DEV__) {
      console.log(`Dictionary query for ${databaseItem.name} completed`);
    }

    // Manual cleanup in success path
    if (statement) {
      await statement.finalizeAsync();
      statement = null;
    }
    if (db) {
      await db.closeAsync();
      db = null;
    }

    return {
      dbShortName: databaseItem.name,
      words: response as DictionaryData[],
    };
  } catch (error) {
    console.error(`Dictionary query error for ${databaseItem.name}:`, error);

    // Manual cleanup in error path
    if (statement) {
      try {
        await statement.finalizeAsync();
      } catch (cleanupError) {
        console.error('Error finalizing statement:', cleanupError);
      }
    }
    if (db) {
      try {
        await db.closeAsync();
      } catch (cleanupError) {
        console.error('Error closing database:', cleanupError);
      }
    }

    return {
      dbShortName: databaseItem.name,
      words: [],
    };
  }
}

type UseDictionaryDataProps = {
  autoSearch?: boolean;
  minSearchLength?: number;
};

const useDictionaryData = ({
  autoSearch = false,
  minSearchLength = 3,
}: UseDictionaryDataProps) => {
  const { dictionaries: databases } = useInstalledModules();
  const [data, setData] = useState<DatabaseData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Move to ref to avoid it being a dependency
  const dicExtRef = useRef(getDatabaseExt(DATABASE_TYPE.DICTIONARY));
  const minSearchLengthRef = useRef(minSearchLength);

  // Update ref when prop changes
  useEffect(() => {
    minSearchLengthRef.current = minSearchLength;
  }, [minSearchLength]);

  // Abort controller for canceling in-flight searches
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cache to avoid redundant searches
  const searchCacheRef = useRef<Map<string, DatabaseData[]>>(new Map());

  // Memoize hasDictionary
  const hasDictionary = useMemo(() => databases.length >= 1, [databases.length]);

  const onSearch = useCallback(async ({ searchParam }: { searchParam: string }) => {
    // Validate input
    const trimmedSearch = searchParam.trim();
    if (trimmedSearch.length < minSearchLengthRef.current || databases.length === 0) {
      setData([]);
      return;
    }

    // Cancel previous search if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const currentAbortController = abortControllerRef.current;

    // Check cache
    const cacheKey = trimmedSearch.toLowerCase();
    const cachedResult = searchCacheRef.current.get(cacheKey);
    if (cachedResult) {
      setData(cachedResult);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parallel database queries for better performance
      const results = await Promise.all(
        databases.map((databaseItem) =>
          queryDictionaryDatabase(
            databaseItem,
            trimmedSearch,
            dicExtRef.current,
            () => currentAbortController.signal.aborted
          )
        )
      );

      // Check if search was cancelled before setting results
      if (!currentAbortController.signal.aborted) {
        searchCacheRef.current.set(cacheKey, results);
        setData(results);
        setLoading(false);
      }
    } catch (error: any) {
      if (error.message !== 'Search cancelled') {
        setError("Error fetching dictionary data");
        console.error('Dictionary search error:', error);
      }

      // Manual cleanup in error path
      if (!currentAbortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [databases]); // Only databases as dependency

  useEffect(() => {
    if (!autoSearch) return;

    const searchWord = modalState$.searchWordOnDic.get();
    if (searchWord) {
      onSearch({ searchParam: searchWord });
    }
  }, [autoSearch, onSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      searchCacheRef.current.clear();
    };
  }, []);

  return {
    data,
    loading,
    error,
    onSearch,
    hasDictionary,
  };
};

export default useDictionaryData;