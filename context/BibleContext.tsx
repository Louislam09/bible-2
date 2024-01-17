import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { EThemes, IBookVerse, TFont, TVersion } from "../types";
import useCustomFonts from "../hooks/useCustomFonts";
import { useDBContext } from "./databaseContext";
import useSearch, { UseSearchHookState } from "hooks/useSearch";
import { useStorage } from "./LocalstoreContext";

type BibleState = {
  highlightedVerses: IBookVerse[];
  highlightVerse: Function;
  clearHighlights: Function;
  setSearchQuery: Function;
  selectFont: Function;
  selectBibleVersion: Function;
  removeHighlistedVerse: Function;
  toggleCopyMode: Function;
  decreaseFontSize: Function;
  increaseFontSize: Function;
  selectTheme: Function;
  setLocalData: Function;
  performSearch: Function;
  selectedFont: string;
  currentBibleVersion: string;
  saerchQuery: string;
  currentTheme: keyof typeof EThemes;
  isCopyMode: boolean;
  fontSize: number;
  searchState: UseSearchHookState;
};

type BibleAction =
  | { type: "HIGHLIGHT_VERSE"; payload: IBookVerse }
  | { type: "REMOVE_HIGHLIGHT_VERSE"; payload: IBookVerse }
  | { type: "SELECT_FONT"; payload: string }
  | { type: "SELECT_THEME"; payload: keyof typeof EThemes }
  | { type: "INCREASE_FONT_SIZE" }
  | { type: "DECREASE_FONT_SIZE" }
  | { type: "SELECT_BIBLE_VERSION"; payload: string }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "CLEAR_HIGHLIGHTS" }
  | { type: "SET_LOCAL_DATA"; payload: any }
  | { type: "TOGGLE_COPY_MODE" };

const defaultSearch = {
  searchResults: [],
  error: null,
};

const initialContext: BibleState = {
  highlightedVerses: [],
  highlightVerse: () => {},
  removeHighlistedVerse: () => {},
  clearHighlights: () => {},
  selectBibleVersion: () => {},
  selectFont: () => {},
  selectTheme: () => {},
  toggleCopyMode: () => {},
  decreaseFontSize: () => {},
  increaseFontSize: () => {},
  setLocalData: () => {},
  performSearch: () => {},
  setSearchQuery: () => {},
  selectedFont: TFont.Roboto,
  currentBibleVersion: TVersion.RVR1960,
  isCopyMode: false,
  fontSize: 24,
  searchState: defaultSearch,
  saerchQuery: "hoy",
  currentTheme: "Blue",
};

export const BibleContext = createContext<BibleState | any>(initialContext);

const bibleReducer = (state: BibleState, action: BibleAction): BibleState => {
  switch (action.type) {
    case "HIGHLIGHT_VERSE":
      return {
        ...state,
        highlightedVerses: [...state.highlightedVerses, action.payload].sort(
          (a, b) => a.verse - b.verse
        ),
      };
    case "REMOVE_HIGHLIGHT_VERSE":
      return {
        ...state,
        highlightedVerses: [
          ...state.highlightedVerses.filter(
            (verse) => verse.verse !== action.payload.verse
          ),
        ],
      };
    case "CLEAR_HIGHLIGHTS":
      return {
        ...state,
        highlightedVerses: [],
      };
    case "SELECT_FONT":
      return {
        ...state,
        selectedFont: action.payload,
      };
    case "SELECT_THEME":
      return {
        ...state,
        currentTheme: action.payload,
      };
    case "SELECT_BIBLE_VERSION":
      return {
        ...state,
        currentBibleVersion: action.payload,
      };
    case "INCREASE_FONT_SIZE":
      return {
        ...state,
        fontSize: state.fontSize + 1,
      };
    case "DECREASE_FONT_SIZE":
      return {
        ...state,
        fontSize: state.fontSize - 1,
      };
    case "TOGGLE_COPY_MODE":
      return {
        ...state,
        isCopyMode: !state.isCopyMode,
      };
    case "SET_SEARCH_QUERY":
      return {
        ...state,
        saerchQuery: action.payload,
      };
    case "SET_LOCAL_DATA":
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

const BibleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { storedData, saveData, isDataLoaded } = useStorage();
  const { currentBibleVersion, fontSize, currentTheme, selectedFont } =
    storedData;
  const [state, dispatch] = useReducer(bibleReducer, initialContext);
  const fontsLoaded = useCustomFonts();
  const { myBibleDB } = useDBContext();

  const {
    state: searchState,
    performSearch,
    setSearchTerm,
  } = useSearch({ db: myBibleDB });
  // const { state: searchState, performSearch, setSearchTerm } = useSearch();

  useEffect(() => {
    if (!isDataLoaded) return;
    dispatch({
      type: "SET_LOCAL_DATA",
      payload: { currentBibleVersion, fontSize, currentTheme, selectedFont },
    });
  }, [isDataLoaded]);

  if (!fontsLoaded || !isDataLoaded) {
    return null; // Render loading UI or placeholder while fonts are loading
  }

  const highlightVerse = (verseItem: IBookVerse) => {
    dispatch({ type: "HIGHLIGHT_VERSE", payload: verseItem });
  };
  const removeHighlistedVerse = (verseItem: IBookVerse) => {
    dispatch({ type: "REMOVE_HIGHLIGHT_VERSE", payload: verseItem });
  };

  const clearHighlights = () => {
    dispatch({ type: "CLEAR_HIGHLIGHTS" });
  };
  const decreaseFontSize = () => {
    dispatch({ type: "DECREASE_FONT_SIZE" });
    saveData({ fontSize: state.fontSize - 1 });
  };
  const increaseFontSize = () => {
    dispatch({ type: "INCREASE_FONT_SIZE" });
    saveData({ fontSize: state.fontSize + 1 });
  };
  const toggleCopyMode = () => {
    dispatch({ type: "TOGGLE_COPY_MODE" });
  };

  const selectFont = (font: string) => {
    dispatch({ type: "SELECT_FONT", payload: font });
    saveData({ selectedFont: font });
  };
  const selectTheme = (theme: keyof typeof EThemes) => {
    dispatch({ type: "SELECT_THEME", payload: theme });
    saveData({ currentTheme: theme });
  };
  const selectBibleVersion = (version: string) => {
    dispatch({ type: "SELECT_BIBLE_VERSION", payload: version });
    saveData({ currentBibleVersion: version });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  };

  const contextValue = {
    ...state,
    searchState,
    highlightVerse,
    clearHighlights,
    selectFont,
    selectBibleVersion,
    toggleCopyMode,
    decreaseFontSize,
    increaseFontSize,
    removeHighlistedVerse,
    performSearch: performSearch as typeof performSearch,
    setSearchQuery,
    selectTheme,
  };

  return (
    <BibleContext.Provider value={contextValue}>
      {children}
    </BibleContext.Provider>
  );
};

export const useBibleContext = (): BibleState => useContext(BibleContext);

export default BibleProvider;
