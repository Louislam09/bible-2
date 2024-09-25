import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BottomSheetModal } from "@gorhom/bottom-sheet";

interface ModalContextType {
  compareRefHandlePresentModalPress: () => void;
  strongSearchHandlePresentModalPress: () => void;
  dictionaryHandlePresentModalPress: (text: string) => void;
  setCompareRef: (ref: React.RefObject<BottomSheetModal>) => void;
  setStrongSearchRef: (ref: React.RefObject<BottomSheetModal>) => void;
  setDictionaryRef: (ref: React.RefObject<BottomSheetModal>) => void;
  searchWordOnDic: string;
  setSearchWordOnDic: (word: string) => void;
  isSheetClosed: boolean,
  handleSheetChange: (index: number) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [compareRef, setCompareRef] = useState<React.RefObject<BottomSheetModal> | null>(null);
  const [strongSearchRef, setStrongSearchRef] = useState<React.RefObject<BottomSheetModal> | null>(null);
  const [dictionaryRef, setDictionaryRef] = useState<React.RefObject<BottomSheetModal> | null>(null);
  const [searchWordOnDic, setSearchWordOnDic] = useState("");
  const [isSheetClosed, setSheetClosed] = useState(true);

  const compareRefHandlePresentModalPress = useCallback(() => {
    compareRef?.current?.present();
  }, [compareRef]);

  const strongSearchHandlePresentModalPress = useCallback(() => {
    setSheetClosed(false)
    strongSearchRef?.current?.expand();
  }, [strongSearchRef]);

  const dictionaryHandlePresentModalPress = useCallback((text: string) => {
    setSearchWordOnDic(text);
    dictionaryRef?.current?.present();
  }, [dictionaryRef]);

  const handleSheetChange = (index: number) => {
    setSheetClosed(index <= 0);
  };

  const value = {
    compareRefHandlePresentModalPress,
    strongSearchHandlePresentModalPress,
    dictionaryHandlePresentModalPress,
    setCompareRef: setCompareRef as (ref: React.RefObject<BottomSheetModal>) => void,
    setStrongSearchRef: setStrongSearchRef as (ref: React.RefObject<BottomSheetModal>) => void,
    setDictionaryRef: setDictionaryRef as (ref: React.RefObject<BottomSheetModal>) => void,
    searchWordOnDic,
    setSearchWordOnDic,
    isSheetClosed,
    handleSheetChange
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
