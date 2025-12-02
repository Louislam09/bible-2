import { observable } from "@legendapp/state";
import { createRef } from "react";

export const tourState$ = observable({
  // Home screen refs
  bookSelector: createRef<any>(),
  nextButton: createRef<any>(),
  previousButton: createRef<any>(),
  audio: createRef<any>(),
  dashboard: createRef<any>(),
  bibleVersion: createRef<any>(),
  search: createRef<any>(),
  setting: createRef<any>(),
  fav: createRef<any>(),
  moveForwardButton: createRef<any>(),
  moveBackwardButton: createRef<any>(),

  // Additional refs for tutorials
  chapterSelector: createRef<any>(),
  versionSelector: createRef<any>(),
  toolbar: createRef<any>(),
  splitScreenButton: createRef<any>(),
  splitScreenLine: createRef<any>(),
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

  startReferenceTour: false,
  startVerseSectionTour: false,
});

// Helper function to get ref by name (outside the observable)
export const getTourRef = (refName: string) => {
  const refObservable = (tourState$ as any)[refName];
  // Use peek() to get the value without subscribing
  return refObservable?.peek ? refObservable.peek() : null;
};
