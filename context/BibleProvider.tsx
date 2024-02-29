import React, { useEffect, useReducer } from "react";
import {
  EThemes,
  IBookVerse,
  EBibleVersions,
  IFavoriteVerse,
  IStrongWord,
} from "../types";
import useCustomFonts from "../hooks/useCustomFonts";
import { useDBContext } from "./databaseContext";
import useSearch from "hooks/useSearch";
import { useStorage } from "./LocalstoreContext";
import {
  DELETE_FAVORITE_VERSE,
  INSERT_FAVORITE_VERSE,
  INSERT_INTO_NOTE,
} from "constants/Queries";
import { bibleReducer, initialContext, BibleContext } from "./BibleContext";

export const BibleProvider: React.FC<{ children: React.ReactNode }> = ({
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

  const onSaveNote = (data: { title: string; content: string }) => {
    if (!myBibleDB || !executeSql) return;
    executeSql(myBibleDB, INSERT_INTO_NOTE[(datatitle, content)]);
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
