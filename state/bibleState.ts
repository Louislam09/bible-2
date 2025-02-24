import { EBibleVersions, IBookVerse } from "@/types";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { observable } from "@legendapp/state";
import { createRef } from "react";

// export const currentVerse$ = observable(0);
export const highlightedVerses$ = observable<IBookVerse[]>([]);
export const currentBibleVersion$ = observable<string>(EBibleVersions.BIBLE);
export const fontSize$ = observable<number>(24);

export const bibleState$ = observable({
  isBottomBibleSearching: false,
  currentVerse: 0,
  verseToCompare: 0,
  isVerseDoubleTagged: false,
  selectedVerses: observable(new Map<number, IBookVerse>()),
  selectedVerseForNote: observable<string | null>(null),
  lastSelectedVerse: null as IBookVerse | null,
  currentNoteId: null as number | null,
  floatingNoteButtonPosition: { x: 0, y: 75 },
  noteListBottomSheetRef: createRef<BottomSheetModal>(),
  handleFloatingNoteButtonPosition: (x: number, y: number) => {
    bibleState$.floatingNoteButtonPosition.set({ x, y });
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
  //   compareRefHandlePresentModalPress: () => {
  //     bibleState$.compareRef.current?.present();
  //   }
});
