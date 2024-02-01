import { useState, useEffect, Dispatch, SetStateAction } from "react";
import * as SQLite from "expo-sqlite";
import { QUERY_BY_DB } from "constants/Queries";
import { IVerseItem } from "types";
import getCurrentDbName from "utils/getCurrentDB";
import { DBName } from "enums";

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
  // @ts-ignore
  const dbName = db?._db?._name ?? DBName.BIBLE;
  const [state, setState] = useState<UseSearchHookState>({
    searchResults: null,
    error: null,
  });

  const setSearchTerm: Dispatch<SetStateAction<string>> = (query) => {
    setState((prev) => ({ ...prev, searchResults: [], error: null }));
  };

  const searchInDatabase = (
    query: string,
    abortController: AbortController
  ): Promise<IVerseItem[]> => {
    const words = query.split(" ");
    const whereConditions = Array.from(
      { length: words.length },
      () => "t.bare_lowercase_words LIKE ?"
    );
    const whereClause = whereConditions.join(" AND ");

    return new Promise((resolve, reject) => {
      if (!db) return true;

      abortController.signal.addEventListener("abort", () => {
        setState({ searchResults: null, error: "Search aborted" });
        reject(new Error(`Search aborted: ${query}`));
      });

      const query = QUERY_BY_DB[getCurrentDbName(dbName)];
      db.transaction((tx) => {
        tx.executeSql(
          `${query.SEARCH_TEXT_QUERY} ${whereClause};`,
          words.map((word) => `%${word}%`),
          (_, { rows }) => {
            if (!abortController.signal.aborted) {
              const results: IVerseItem[] = [];
              for (let i = 0; i < rows.length; i++) {
                results.push(rows.item(i));
              }
              resolve(results);
            }
          },
          (_, error) => {
            if (!abortController.signal.aborted) {
              reject(error);
            }
            return true;
          }
        );
      });
    });
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

    // Limpiar al desmontar el componente
    return () => {
      isMounted = false;
    };
  }, []);

  return { state, performSearch, setSearchTerm };
};

export default useSearch;
