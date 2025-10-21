import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { observable } from "@legendapp/state";
import { createRef } from "react";

export const modalState$ = observable({
  compareRef: createRef<BottomSheetModal>(),
  strongSearchRef: createRef<BottomSheetModal>(),
  isChooseReferenceOpened: false,
  dictionaryRef: createRef<BottomSheetModal>(),
  explainVerseRef: createRef<BottomSheetModal>(),
  interlinealRef: createRef<BottomSheetModal>(),
  searchFilterRef: createRef<BottomSheetModal>(),
  strongSearchFilterRef: createRef<BottomSheetModal>(),
  multipleStrongsRef: createRef<BottomSheetModal>(),
  searchWordOnDic: "",
  isSheetClosed: true,

  setSearchWordOnDic: (word: string) => {
    modalState$.searchWordOnDic.set(word);
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
    modalState$.explainVerseRef.current?.close();
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
    modalState$.explainVerseRef.current?.expand();
  },
  closeExplainVerseBottomSheet: () => {
    modalState$.isSheetClosed.set(true);
    modalState$.explainVerseRef.current?.close();
  },
  openInterlinealBottomSheet: () => {
    modalState$.isSheetClosed.set(false);
    modalState$.explainVerseRef.current?.close();
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
  toggleIsChooseReferenceOpened: () => {
    modalState$.isChooseReferenceOpened.set(!modalState$.isChooseReferenceOpened.get());
  },
});
