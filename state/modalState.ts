import { observable } from "@legendapp/state";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { createRef } from "react";

export const modalState$ = observable({
  compareRef: createRef<BottomSheetModal>(),
  strongSearchRef: createRef<BottomSheetModal>(),
  dictionaryRef: createRef<BottomSheetModal>(),
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
    modalState$.strongSearchRef.current?.present();
  },
  openDictionaryBottomSheet: (text: string) => {
    modalState$.setSearchWordOnDic(text);
    modalState$.dictionaryRef.current?.present();
  },
  closeDictionaryBottomSheet: () => {
    modalState$.dictionaryRef.current?.dismiss();
  },
});
