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
  db: SQLite.WebSQLDatabase | null | undefined;
};

const useSearch = ({ db }: UseSearch): UseSearchHook => {
  const dbName = (db as any)?._db?._name ?? DBName.BIBLE;
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
    const whereConditions = words.map(() => "v.text LIKE ?");
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
      setState({ searchResults: results, error: null });
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
// import { useState, useEffect, Dispatch, SetStateAction } from "react";
// // @ts-ignore
// import SQLite, { openDatabase } from "react-native-sqlite-storage";
// import { SEARCH_TEXT_QUERY } from "constants/Queries";
// import { IVerseItem } from "types";
// import { DBName } from "enums";

// export interface UseSearchHookState {
//   searchResults: IVerseItem[] | null;
//   error: Error | null | string;
// }

// interface UseSearchHook {
//   state: UseSearchHookState;
//   performSearch: (query: string, abortController: AbortController) => void;
//   setSearchTerm: Dispatch<SetStateAction<string>>;
// }

// const useSearch = (): UseSearchHook => {
//   const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

//   useEffect(() => {
//     const initializeDatabase = async () => {
//       try {
//         SQLite.DEBUG(true);
//         SQLite.enablePromise(true);

//         console.log(SQLite.openDatabase);
//         const database = await SQLite.openDatabase({
//           name: DBName.BIBLE,
//           location: "default",
//         });
//         // const database = null;

//         console.log("Database opened successfully:", database);

//         // Perform any database initialization logic here

//         setDb(database);
//       } catch (error) {
//         console.error("Error opening database:", error);
//       }
//     };
//     initializeDatabase();

//     // Cleanup function when component unmounts
//     return () => {
//       if (db) {
//         db.close();
//       }
//     };
//   }, []);

//   const [state, setState] = useState<UseSearchHookState>({
//     searchResults: null,
//     error: null,
//   });

//   const setSearchTerm: Dispatch<SetStateAction<string>> = (query) => {
//     setState((prev) => ({ ...prev, searchResults: [], error: null }));
//   };

//   const searchInDatabase = (
//     query: string,
//     abortController: AbortController
//   ): Promise<IVerseItem[]> => {
//     const words = query.split(" ");
//     const whereConditions = words.map(() => "v.text LIKE ?");
//     const whereClause = whereConditions.join(" AND ");

//     return new Promise((resolve, reject) => {
//       if (!db) return true;

//       abortController.signal.addEventListener("abort", () => {
//         setState({ searchResults: null, error: "Search aborted" });
//         reject(new Error(`Search aborted: ${query}`));
//       });

//       db.transaction((tx: any) => {
//         tx.executeSql(
//           `${SEARCH_TEXT_QUERY} ${whereClause};`,
//           words.map((word) => `%${word}%`),
//           (_: any, { rows }: any) => {
//             if (!abortController.signal.aborted) {
//               const results: IVerseItem[] = [];
//               for (let i = 0; i < rows.length; i++) {
//                 results.push(rows.item(i));
//               }
//               resolve(results);
//             }
//           },
//           (_: any, error: any) => {
//             if (!abortController.signal.aborted) {
//               reject(error);
//             }
//             return true;
//           }
//         );
//       });
//     });
//   };

//   const performSearch = async (
//     query: string,
//     abortController: AbortController
//   ): Promise<void> => {
//     try {
//       const results = await searchInDatabase(query, abortController);
//       console.log(results);
//       setState({ searchResults: results, error: null });
//     } catch (error: any) {
//       setState({ searchResults: null, error });
//     }
//   };

//   return { state, performSearch, setSearchTerm };
// };

// export default useSearch;
