import { useState, useEffect, Dispatch, SetStateAction } from "react";
import * as SQLite from "expo-sqlite";
import { SEARCH_TEXT_QUERY } from "constants/Queries";
import { IBookVerse, IVerseItem } from "types";

export interface UseSearchHookState {
  searchResults: IVerseItem[];
  error: Error | null;
}

interface UseSearchHook {
  state: UseSearchHookState;
  performSearch: (query: string) => void;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

type UseSearch = {
  db: SQLite.WebSQLDatabase | null | undefined;
};

const useSearch = ({ db }: UseSearch): UseSearchHook => {
  const [state, setState] = useState<UseSearchHookState>({
    searchResults: [],
    error: null,
  });

  const setSearchTerm: Dispatch<SetStateAction<string>> = (query) => {
    setState((prev) => ({ ...prev, searchResults: [], error: null }));
  };

  const searchInDatabase = (query: string): Promise<IVerseItem[]> => {
    const words = query.split(" ");
    const whereConditions = words.map(() => "v.text LIKE ?");
    const whereClause = whereConditions.join(" AND ");

    return new Promise((resolve, reject) => {
      if (!db) return true;
      db.transaction((tx) => {
        tx.executeSql(
          `${SEARCH_TEXT_QUERY} ${whereClause};`,
          words.map((word) => `%${word}%`),
          (_, { rows }) => {
            const results: IVerseItem[] = [];
            for (let i = 0; i < rows.length; i++) {
              results.push(rows.item(i));
            }
            resolve(results);
          },
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  };

  const performSearch = async (query: string): Promise<void> => {
    setSearchTerm("");
    try {
      const results = await searchInDatabase(query);
      setState({ searchResults: results, error: null });
    } catch (error: any) {
      setState({ searchResults: [], error });
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
