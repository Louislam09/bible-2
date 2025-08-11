import { IBibleLink, IBookVerse, IBookVerseInterlinear, IStrongWord } from "@/types";
import { getChapterTextRaw } from "@/utils/getVerseTextRaw";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { batch, observable } from "@legendapp/state";
import { createRef } from "react";

type IBibleQuery = {
  book: string;
  chapter: number;
  verse: number;
  bottomSideBook: string;
  bottomSideChapter: number;
  bottomSideVerse: number;
  isBibleBottom: boolean;
  isHistory: boolean;
  shouldFetch: boolean;
};

type BibleData = {
  topVerses: IBookVerse[];
  bottomVerses: IBookVerse[];
  topLinks?: IBibleLink[];
  bottomLinks?: IBibleLink[];
  interlinearVerses?: IBookVerse[];
};

export function getReadingTime(verses: IBookVerse[], wordsPerMinute = 200) {
  const text = getChapterTextRaw(verses);
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export const bibleState$ = observable({
  isBottomBibleSearching: false,
  currentVerse: 0,
  verseWithAiAnimation: 0,
  verseToCompare: 0,
  verseToExplain: { text: "", reference: "" },
  verseToInterlinear: {
    book_number: 0,
    chapter: 0,
    verse: 0,
    text: {} as IBookVerseInterlinear,
  },
  isVerseDoubleTagged: false,
  selectedVerses: observable(new Map<number, IBookVerse>()),
  selectedVerseForNote: observable<string | null>(null),
  lastSelectedVerse: null as IBookVerse | null,
  currentNoteId: null as number | null,
  reloadNotes: false,
  reloadFavorites: false,
  isSyncingNotes: false,
  floatingNoteButtonPosition: { x: 0, y: 75 },
  strongWord: { text: "", code: "" } as IStrongWord,
  noteListBottomSheetRef: createRef<BottomSheetModal>(),
  isSplitActived: false,
  currentHistoryIndex: -1,
  bibleQuery: {
    book: "Génesis",
    chapter: 1,
    verse: 1,
    bottomSideBook: "Génesis",
    bottomSideChapter: 1,
    bottomSideVerse: 1,
    isBibleBottom: false,
    isHistory: false,
    shouldFetch: true,
  },
  isDataLoading: { top: true, bottom: false },
  bibleData: { topVerses: [], bottomVerses: [], topLinks: [], bottomLinks: [], interlinearVerses: [] } as BibleData,
  readingTimeData: { top: 0, bottom: 0 },
  changeBibleQuery: (query: Partial<IBibleQuery>) => {
    // console.log("🟡 ChangeBibleQuery 🟡");
    const loadingKey = query.isBibleBottom ? "bottom" : "top";
    const newQuery = { ...bibleState$.bibleQuery.get(), ...query };
    batch(() => {
      bibleState$.bibleQuery.set(newQuery);
      bibleState$.isDataLoading[loadingKey].set(query.shouldFetch || false);
    });
  },
  handleSplitActived: () => {
    bibleState$.isSplitActived.set(() => !bibleState$.isSplitActived.get());
  },
  handleBottomBibleSearching: (value: boolean) => {
    bibleState$.isBottomBibleSearching.set(() => value);
  },
  handleFloatingNoteButtonPosition: (x: number, y: number) => {
    bibleState$.floatingNoteButtonPosition.set({ x, y });
  },
  handleStrongWord: (strongWord: IStrongWord) => {
    bibleState$.strongWord.set(strongWord);
  },
  openNoteListBottomSheet() {
    bibleState$.noteListBottomSheetRef.current?.present();
  },
  closeNoteListBottomSheet() {
    bibleState$.noteListBottomSheetRef.current?.dismiss();
  },
  clearSelection: () => {
    bibleState$.currentVerse.set(0);
    bibleState$.selectedVerses.set(new Map());
  },
  handleTapVerse: (verseItem: IBookVerse) => {
    const verseNumber = verseItem.verse;
    if (
      bibleState$.currentVerse.get() === verseNumber &&
      !bibleState$.isVerseDoubleTagged.get()
    ) {
      bibleState$.isVerseDoubleTagged.set(false);
      bibleState$.currentVerse.set(0);
    } else {
      bibleState$.isVerseDoubleTagged.set(false);
      bibleState$.currentVerse.set(verseNumber);
    }
  },
  handleDoubleTapVerse: (verseItem: IBookVerse) => {
    const verseNumber = verseItem.verse;
    if (
      bibleState$.currentVerse.get() === verseNumber &&
      bibleState$.isVerseDoubleTagged.get()
    ) {
      bibleState$.isVerseDoubleTagged.set(false);
      bibleState$.currentVerse.set(0);
    } else {
      bibleState$.isVerseDoubleTagged.set(true);
      bibleState$.currentVerse.set(verseNumber);
    }
  },
  handleLongPressVerse: (verseItem: IBookVerse) => {
    const selectedVerses = new Map(bibleState$.selectedVerses.get());

    if (selectedVerses.has(verseItem.verse)) {
      selectedVerses.delete(verseItem.verse);
    } else {
      selectedVerses.set(verseItem.verse, verseItem);
    }

    bibleState$.selectedVerses.set(selectedVerses);

    const lastSelected = Array.from(selectedVerses.values())
      .sort((a, b) => a.verse - b.verse)
      .pop();
    bibleState$.lastSelectedVerse.set(lastSelected || null);
  },
  handleSelectVerseForNote: (text: string) => {
    bibleState$.selectedVerseForNote.set(text);
  },
  clearSelectedVerseForNote: () => {
    bibleState$.selectedVerseForNote.set(null);
  },
  handleCurrentHistoryIndex: (index: number) => {
    bibleState$.currentHistoryIndex.set(index);
  },
  toggleReloadNotes: () => {
    bibleState$.reloadNotes.set(() => !bibleState$.reloadNotes.get());
  },
  toggleReloadFavorites: () => {
    bibleState$.reloadFavorites.set(() => !bibleState$.reloadFavorites.get());
  },
  handleVerseToExplain: (verse: { text: string; reference: string }) => {
    bibleState$.verseToExplain.set(verse);
  },
  handleVerseWithAiAnimation: (verseNumber: number) => {
    bibleState$.verseWithAiAnimation.set(verseNumber);
  },
  handleVerseToInterlinear: (verse: {
    book_number: number;
    chapter: number;
    verse: number;
    text: IBookVerseInterlinear;
  }) => {
    bibleState$.verseToInterlinear.set(verse);
  },
});
