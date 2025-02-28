import { useEffect, useMemo } from "react";
import { useStorage } from "@/context/LocalstoreContext";
import useParams from "./useParams";
import { HomeParams } from "@/types";

export interface InitialState {
  book: string;
  chapter: number;
  verse: number;
  bottomSideBook: string;
  bottomSideChapter: number;
  bottomSideVerse: number;
  isTour?: boolean;
  isVerseTour?: boolean;
  isHistory?: boolean;
}

export type StateChangeDetector = (
  prevState: InitialState,
  newState: InitialState
) => boolean;

export const DEFAULT_VALUES = {
  INITIAL_BOOK: "Genesis",
  INITIAL_CHAPTER: 1,
  INITIAL_VERSE: 1,
  MIN_CHAPTER: 1,
  MIN_VERSE: 1,
} as const;

export const useInitialState = (): InitialState => {
  const routeParams = useParams<HomeParams>();

  const { storedData } = useStorage();

  const initialState = useMemo(() => {
    return {
      isTour: routeParams.isTour ?? false,
      isHistory: routeParams.isHistory ?? false,
      isVerseTour: routeParams.isVerseTour ?? false,
      book: routeParams.book ?? storedData.lastBook,
      chapter: routeParams.chapter ?? storedData.lastChapter,
      verse:
        routeParams.verse === 0 ? 1 : routeParams.verse ?? storedData.lastVerse,
      bottomSideBook:
        routeParams.bottomSideBook ?? storedData.lastBottomSideBook,
      bottomSideChapter:
        routeParams.bottomSideChapter ?? storedData.lastBottomSideChapter,
      bottomSideVerse:
        routeParams.bottomSideVerse === 0
          ? 1
          : routeParams.bottomSideVerse ?? storedData.lastBottomSideVerse,
    };
  }, [
    routeParams.book,
    routeParams.chapter,
    routeParams.verse,
    routeParams.bottomSideBook,
    routeParams.bottomSideChapter,
    routeParams.bottomSideVerse,
    storedData.lastBook,
    storedData.lastChapter,
    storedData.lastVerse,
    storedData.lastBottomSideBook,
    storedData.lastBottomSideChapter,
    storedData.lastBottomSideVerse,
  ]);

  const validatedState = useMemo(() => {
    return {
      ...initialState,
      chapter: Math.max(1, Number(initialState.chapter)),
      verse: Math.max(1, Number(initialState.verse)),
      bottomSideChapter: Math.max(1, Number(initialState.bottomSideChapter)),
      bottomSideVerse: Math.max(1, Number(initialState.bottomSideVerse)),
    };
  }, [initialState]);

  useEffect(() => {
    // console.log(validatedState);
  }, [validatedState]);

  return validatedState;
};

export const hasStateChanged = (
  prevState: InitialState,
  newState: InitialState
): boolean => {
  return (
    prevState.book !== newState.book ||
    prevState.chapter !== newState.chapter ||
    prevState.verse !== newState.verse ||
    prevState.bottomSideBook !== newState.bottomSideBook ||
    prevState.bottomSideChapter !== newState.bottomSideChapter ||
    prevState.bottomSideVerse !== newState.bottomSideVerse
  );
};
