import BibleAction from "actions/bible.action";
import { BibleState } from "types";

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
        isSplitActivated: !state.isSplitActivated,
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

export default bibleReducer;
