import { BottomSheetModal } from "@gorhom/bottom-sheet";
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
  strongSearchRef: createRef<BottomSheetModal>(),
  dictionaryRef: createRef<BottomSheetModal>(),
  commentaryRef: createRef<BottomSheetModal>(),
  interlinealRef: createRef<BottomSheetModal>(),
  searchFilterRef: createRef<BottomSheetModal>(),
  strongSearchFilterRef: createRef<BottomSheetModal>(),
  multipleStrongsRef: createRef<BottomSheetModal>(),
  bibleSettingRef: createRef<BottomSheetModal>(),
  searchWordOnDic: "",
  commentaryReference: { bookNumber: 40, chapter: 1, verse: 1 },
  chooseReferenceStep: ChooseReferenceStep.InBookSelection,
  setChooseReferenceStep: (step: ChooseReferenceStep) => {
    modalState$.chooseReferenceStep.set(step);
  },
  isSheetClosed: true,
  showUserTooltip: false,
  // Modal open state flags for conditional rendering (only for WebView-based modals)
  isStrongSearchOpen: false,
  isDictionaryOpen: false,
  isCommentaryOpen: false,
  isInterlinearOpen: false,
  isMultipleStrongsOpen: false,
  isBibleSettingOpen: false,

  openUserTooltip: () => {
    modalState$.showUserTooltip.set(true);
  },
  closeUserTooltip: () => {
    modalState$.showUserTooltip.set(false);
  },

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
    modalState$.strongSearchRef.current?.dismiss();
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
    modalState$.strongSearchRef.current?.dismiss();
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
    modalState$.multipleStrongsRef.current?.dismiss();
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
});
