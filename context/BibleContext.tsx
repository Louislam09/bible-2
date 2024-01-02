import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { IBookVerse, TFont, TVersion } from "../types";
import useCustomFonts from "../hooks/useCustomFonts";

type BibleState = {
  highlightedVerses: IBookVerse[];
  highlightVerse: Function;
  clearHighlights: Function;
  selectFont: Function;
  selectBibleVersion: Function;
  removeHighlistedVerse: Function;
  toggleCopyMode: Function;
  decreaseFontSize: Function;
  increaseFontSize: Function;
  selectedFont: string;
  currentBibleVersion: string;
  isCopyMode: boolean;
  fontSize: number;
};

type BibleAction =
  | { type: "HIGHLIGHT_VERSE"; payload: IBookVerse }
  | { type: "REMOVE_HIGHLIGHT_VERSE"; payload: IBookVerse }
  | { type: "SELECT_FONT"; payload: string }
  | { type: "INCREASE_FONT_SIZE" }
  | { type: "DECREASE_FONT_SIZE" }
  | { type: "SELECT_BIBLE_VERSION"; payload: string }
  | { type: "CLEAR_HIGHLIGHTS" }
  | { type: "TOGGLE_COPY_MODE" };

const initialContext: BibleState = {
  highlightedVerses: [],
  highlightVerse: () => {},
  removeHighlistedVerse: () => {},
  clearHighlights: () => {},
  selectBibleVersion: () => {},
  selectFont: () => {},
  toggleCopyMode: () => {},
  decreaseFontSize: () => {},
  increaseFontSize: () => {},
  selectedFont: TFont.Roboto,
  currentBibleVersion: TVersion.RVR1960,
  isCopyMode: false,
  fontSize: 24,
};

export const BibleContext = createContext<BibleState | any>(initialContext);

const bibleReducer = (state: BibleState, action: BibleAction): BibleState => {
  switch (action.type) {
    case "HIGHLIGHT_VERSE":
      return {
        ...state,
        highlightedVerses: [...state.highlightedVerses, action.payload],
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
    default:
      return state;
  }
};

export const BibleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(bibleReducer, initialContext);
  const fontsLoaded = useCustomFonts();

  if (!fontsLoaded) {
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
  };
  const increaseFontSize = () => {
    dispatch({ type: "INCREASE_FONT_SIZE" });
  };
  const toggleCopyMode = () => {
    dispatch({ type: "TOGGLE_COPY_MODE" });
  };

  const selectFont = (font: string) => {
    dispatch({ type: "SELECT_FONT", payload: font });
  };
  const selectBibleVersion = (version: string) => {
    dispatch({ type: "SELECT_BIBLE_VERSION", payload: version });
  };

  const contextValue = {
    ...state,
    highlightVerse,
    clearHighlights,
    selectFont,
    selectBibleVersion,
    toggleCopyMode,
    decreaseFontSize,
    increaseFontSize,
    removeHighlistedVerse,
  };

  return (
    <BibleContext.Provider value={contextValue}>
      {children}
    </BibleContext.Provider>
  );
};

export const useBibleContext = (): BibleState => useContext(BibleContext);
