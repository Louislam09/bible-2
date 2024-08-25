import {
  DELETE_FAVORITE_VERSE,
  DELETE_NOTE,
  INSERT_FAVORITE_VERSE,
  INSERT_INTO_NOTE,
  UPDATE_NOTE_BY_ID,
} from "constants/Queries";
import useSearch from "hooks/useSearch";
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Dimensions, ToastAndroid } from "react-native";
import bibleReducer from "reducers/bible.reducer";
import getCurrentDbName from "utils/getCurrentDB";
import useCustomFonts from "../hooks/useCustomFonts";
import {
  BibleState,
  EBibleVersions,
  EThemes,
  IBookVerse,
  IFavoriteVerse,
  IStrongWord,
  TFont,
} from "../types";
import { useDBContext } from "./databaseContext";
import { useStorage } from "./LocalstoreContext";

const defaultSearch = {
  searchResults: [],
  error: null,
};

const initialContext: BibleState = {
  highlightedVerses: [],
  highlightVerse: () => {},
  removeHighlightedVerse: () => {},
  clearHighlights: () => {},
  selectBibleVersion: (version: string) => {
    return new Promise((resolve) => resolve());
  },
  onSaveNote: () => {},
  onUpdateNote: () => {},
  onDeleteNote: () => {},
  selectFont: () => {},
  selectTheme: () => {},
  toggleCopyMode: () => {},
  toggleSplitMode: () => {},
  toggleBottomSideSearching: (value: boolean) => {},
  decreaseFontSize: () => {},
  toggleFavoriteVerse: async ({
    bookNumber,
    chapter,
    verse,
    isFav,
  }: IFavoriteVerse) => {},
  setVerseToCompare: (verse: number) => {},
  setChapterLengthNumber: (chapterLengthNumber: number) => {},
  setShouldLoop: (shouldLoop: boolean) => {},
  setChapterVerses: (currentChapterVerses: IBookVerse[]) => {},
  setVerseInStrongDisplay: (verse: number) => {},
  onAddToNote: (text: string) => {},
  increaseFontSize: () => {},
  toggleViewLayoutGrid: () => {},
  setLocalData: () => {},
  setStrongWord: () => {},
  performSearch: () => {},
  setSearchQuery: () => {},
  selectedFont: TFont.Roboto,
  currentBibleVersion: EBibleVersions.BIBLE,
  isCopyMode: false,
  isBottomSideSearching: false,
  fontSize: 24,
  searchState: defaultSearch,
  searchQuery: "",
  addToNoteText: "",
  verseInStrongDisplay: 0,
  chapterVerseLength: 0,
  shouldLoopReading: false,
  verseToCompare: 1,
  currentTheme: "Blue",
  isSplitActivated: false,
  viewLayoutGrid: true,
  strongWord: { text: "", code: "" },
  searchHistorial: [],
  currentHistoryIndex: -1,
  orientation: "PORTRAIT",
  currentBibleLongName: "Reina Valera 1960",
  currentChapterVerses: [],
  searchHistory: [],
};

export const BibleContext = createContext<BibleState | any>(initialContext);

const BibleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { storedData, saveData, isDataLoaded } = useStorage();
  const { currentBibleVersion, fontSize, currentTheme, selectedFont } =
    storedData;
  const [state, dispatch] = useReducer(bibleReducer, initialContext);
  const fontsLoaded = useCustomFonts();
  const { myBibleDB, executeSql, isInstallBiblesLoaded, installedBibles } =
    useDBContext();
  const { state: searchState, performSearch } = useSearch({ db: myBibleDB });
  const [currentBibleLongName, setCurrentBibleLongName] = useState(
    getCurrentDbName(currentBibleVersion, installedBibles)
  );
  const [orientation, setOrientation] = useState("PORTRAIT");

  const getOrientation = () => {
    const { height, width } = Dimensions.get("window");
    if (width > height) {
      setOrientation("LANDSCAPE");
    } else {
      setOrientation("PORTRAIT");
    }
  };

  useEffect(() => {
    setCurrentBibleLongName(
      getCurrentDbName(currentBibleVersion, installedBibles)
    );
  }, [currentBibleVersion, installedBibles]);

  useEffect(() => {
    getOrientation();
    const subscription = Dimensions.addEventListener("change", getOrientation);
    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (!isDataLoaded) return;
    dispatch({
      type: "SET_LOCAL_DATA",
      payload: {
        currentBibleVersion,
        fontSize,
        currentTheme,
        selectedFont,
      },
    });
  }, [isDataLoaded]);

  useEffect(() => {
    if (state.highlightedVerses.length) return;
    if (!state.isCopyMode) return;
    dispatch({ type: "TOGGLE_COPY_MODE", payload: false });
  }, [state.highlightedVerses]);

  if (!fontsLoaded || !isDataLoaded || !isInstallBiblesLoaded) {
    return null;
  }

  const highlightVerse = (verseItem: IBookVerse) => {
    dispatch({ type: "HIGHLIGHT_VERSE", payload: verseItem });
  };
  const removeHighlightedVerse = (verseItem: IBookVerse) => {
    dispatch({ type: "REMOVE_HIGHLIGHT_VERSE", payload: verseItem });
  };

  const clearHighlights = () => {
    dispatch({ type: "CLEAR_HIGHLIGHTS" });
  };
  const goBackOnHistory = (index: number) => {
    dispatch({ type: "GO_BACK", payload: index });
  };
  const goForwardOnHistory = (index: number) => {
    dispatch({ type: "GO_FORWARD", payload: index });
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
  const toggleSplitMode = () => {
    dispatch({ type: "TOGGLE_SPLIT_MODE" });
  };
  const toggleBottomSideSearching = (value: boolean) => {
    dispatch({ type: "TOGGLE_SECOND_SIDE", payload: value });
  };

  const toggleViewLayoutGrid = () => {
    dispatch({ type: "TOGGLE_VIEW_LAYOUT_GRID" });
  };

  const toggleFavoriteVerse = async ({
    bookNumber,
    chapter,
    verse,
    isFav,
  }: IFavoriteVerse) => {
    if (!myBibleDB || !executeSql) return;
    const params = isFav
      ? [bookNumber, chapter, verse]
      : [bookNumber, chapter, verse, bookNumber, chapter, verse];
    await executeSql(
      myBibleDB,
      isFav ? DELETE_FAVORITE_VERSE : INSERT_FAVORITE_VERSE,
      params
    );
  };

  const onAddToNote = (text: string) => {
    dispatch({ type: "ADD_TO_NOTE", payload: text });
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
  const selectBibleVersion = async (version: string) => {
    dispatch({ type: "SELECT_BIBLE_VERSION", payload: version });
    dispatch({ type: "SET_VERSE_IN_STRONG_DISPLAY", payload: 0 });
    await saveData({ currentBibleVersion: version });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  };
  const setStrongWord = (item: IStrongWord) => {
    dispatch({ type: "SET_STRONG_WORD", payload: item });
  };
  const setVerseInStrongDisplay = (verse: number) => {
    if (currentBibleVersion !== EBibleVersions.BIBLE) return;
    dispatch({ type: "SET_VERSE_IN_STRONG_DISPLAY", payload: verse });
  };
  const setVerseToCompare = (verse: number) => {
    dispatch({ type: "SET_VERSE_TO_COMPARE", payload: verse });
  };
  const setChapterLengthNumber = (chapterLengthNumber: number) => {
    dispatch({
      type: "SET_CHAPTER_VERSE_LENGTH",
      payload: chapterLengthNumber,
    });
  };
  const setShouldLoop = (shouldLoop: boolean) => {
    const msg = shouldLoop
      ? "Reproducción automática: Activada ✅"
      : "Reproducción automática: Desactivada ❌";
    ToastAndroid.show(msg, ToastAndroid.SHORT);
    dispatch({
      type: "SET_REPEAT_READING",
      payload: shouldLoop,
    });
  };
  const setChapterVerses = (currentChapterVerses: IBookVerse[]) => {
    dispatch({
      type: "SET_CHAPTER_VERSES",
      payload: currentChapterVerses,
    });
  };

  const contextValue = {
    ...state,
    orientation,
    searchState,
    currentBibleLongName,
    highlightVerse,
    clearHighlights,
    selectFont,
    onSaveNote,
    onDeleteNote,
    onUpdateNote,
    selectBibleVersion,
    toggleCopyMode,
    toggleSplitMode,
    decreaseFontSize,
    increaseFontSize,
    removeHighlightedVerse,
    performSearch: performSearch as typeof performSearch,
    setSearchQuery,
    selectTheme,
    toggleViewLayoutGrid,
    toggleFavoriteVerse,
    setStrongWord,
    setverseInStrongDisplay: setVerseInStrongDisplay,
    setVerseToCompare,
    setChapterLengthNumber,
    setShouldLoop,
    setChapterVerses,
    onAddToNote,
    goBackOnHistory,
    goForwardOnHistory,
    toggleBottomSideSearching,
  };

  return (
    <BibleContext.Provider value={contextValue}>
      {children}
    </BibleContext.Provider>
  );
};

export const useBibleContext = (): BibleState => useContext(BibleContext);

export default BibleProvider;
