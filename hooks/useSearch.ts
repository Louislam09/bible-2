import { defaultDatabases, getDatabaseQueryKey } from "constants/databaseNames";
import { QUERY_BY_DB } from "constants/Queries";
import * as SQLite from "expo-sqlite";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IVerseItem } from "types";

export interface UseSearchHookState {
  searchResults: IVerseItem[] | null;
  error: Error | null | string;
}

interface UseSearchHook {
  state: UseSearchHookState;
  performSearch: (query: string, abortController: AbortController) => void;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

type UseSearch = {
  db: SQLite.SQLiteDatabase | null | undefined;
};

const useSearch = ({ db }: UseSearch): UseSearchHook => {
  const dbName = db?.databaseName.split(".")[0] || defaultDatabases[0];
  const [state, setState] = useState<UseSearchHookState>({
    searchResults: null,
    error: null,
  });

  const setSearchTerm: Dispatch<SetStateAction<string>> = (query) => {
    setState((prev) => ({ ...prev, searchResults: [], error: null }));
  };

  const searchInDatabase = async (
    query: string,
    abortController: AbortController
  ): Promise<IVerseItem[] | undefined> => {
    if (!db) throw new Error("Database not initialized");

    const queryKey = getDatabaseQueryKey(dbName);
    const isOthers = ["OTHERS", "ntv-bible"].includes(queryKey);
    const words = query.split(" ");
    const whereConditions = Array.from({ length: words.length }, () =>
      isOthers ? "v.text LIKE ?" : "t.bare_lowercase_words LIKE ?"
    );
    const whereClause = whereConditions.join(" AND ");
    const currentDbQuery = QUERY_BY_DB[queryKey];
    const fullQuery = `${currentDbQuery.SEARCH_TEXT_QUERY} ${whereClause};`;
    try {
      abortController.signal.addEventListener("abort", () => {
        setState({ searchResults: null, error: "Search aborted" });
        return [];
      });
      const statement = await db.prepareAsync(fullQuery);
      const result = await statement.executeAsync(
        words.map((word) => `%${word}%`)
      );
      const response = await result.getAllAsync();
      await statement.finalizeAsync();

      return response as IVerseItem[];
    } catch (error) {
      if (!abortController.signal.aborted) {
        setState({ searchResults: null, error: "Search aborted" });
        return [];
      }
      console.error(error);
    }
  };

  const performSearch = async (
    query: string,
    abortController: AbortController
  ): Promise<void> => {
    try {
      const results = await searchInDatabase(query, abortController);
      setState({ searchResults: results ?? [], error: null });
    } catch (error: any) {
      setState({ searchResults: null, error });
    }
  };

  useEffect(() => {
    let isMounted = true;
    return () => {
      isMounted = false;
    };
  }, []);

  return { state, performSearch, setSearchTerm };
};

export default useSearch;
