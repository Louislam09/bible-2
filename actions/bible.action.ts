import { IBookVerse, EThemes, IStrongWord } from "types";

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

export default BibleAction;
