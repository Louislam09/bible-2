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
    modalState$.strongSearchRef.current?.present();
  },
  openDictionaryBottomSheet: (text: string) => {
    modalState$.setSearchWordOnDic(text);
    modalState$.dictionaryRef.current?.present();
  },
  closeDictionaryBottomSheet: () => {
    modalState$.dictionaryRef.current?.dismiss();
  },
  openExplainVerseBottomSheet: () => {
    modalState$.isSheetClosed.set(false);
    modalState$.strongSearchRef.current?.dismiss();
  },
  closeExplainVerseBottomSheet: () => {
    modalState$.isSheetClosed.set(true);
  },
  openInterlinealBottomSheet: () => {
    modalState$.isSheetClosed.set(false);
    modalState$.interlinealRef.current?.expand();
  },
  closeInterlinealBottomSheet: () => {
    modalState$.isSheetClosed.set(true);
    modalState$.interlinealRef.current?.close();
  },
  openMultipleStrongsBottomSheet: () => {
    modalState$.multipleStrongsRef.current?.present();
  },
  closeMultipleStrongsBottomSheet: () => {
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
    modalState$.bibleSettingRef.current?.present();
  },
  closeBibleSettingBottomSheet: () => {
    modalState$.bibleSettingRef.current?.dismiss();
  },
  openCommentaryBottomSheet: (bookNumber: number, chapter: number, verse: number) => {
    modalState$.commentaryReference.set({ bookNumber, chapter, verse });
    modalState$.commentaryRef.current?.present();
  },
  closeCommentaryBottomSheet: () => {
    modalState$.commentaryRef.current?.dismiss();
  },
});
