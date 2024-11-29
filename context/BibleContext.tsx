import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import {
  DELETE_FAVORITE_VERSE,
  DELETE_NOTE,
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
  highlightedVerses: IBookVerse[];
  highlightVerse: Function;
  clearHighlights: Function;
  setSearchQuery: Function;
  selectFont: Function;
  onDeleteNote: (id: number) => void;
  onAddToNote: (text: string) => void;
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
  removeHighlistedVerse: Function;
  toggleCopyMode: Function;
  toggleSplitMode: Function;
  toggleBottomSideSearching: (value: boolean) => void;
  decreaseFontSize: Function;
  setStrongWord: (word: IStrongWord) => void;
  setVerseToCompare: (verse: number) => void;
  setChapterLengthNumber: (chapterLengthNumber: number) => void;
  setShouldLoop: (shouldLoop: boolean) => void;
  setChapterVerses: (currentChapterVerses: IBookVerse[]) => void;
  setCurrentNoteId: (noteId: number | null) => void;
  setverseInStrongDisplay: (verse: number) => void;
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
  chapterVerseLength: number;
  shouldLoopReading: boolean;
  currentBibleVersion: string;
  searchQuery: string;
  addToNoteText: string;
  currentTheme: keyof typeof EThemes;
  isCopyMode: boolean;
  viewLayoutGrid: boolean;
  fontSize: number;
  verseInStrongDisplay: number;
  currentNoteId: number | null;
  verseToCompare: number;
  searchState: UseSearchHookState;
  strongWord: IStrongWord;
  searchHistorial: EHistoryItem[];
  currentChapterVerses: IBookVerse[];
  currentHistoryIndex: number;
  goBackOnHistory?: (index: number) => void;
  goForwardOnHistory?: (index: number) => void;
  orientation: "LANDSCAPE" | "PORTRAIT";
  isSplitActived: boolean;
  isBottomSideSearching: boolean;
  currentBibleLongName: string;
  noteListBottomSheetRef: React.RefObject<BottomSheetModalMethods> | null;
  noteListPresentModalPress: () => void;
  noteListDismissModalPress: () => void;
};

type BibleAction =
  | { type: "HIGHLIGHT_VERSE"; payload: IBookVerse }
  | { type: "REMOVE_HIGHLIGHT_VERSE"; payload: IBookVerse }
  | { type: "SELECT_FONT"; payload: string }
  | { type: "SELECT_THEME"; payload: keyof typeof EThemes }
  | { type: "INCREASE_FONT_SIZE" }
  | { type: "DECREASE_FONT_SIZE" }
  | { type: "SELECT_BIBLE_VERSION"; payload: string }
  | { type: "ADD_TO_NOTE"; payload: string }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "GO_BACK"; payload: number }
  | { type: "GO_FORWARD"; payload: number }
  | { type: "SET_CURRENT_NOTE_ID"; payload: number | null }
  | { type: "SET_VERSE_IN_STRONG_DISPLAY"; payload: number }
  | { type: "SET_VERSE_TO_COMPARE"; payload: number }
  | { type: "SET_CHAPTER_VERSE_LENGTH"; payload: number }
  | { type: "SET_REPEAT_READING"; payload: boolean }
  | { type: "SET_CHAPTER_VERSES"; payload: any[] }
  | { type: "SET_STRONG_WORD"; payload: IStrongWord }
  | { type: "CLEAR_HIGHLIGHTS" }
  | { type: "SET_LOCAL_DATA"; payload: any }
  | { type: "TOGGLE_COPY_MODE"; payload?: boolean }
  | { type: "TOGGLE_SECOND_SIDE"; payload: boolean }
  | { type: "TOGGLE_SPLIT_MODE"; payload?: boolean }
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
  setCurrentNoteId: (noteId: number | null) => {},
  setverseInStrongDisplay: (verse: number) => {},
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
  currentNoteId: null,
  chapterVerseLength: 0,
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
  currentChapterVerses: [],
  noteListBottomSheetRef: null,
  noteListPresentModalPress: () => {},
  noteListDismissModalPress: () => {},
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
    case "ADD_TO_NOTE":
      return {
        ...state,
        addToNoteText: action.payload,
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
    case "SET_CURRENT_NOTE_ID":
      return {
        ...state,
        currentNoteId: action.payload,
      };
    case "SET_VERSE_IN_STRONG_DISPLAY":
      return {
        ...state,
        verseInStrongDisplay: action.payload,
      };
    case "SET_VERSE_TO_COMPARE":
      return {
        ...state,
        verseToCompare: action.payload,
      };
    case "SET_CHAPTER_VERSE_LENGTH":
      return {
        ...state,
        chapterVerseLength: action.payload,
      };
    case "SET_REPEAT_READING":
      return {
        ...state,
        shouldLoopReading: action.payload,
      };
    case "SET_CHAPTER_VERSES":
      return {
        ...state,
        currentChapterVerses: action.payload,
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
  const noteListBottomSheetRef = useRef<BottomSheetModal>(null);

  const noteListPresentModalPress = useCallback(() => {
    noteListBottomSheetRef.current?.present();
  }, []);
  const noteListDismissModalPress = useCallback(() => {
    noteListBottomSheetRef.current?.dismiss();
  }, []);

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
  const removeHighlistedVerse = (verseItem: IBookVerse) => {
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
  const setCurrentNoteId = (noteId: number | null) => {
    dispatch({ type: "SET_CURRENT_NOTE_ID", payload: noteId });
  };
  const setverseInStrongDisplay = (verse: number) => {
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
    noteListBottomSheetRef,
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
    removeHighlistedVerse,
    performSearch: performSearch as typeof performSearch,
    setSearchQuery,
    selectTheme,
    toggleViewLayoutGrid,
    toggleFavoriteVerse,
    setStrongWord,
    setCurrentNoteId,
    setverseInStrongDisplay,
    setVerseToCompare,
    setChapterLengthNumber,
    setShouldLoop,
    setChapterVerses,
    onAddToNote,
    goBackOnHistory,
    goForwardOnHistory,
    toggleBottomSideSearching,
    noteListPresentModalPress,
    noteListDismissModalPress,
  };

  return (
    <BibleContext.Provider value={contextValue}>
      {children}
    </BibleContext.Provider>
  );
};

export const useBibleContext = (): BibleState => useContext(BibleContext);

export default BibleProvider;
