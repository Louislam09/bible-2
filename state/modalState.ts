import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import { observable } from "@legendapp/state";
import { createRef } from "react";

export enum ChooseReferenceStep {
  InBookSelection = "inBookSelection",
  InChapterSelection = "inChapterSelection",
  InVerseSelection = "inVerseSelection",
  Finished = "finished",
}

export const modalState$ = observable({
  compareRef: createRef<BottomSheetModal>(),
  strongSearchRef: createRef<BottomSheet>(),
  dictionaryRef: createRef<BottomSheetModal>(),
  commentaryRef: createRef<BottomSheetModal>(),
  interlinealRef: createRef<BottomSheetModal>(),
  searchFilterRef: createRef<BottomSheetModal>(),
  strongSearchFilterRef: createRef<BottomSheetModal>(),
  multipleStrongsRef: createRef<BottomSheet>(),
  bibleSettingRef: createRef<BottomSheetModal>(),
  highlighterRef: createRef<BottomSheet>(),
  noteListRef: createRef<BottomSheet>(),
  noteActionsRef: createRef<BottomSheet>(),
  searchWordOnDic: "",
  commentaryReference: { bookNumber: 40, chapter: 1, verse: 1 },
  highlighterReference: { bookNumber: 40, chapter: 1, verse: 1 },
  chooseReferenceStep: ChooseReferenceStep.InBookSelection,
  setChooseReferenceStep: (step: ChooseReferenceStep) => {
    modalState$.chooseReferenceStep.set(step);
  },
  isSheetClosed: true,
  // Modal open state flags for conditional rendering (only for WebView-based modals)
  isStrongSearchOpen: false,
  isDictionaryOpen: false,
  isCommentaryOpen: false,
  isInterlinearOpen: false,
  isMultipleStrongsOpen: false,
  isBibleSettingOpen: false,
  isHighlighterOpen: false,
  isNoteListOpen: false,
  isNoteActionsOpen: false,
  previewHighlight: { color: "", style: "" },

  setSearchWordOnDic: (word: string) => {
    const cleanedWord = word.replace(/[.,:;?!]/g, "");
    modalState$.searchWordOnDic.set(cleanedWord);
  },
  handleSheetChange: (index: number) => {
    modalState$.isSheetClosed.set(index <= 0);
  },
  openCompareBottomSheet: () => {
    modalState$.compareRef.current?.present();
  },
  closeCompareBottomSheet: () => {
    modalState$.compareRef.current?.dismiss();
  },
  openStrongSearchBottomSheet: () => {
    modalState$.isSheetClosed.set(false);
    modalState$.isStrongSearchOpen.set(true);
    // present() will be called by useEffect in the component after mount
  },
  closeStrongSearchBottomSheet: () => {
    modalState$.isStrongSearchOpen.set(false);
    modalState$.strongSearchRef.current?.close();
  },
  openDictionaryBottomSheet: (text: string) => {
    modalState$.setSearchWordOnDic(text);
    modalState$.isDictionaryOpen.set(true);
    // present() will be called by useEffect in the component after mount
  },
  closeDictionaryBottomSheet: () => {
    modalState$.isDictionaryOpen.set(false);
    modalState$.dictionaryRef.current?.dismiss();
  },
  openExplainVerseBottomSheet: () => {
    modalState$.isSheetClosed.set(false);
    modalState$.isStrongSearchOpen.set(false);
    modalState$.strongSearchRef.current?.close();
  },
  closeExplainVerseBottomSheet: () => {
    modalState$.isSheetClosed.set(true);
  },
  openInterlinealBottomSheet: () => {
    modalState$.isSheetClosed.set(false);
    modalState$.isInterlinearOpen.set(true);
    // expand() will be called by useEffect in the component after mount
  },
  closeInterlinealBottomSheet: () => {
    modalState$.isSheetClosed.set(true);
    modalState$.isInterlinearOpen.set(false);
    modalState$.interlinealRef.current?.close();
    // modalState$.interlinealRef.current?.dismiss();
  },
  openMultipleStrongsBottomSheet: () => {
    modalState$.isMultipleStrongsOpen.set(true);
    // present() will be called by useEffect in the component after mount
  },
  closeMultipleStrongsBottomSheet: () => {
    modalState$.isMultipleStrongsOpen.set(false);
    modalState$.multipleStrongsRef.current?.close();
  },
  openSearchFilterBottomSheet: () => {
    modalState$.searchFilterRef.current?.present();
  },
  closeSearchFilterBottomSheet: () => {
    modalState$.searchFilterRef.current?.dismiss();
  },
  openStrongSearchFilterBottomSheet: () => {
    modalState$.strongSearchFilterRef.current?.present();
  },
  closeStrongSearchFilterBottomSheet: () => {
    modalState$.strongSearchFilterRef.current?.dismiss();
  },
  openBibleSettingBottomSheet: () => {
    modalState$.isBibleSettingOpen.set(true);
    // present() will be called by useEffect in the component after mount
  },
  closeBibleSettingBottomSheet: () => {
    modalState$.isBibleSettingOpen.set(false);
    modalState$.bibleSettingRef.current?.dismiss();
  },
  openCommentaryBottomSheet: (bookNumber: number, chapter: number, verse: number) => {
    modalState$.commentaryReference.set({ bookNumber, chapter, verse });
    modalState$.isCommentaryOpen.set(true);
    // present() will be called by useEffect in the component after mount
  },
  closeCommentaryBottomSheet: () => {
    modalState$.isCommentaryOpen.set(false);
    modalState$.commentaryRef.current?.dismiss();
  },
  openHighlighterBottomSheet: (bookNumber?: number, chapter?: number, verse?: number) => {
    if (bookNumber !== undefined && chapter !== undefined && verse !== undefined) {
      modalState$.highlighterReference.set({ bookNumber, chapter, verse });
    }
    modalState$.isHighlighterOpen.set(true);
    // present() will be called by useEffect in the component after mount
  },
  closeHighlighterBottomSheet: () => {
    modalState$.isHighlighterOpen.set(false);
    modalState$.highlighterRef.current?.close();
  },
  openNoteListBottomSheet: () => {
    modalState$.isNoteListOpen.set(true);
    // snapToIndex will be called by onLayout in the component
  },
  closeNoteListBottomSheet: () => {
    modalState$.isNoteListOpen.set(false);
    modalState$.noteListRef.current?.close();
  },
  openNoteActionsBottomSheet: () => {
    modalState$.isNoteActionsOpen.set(true);
  },
  closeNoteActionsBottomSheet: () => {
    modalState$.isNoteActionsOpen.set(false);
  },
});
