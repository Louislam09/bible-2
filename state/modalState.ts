import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { observable } from "@legendapp/state";
import { createRef } from "react";

export const modalState$ = observable({
  compareRef: createRef<BottomSheetModal>(),
  strongSearchRef: createRef<BottomSheetModal>(),
  dictionaryRef: createRef<BottomSheetModal>(),
  explainVerseRef: createRef<BottomSheetModal>(),
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
    modalState$.strongSearchRef.current?.expand();
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
    modalState$.strongSearchRef.current?.close();
    modalState$.explainVerseRef.current?.expand();
  },
  closeExplainVerseBottomSheet: () => {
    modalState$.isSheetClosed.set(true);
    modalState$.explainVerseRef.current?.close();
  },
  // openExplainVerseBottomSheet: () => {
  //   modalState$.explainVerseRef.current?.present();
  // },
  // closeExplainVerseBottomSheet: () => {
  //   modalState$.explainVerseRef.current?.dismiss();
  // },
});
