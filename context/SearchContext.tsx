import React, { createContext, use, useMemo } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useDBContext } from "./databaseContext";

interface SearchContextType {
  searchState: any;
  performSearch: any;
  setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { myBibleDB } = useDBContext();
  const { state: searchState, performSearch } = useSearch({ db: myBibleDB });

  const setSearchQuery = (query: string) => {
    // This will be handled by the main BibleContext
    // We're just providing the search functionality here
  };

  const contextValue = useMemo(
    () => ({
      searchState,
      performSearch,
      setSearchQuery,
    }),
    [searchState, performSearch]
  );

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = (): SearchContextType => {
  const context = use(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
};
