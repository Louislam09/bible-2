import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import {
  DELETE_NOTE,
  DELETE_NOTE_ALL,
  INSERT_INTO_NOTE,
  UPDATE_NOTE_BY_ID,
} from "@/constants/Queries";
import useHistoryManager, { HistoryManager } from "@/hooks/useHistoryManager";
import useSearch, { UseSearchHookState } from "@/hooks/useSearch";
import { useFavoriteVerseService } from "@/services/favoriteVerseService";
import { authState$ } from "@/state/authState";
import { bibleState$ } from "@/state/bibleState";
import { settingState$ } from "@/state/settingState";
import getCurrentDbName from "@/utils/getCurrentDB";
import { use$ } from "@legendapp/state/react";
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Dimensions, ToastAndroid } from "react-native";
import useCustomFonts from "../hooks/useCustomFonts";
import {
  EBibleVersions,
  EHistoryItem,
  EThemes,
  IFavoriteVerse,
  TFont,
} from "../types";
import { useDBContext } from "./databaseContext";
import { storedData$ } from "./LocalstoreContext";

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
  handleFontSize: (value: number) => void;
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
  searchState: UseSearchHookState;
  searchHistorial: EHistoryItem[];
  currentHistoryIndex: number;
  goBackOnHistory?: (index: number) => void;
  goForwardOnHistory?: (index: number) => void;
  orientation: "LANDSCAPE" | "PORTRAIT";
  currentBibleLongName: string;
  historyManager: HistoryManager;
  syncLocalSettings: () => void;
};

type BibleAction =
  | { type: "SELECT_FONT"; payload: string }
  | { type: "SELECT_THEME"; payload: keyof typeof EThemes }
  | { type: "INCREASE_DECREASE_FONT_SIZE"; payload: number }
  | { type: "SELECT_BIBLE_VERSION"; payload: string }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "GO_BACK"; payload: number }
  | { type: "GO_FORWARD"; payload: number }
  | { type: "SET_VERSE_TO_COMPARE"; payload: number }
  | { type: "SET_CHAPTER_VERSE_LENGTH"; payload: number }
  | { type: "SET_REPEAT_READING"; payload: boolean }
  | { type: "SET_CHAPTER_VERSES"; payload: any[] }
  | { type: "SET_LOCAL_DATA"; payload: any }
  | { type: "TOGGLE_SECOND_SIDE"; payload: boolean }
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
  onSaveNote: () => { },
  onUpdateNote: () => { },
  onDeleteNote: () => { },
  onDeleteAllNotes: () => { },
  selectFont: () => { },
  selectTheme: () => { },
  handleFontSize: () => { },
  toggleFavoriteVerse: async ({
    bookNumber,
    chapter,
    verse,
    isFav,
  }: IFavoriteVerse) => { },
  setShouldLoop: (shouldLoop: boolean) => { },
  // setverseInStrongDisplay: (verse: number) => {},
  increaseFontSize: () => { },
  toggleViewLayoutGrid: () => { },
  setLocalData: () => { },
  performSearch: () => { },
  setSearchQuery: () => { },
  syncLocalSettings: () => { },
  selectedFont: TFont.Roboto,
  currentBibleVersion: EBibleVersions.BIBLE,
  fontSize: 24,
  searchState: defaultSearch,
  searchQuery: "",
  shouldLoopReading: false,
  currentTheme: "Blue",
  viewLayoutGrid: true,
  searchHistorial: [],
  currentHistoryIndex: -1,
  orientation: "PORTRAIT",
  currentBibleLongName: "Reina Valera 1960",
  historyManager: {} as HistoryManager,
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
    case "INCREASE_DECREASE_FONT_SIZE":
      return {
        ...state,
        fontSize: action.payload,
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
  const storedData = use$(() => ({
    fontSize: storedData$.fontSize.get(),
    currentTheme: storedData$.currentTheme.get(),
    selectedFont: storedData$.selectedFont.get(),
  }));
  const { fontSize, currentTheme, selectedFont } = storedData;
  const currentBibleVersion = use$(() => storedData$.currentBibleVersion.get());
  const isDataLoaded = use$(() => storedData$.isDataLoaded.get());
  const requiresSettingsReloadAfterSync = use$(() =>
    settingState$.requiresSettingsReloadAfterSync.get()
  );

  const historyManager = useHistoryManager();
  const [state, dispatch] = useReducer(bibleReducer, initialContext);
  const fontsLoaded = useCustomFonts();
  const {
    myBibleDB,
    executeSql,
    isInstallBiblesLoaded,
    installedBibles,
    isMyBibleDbLoaded,
  } = useDBContext();
  const { state: searchState, performSearch } = useSearch({ db: myBibleDB });
  const [currentBibleLongName, setCurrentBibleLongName] = useState(
    getCurrentDbName(currentBibleVersion, installedBibles)
  );
  const [orientation, setOrientation] = useState("PORTRAIT");
  const { addFavoriteVerse, removeFavoriteVerse } = useFavoriteVerseService();
  const logo = require('../assets/images/icon.png')

  const getOrientation = () => {
    const { height, width } = Dimensions.get("window");
    if (width > height) {
      setOrientation("LANDSCAPE");
    } else {
      setOrientation("PORTRAIT");
    }
  };

  const syncLocalSettings = async () => {
    dispatch({
      type: "SET_LOCAL_DATA",
      payload: {
        currentBibleVersion,
        fontSize,
        currentTheme,
        selectedFont,
      },
    });
  };

  useEffect(() => {
    setCurrentBibleLongName(
      getCurrentDbName(currentBibleVersion, installedBibles)
    );
  }, [currentBibleVersion, installedBibles]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const initLocalSettings = async () => {
      await authState$.checkSession();
      await syncLocalSettings();
    };

    initLocalSettings();
  }, [isDataLoaded]);

  useEffect(() => {
    if (requiresSettingsReloadAfterSync) {
      console.log("⚠ Reloading settings after cloud sync");

      dispatch({
        type: "SET_LOCAL_DATA",
        payload: {
          currentBibleVersion: storedData$.currentBibleVersion.get(),
          fontSize: storedData$.fontSize.get(),
          currentTheme: storedData$.currentTheme.get(),
          selectedFont: storedData$.selectedFont.get(),
          viewLayoutGrid: storedData$.isGridLayout.get(),
        },
      });

      settingState$.requiresSettingsReloadAfterSync.set(false);
    }
  }, [requiresSettingsReloadAfterSync]);

  useEffect(() => {
    getOrientation();
    const subscription = Dimensions.addEventListener("change", getOrientation);
    return () => {
      subscription?.remove();
    };
  }, []);

  if (
    !fontsLoaded ||
    !isDataLoaded ||
    !isInstallBiblesLoaded ||
    !isMyBibleDbLoaded
  ) {
    return (
      <ScreenWithAnimation imageSource={logo} isVisible titleColor={'white'} backgroundColor='#0d3f3e' iconColor='white' title="Cargado..." icon="BookPlus">
        <></>
      </ScreenWithAnimation>
    );
  }

  const goBackOnHistory = (index: number) => {
    dispatch({ type: "GO_BACK", payload: index });
  };
  const goForwardOnHistory = (index: number) => {
    dispatch({ type: "GO_FORWARD", payload: index });
  };

  const handleFontSize = (value: number) => {
    dispatch({ type: "INCREASE_DECREASE_FONT_SIZE", payload: value });
    storedData$.fontSize.set(value);
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
    try {
      if (isFav) {
        await removeFavoriteVerse(bookNumber, chapter, verse);
      } else {
        await addFavoriteVerse(bookNumber, chapter, verse);
      }
    } catch (error) {
      console.error("Error toggling favorite verse:", error);
    } finally {
      bibleState$.toggleReloadFavorites();
    }
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
    storedData$.selectedFont.set(font);
  };
  const selectTheme = (theme: keyof typeof EThemes) => {
    dispatch({ type: "SELECT_THEME", payload: theme });
    storedData$.currentTheme.set(theme);
  };
  const selectBibleVersion = async (version: string) => {
    dispatch({ type: "SELECT_BIBLE_VERSION", payload: version });
    storedData$.currentBibleVersion.set(version);
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
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
    historyManager,
    selectFont,
    onSaveNote,
    onDeleteNote,
    onDeleteAllNotes,
    onUpdateNote,
    selectBibleVersion,
    handleFontSize,
    performSearch: performSearch as typeof performSearch,
    setSearchQuery,
    selectTheme,
    toggleViewLayoutGrid,
    toggleFavoriteVerse,
    setShouldLoop,
    goBackOnHistory,
    goForwardOnHistory,
    syncLocalSettings,
  };

  return (
    <BibleContext.Provider value={contextValue}>
      {children}
    </BibleContext.Provider>
  );
};

export const useBibleContext = (): BibleState => useContext(BibleContext);

export default BibleProvider;
