import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import {
  EThemes,
  IBookVerse,
  TFont,
  EBibleVersions,
  IFavoriteVerse,
  IStrongWord,
} from "../types";
import useCustomFonts from "../hooks/useCustomFonts";
import { useDBContext } from "./databaseContext";
import useSearch, { UseSearchHookState } from "hooks/useSearch";
import { useStorage } from "./LocalstoreContext";
import {
  DELETE_FAVORITE_VERSE,
  DELETE_NOTE,
  INSERT_FAVORITE_VERSE,
  INSERT_INTO_NOTE,
  UPDATE_NOTE_BY_ID,
} from "constants/Queries";

type BibleState = {
  highlightedVerses: IBookVerse[];
  highlightVerse: Function;
  clearHighlights: Function;
  setSearchQuery: Function;
  selectFont: Function;
  onDeleteNote: (id: number) => void;
  onUpdateNote: (
    data: { title: string; content: string },
    id: number,
    closeCallback: any
  ) => void;
  onSaveNote: (
    data: { title: string; content: string },
    closeCallback: any
  ) => void;
  selectBibleVersion: Function;
  removeHighlistedVerse: Function;
  toggleCopyMode: Function;
  toggleCopySearch: Function;
  decreaseFontSize: Function;
  setStrongWord: (word: IStrongWord) => void;
  setverseInStrongDisplay: (verse: number) => void;
  toggleFavoriteVerse: ({ bookNumber, chapter, verse }: IFavoriteVerse) => void;
  increaseFontSize: Function;
  toggleViewLayoutGrid: Function;
  selectTheme: Function;
  setLocalData: Function;
  performSearch: Function;
  selectedFont: string;
  currentBibleVersion: string;
  searchQuery: string;
  currentTheme: keyof typeof EThemes;
  isCopyMode: boolean;
  isSearchCopy: boolean;
  viewLayoutGrid: boolean;
  fontSize: number;
  verseInStrongDisplay: number;
  searchState: UseSearchHookState;
  strongWord: IStrongWord;
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
  | { type: "SET_VERSE_IN_STRONG_DISPLAY"; payload: number }
  | { type: "SET_STRONG_WORD"; payload: IStrongWord }
  | { type: "CLEAR_HIGHLIGHTS" }
  | { type: "SET_LOCAL_DATA"; payload: any }
  | { type: "TOGGLE_COPY_MODE"; payload?: boolean }
  | { type: "TOGGLE_VIEW_LAYOUT_GRID" }
  | { type: "TOGGLE_COPY_SEARCH"; payload: boolean };

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
  onSaveNote: () => {},
  onUpdateNote: () => {},
  onDeleteNote: () => {},
  selectFont: () => {},
  selectTheme: () => {},
  toggleCopyMode: () => {},
  toggleCopySearch: () => {},
  decreaseFontSize: () => {},
  toggleFavoriteVerse: (item: IFavoriteVerse) => {},
  setverseInStrongDisplay: (verse: number) => {},
  increaseFontSize: () => {},
  toggleViewLayoutGrid: () => {},
  setLocalData: () => {},
  setStrongWord: () => {},
  performSearch: () => {},
  setSearchQuery: () => {},
  selectedFont: TFont.Roboto,
  currentBibleVersion: EBibleVersions.RVR60,
  isCopyMode: false,
  fontSize: 24,
  searchState: defaultSearch,
  searchQuery: "",
  verseInStrongDisplay: 0,
  currentTheme: "Blue",
  isSearchCopy: false,
  viewLayoutGrid: true,
  strongWord: { text: "", code: "" },
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
        isCopyMode: action?.payload ?? !state.isCopyMode,
      };
    case "TOGGLE_COPY_SEARCH":
      return {
        ...state,
        isSearchCopy: action.payload,
      };
    case "TOGGLE_VIEW_LAYOUT_GRID":
      return {
        ...state,
        viewLayoutGrid: !state.viewLayoutGrid,
      };
    case "SET_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.payload,
      };
    case "SET_VERSE_IN_STRONG_DISPLAY":
      return {
        ...state,
        verseInStrongDisplay: action.payload,
      };
    case "SET_STRONG_WORD":
      return {
        ...state,
        strongWord: action.payload,
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
  const { myBibleDB, executeSql } = useDBContext();

  const {
    state: searchState,
    performSearch,
    setSearchTerm,
  } = useSearch({ db: myBibleDB });

  useEffect(() => {
    if (!isDataLoaded) return;
    dispatch({
      type: "SET_LOCAL_DATA",
      payload: { currentBibleVersion, fontSize, currentTheme, selectedFont },
    });
  }, [isDataLoaded]);

  useEffect(() => {
    if (state.highlightedVerses.length) return;
    dispatch({ type: "TOGGLE_COPY_MODE", payload: false });
  }, [state.highlightedVerses]);

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
  const toggleCopySearch = (value: boolean) => {
    dispatch({ type: "TOGGLE_COPY_SEARCH", payload: value });
  };
  const toggleViewLayoutGrid = () => {
    dispatch({ type: "TOGGLE_VIEW_LAYOUT_GRID" });
  };

  const toggleFavoriteVerse = ({
    bookNumber,
    chapter,
    verse,
    isFav,
  }: IFavoriteVerse) => {
    if (!myBibleDB || !executeSql) return;
    const params = isFav
      ? [bookNumber, chapter, verse]
      : [bookNumber, chapter, verse, bookNumber, chapter, verse];
    executeSql(
      myBibleDB,
      isFav ? DELETE_FAVORITE_VERSE : INSERT_FAVORITE_VERSE,
      params
    );
  };

  const onSaveNote = async (
    data: { title: string; content: string },
    closeCallback: any
  ) => {
    if (!myBibleDB || !executeSql) return;
    await executeSql(myBibleDB, INSERT_INTO_NOTE, [data.title, data.content]);
    closeCallback();
  };
  const onUpdateNote = async (
    data: { title: string; content: string },
    id: number,
    closeCallback: any
  ) => {
    if (!myBibleDB || !executeSql) return;
    await executeSql(myBibleDB, UPDATE_NOTE_BY_ID, [
      data.title,
      data.content,
      id,
    ]);
    closeCallback();
  };

  const onDeleteNote = async (id: number) => {
    if (!myBibleDB || !executeSql) return;
    await executeSql(myBibleDB, DELETE_NOTE, [id]);
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
    dispatch({ type: "SET_VERSE_IN_STRONG_DISPLAY", payload: 0 });
    saveData({ currentBibleVersion: version });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  };
  const setStrongWord = (item: IStrongWord) => {
    dispatch({ type: "SET_STRONG_WORD", payload: item });
  };
  const setverseInStrongDisplay = (verse: number) => {
    if (currentBibleVersion === EBibleVersions.NTV) return;
    dispatch({ type: "SET_VERSE_IN_STRONG_DISPLAY", payload: verse });
  };

  const contextValue = {
    ...state,
    searchState,
    highlightVerse,
    clearHighlights,
    selectFont,
    onSaveNote,
    onDeleteNote,
    onUpdateNote,
    selectBibleVersion,
    toggleCopyMode,
    decreaseFontSize,
    increaseFontSize,
    removeHighlistedVerse,
    performSearch: performSearch as typeof performSearch,
    setSearchQuery,
    selectTheme,
    toggleCopySearch,
    toggleViewLayoutGrid,
    toggleFavoriteVerse,
    setStrongWord,
    setverseInStrongDisplay,
  };

  return (
    <BibleContext.Provider value={contextValue}>
      {children}
    </BibleContext.Provider>
  );
};

export const useBibleContext = (): BibleState => useContext(BibleContext);

export default BibleProvider;
