import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import {
  DELETE_FAVORITE_VERSE,
  DELETE_NOTE,
  DELETE_NOTE_ALL,
  INSERT_FAVORITE_VERSE,
  INSERT_INTO_NOTE,
  UPDATE_NOTE_BY_ID,
} from "@/constants/Queries";
import useSearch, { UseSearchHookState } from "@/hooks/useSearch";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Dimensions, ToastAndroid } from "react-native";
import getCurrentDbName from "@/utils/getCurrentDB";
import useCustomFonts from "../hooks/useCustomFonts";
import {
  EBibleVersions,
  EHistoryItem,
  EThemes,
  IBookVerse,
  IFavoriteVerse,
  IStrongWord,
  TFont,
} from "../types";
import { useDBContext } from "./databaseContext";
import { useStorage } from "./LocalstoreContext";

type BibleState = {
  setSearchQuery: Function;
  selectFont: Function;
  onDeleteNote: (id: number) => void;
  onDeleteAllNotes: () => void;
  onUpdateNote: (
    data: { title: string; content: string },
    id: number,
    closeCallback: any
  ) => void;
  onSaveNote: (
    data: { title: string; content: string },
    closeCallback: any
  ) => void;
  selectBibleVersion: (version: string) => Promise<void>;
  // toggleCopyMode: Function;
  toggleSplitMode: Function;
  toggleBottomSideSearching: (value: boolean) => void;
  decreaseFontSize: Function;
  setStrongWord: (word: IStrongWord) => void;
  setVerseToCompare: (verse: number) => void;
  setShouldLoop: (shouldLoop: boolean) => void;
  // setverseInStrongDisplay: (verse: number) => void;
  toggleFavoriteVerse: ({
    bookNumber,
    chapter,
    verse,
    isFav,
  }: IFavoriteVerse) => Promise<void>;
  increaseFontSize: Function;
  toggleViewLayoutGrid: Function;
  selectTheme: Function;
  setLocalData: Function;
  performSearch: Function;
  selectedFont: string;
  shouldLoopReading: boolean;
  currentBibleVersion: string;
  searchQuery: string;
  currentTheme: keyof typeof EThemes;
  viewLayoutGrid: boolean;
  fontSize: number;
  verseToCompare: number;
  searchState: UseSearchHookState;
  strongWord: IStrongWord;
  searchHistorial: EHistoryItem[];
  currentHistoryIndex: number;
  goBackOnHistory?: (index: number) => void;
  goForwardOnHistory?: (index: number) => void;
  orientation: "LANDSCAPE" | "PORTRAIT";
  isSplitActived: boolean;
  isBottomSideSearching: boolean;
  currentBibleLongName: string;
};

type BibleAction =
  | { type: "SELECT_FONT"; payload: string }
  | { type: "SELECT_THEME"; payload: keyof typeof EThemes }
  | { type: "INCREASE_FONT_SIZE" }
  | { type: "DECREASE_FONT_SIZE" }
  | { type: "SELECT_BIBLE_VERSION"; payload: string }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "GO_BACK"; payload: number }
  | { type: "GO_FORWARD"; payload: number }
  // | { type: 'SET_VERSE_IN_STRONG_DISPLAY'; payload: number }
  | { type: "SET_VERSE_TO_COMPARE"; payload: number }
  | { type: "SET_CHAPTER_VERSE_LENGTH"; payload: number }
  | { type: "SET_REPEAT_READING"; payload: boolean }
  | { type: "SET_CHAPTER_VERSES"; payload: any[] }
  | { type: "SET_STRONG_WORD"; payload: IStrongWord }
  | { type: "SET_LOCAL_DATA"; payload: any }
  // | { type: "TOGGLE_COPY_MODE"; payload?: boolean }
  | { type: "TOGGLE_SECOND_SIDE"; payload: boolean }
  | { type: "TOGGLE_SPLIT_MODE"; payload?: boolean }
  | { type: "TOGGLE_VIEW_LAYOUT_GRID" }
  | { type: "TOGGLE_COPY_SEARCH"; payload: boolean };

const defaultSearch = {
  searchResults: [],
  error: null,
};

const initialContext: BibleState = {
  selectBibleVersion: (version: string) => {
    return new Promise((resolve) => resolve());
  },
  onSaveNote: () => {},
  onUpdateNote: () => {},
  onDeleteNote: () => {},
  onDeleteAllNotes: () => {},
  selectFont: () => {},
  selectTheme: () => {},
  // toggleCopyMode: () => {},
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
  setShouldLoop: (shouldLoop: boolean) => {},
  // setverseInStrongDisplay: (verse: number) => {},
  increaseFontSize: () => {},
  toggleViewLayoutGrid: () => {},
  setLocalData: () => {},
  setStrongWord: () => {},
  performSearch: () => {},
  setSearchQuery: () => {},
  selectedFont: TFont.Roboto,
  currentBibleVersion: EBibleVersions.BIBLE,
  isBottomSideSearching: false,
  fontSize: 24,
  searchState: defaultSearch,
  searchQuery: "",
  // verseInStrongDisplay: 0,
  shouldLoopReading: false,
  verseToCompare: 1,
  currentTheme: "Blue",
  isSplitActived: false,
  viewLayoutGrid: true,
  strongWord: { text: "", code: "" },
  searchHistorial: [],
  currentHistoryIndex: -1,
  orientation: "PORTRAIT",
  currentBibleLongName: "Reina Valera 1960",
};

export const BibleContext = createContext<BibleState | any>(initialContext);

const bibleReducer = (state: BibleState, action: BibleAction): BibleState => {
  switch (action.type) {
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
    case "TOGGLE_SPLIT_MODE":
      return {
        ...state,
        isSplitActived: !state.isSplitActived,
      };
    case "TOGGLE_SECOND_SIDE":
      return {
        ...state,
        isBottomSideSearching: action.payload,
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
    // case 'SET_VERSE_IN_STRONG_DISPLAY':
    //   return {
    //     ...state,
    //     verseInStrongDisplay: action.payload,
    //   };
    case "SET_VERSE_TO_COMPARE":
      return {
        ...state,
        verseToCompare: action.payload,
      };
    case "SET_REPEAT_READING":
      return {
        ...state,
        shouldLoopReading: action.payload,
      };
    case "GO_BACK":
      return {
        ...state,
        currentHistoryIndex: action.payload,
      };
    case "GO_FORWARD":
      return {
        ...state,
        currentHistoryIndex: action.payload,
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

  if (!fontsLoaded || !isDataLoaded || !isInstallBiblesLoaded) {
    return null;
  }

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
  // const toggleCopyMode = () => {
  //   dispatch({ type: "TOGGLE_COPY_MODE" });
  // };
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
      isFav ? DELETE_FAVORITE_VERSE : INSERT_FAVORITE_VERSE,
      params
    );
  };

  const onSaveNote = async (
    data: { title: string; content: string },
    closeCallback: any
  ) => {
    if (!myBibleDB || !executeSql) return;
    await executeSql(INSERT_INTO_NOTE, [data.title, data.content]);
    closeCallback();
  };
  const onUpdateNote = async (
    data: { title: string; content: string },
    id: number,
    closeCallback: any
  ) => {
    if (!myBibleDB || !executeSql) return;
    await executeSql(UPDATE_NOTE_BY_ID, [data.title, data.content, id]);
    closeCallback();
  };

  const onDeleteNote = async (id: number) => {
    if (!myBibleDB || !executeSql) return;
    await executeSql(DELETE_NOTE, [id]);
  };
  const onDeleteAllNotes = async () => {
    if (!myBibleDB || !executeSql) return;
    await executeSql(DELETE_NOTE_ALL, []);
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
    // dispatch({ type: 'SET_VERSE_IN_STRONG_DISPLAY', payload: 0 });
    await saveData({ currentBibleVersion: version });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  };
  const setStrongWord = (item: IStrongWord) => {
    dispatch({ type: "SET_STRONG_WORD", payload: item });
  };
  // const setverseInStrongDisplay = (verse: number) => {
  //   if (currentBibleVersion !== EBibleVersions.BIBLE) return;
  //   dispatch({ type: 'SET_VERSE_IN_STRONG_DISPLAY', payload: verse });
  // };
  const setVerseToCompare = (verse: number) => {
    dispatch({ type: "SET_VERSE_TO_COMPARE", payload: verse });
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

  const contextValue = {
    ...state,
    orientation,
    searchState,
    currentBibleLongName,
    selectFont,
    onSaveNote,
    onDeleteNote,
    onDeleteAllNotes,
    onUpdateNote,
    selectBibleVersion,
    // toggleCopyMode,
    toggleSplitMode,
    decreaseFontSize,
    increaseFontSize,
    performSearch: performSearch as typeof performSearch,
    setSearchQuery,
    selectTheme,
    toggleViewLayoutGrid,
    toggleFavoriteVerse,
    setStrongWord,
    // setverseInStrongDisplay,
    setVerseToCompare,
    setShouldLoop,
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
