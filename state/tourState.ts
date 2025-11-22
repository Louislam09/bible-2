import { observable } from "@legendapp/state";
import { createRef } from "react";

export const tourState$ = observable({
  // Home screen refs
  footerTitleRef: createRef<any>(),
  nextButton: createRef<any>(),
  backButton: createRef<any>(),
  audio: createRef<any>(),
  dashboard: createRef<any>(),
  bibleVersion: createRef<any>(),
  search: createRef<any>(),
  setting: createRef<any>(),
  fav: createRef<any>(),

  // Additional refs for tutorials
  bookSelector: createRef<any>(),
  chapterSelector: createRef<any>(),
  versionSelector: createRef<any>(),
  toolbar: createRef<any>(),
  splitScreenButton: createRef<any>(),
  verseContent: createRef<any>(),
  floatingNotesButton: createRef<any>(),
  searchInput: createRef<any>(),
  notesList: createRef<any>(),
  favoritesList: createRef<any>(),
  hymnalButton: createRef<any>(),
  gamesButton: createRef<any>(),
  memorizationButton: createRef<any>(),
  themeSelector: createRef<any>(),
  fontSelector: createRef<any>(),
  cloudSyncButton: createRef<any>(),
  notificationSettings: createRef<any>(),

  tourPopoverVisible: null as unknown as "EMPTY" | "VERSE" | "FUNCTION",
  setTourPopoverVisible: (tour: "EMPTY" | "VERSE" | "FUNCTION") => {
    tourState$.tourPopoverVisible.set(tour);
  },
});

// Helper function to get ref by name (outside the observable)
export const getTourRef = (refName: string) => {
  const refObservable = (tourState$ as any)[refName];
  // Use peek() to get the value without subscribing
  return refObservable?.peek ? refObservable.peek() : null;
};
