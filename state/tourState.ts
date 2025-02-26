import { observable } from "@legendapp/state";
import { createRef } from "react";

export const tourState$ = observable({
  footerTitleRef: createRef<any>(),
  nextButton: createRef<any>(),
  backButton: createRef<any>(),
  audio: createRef<any>(),
  dashboard: createRef<any>(),
  bibleVersion: createRef<any>(),
  search: createRef<any>(),
  setting: createRef<any>(),
  fav: createRef<any>(),
  tourPopoverVisible: null as unknown as "EMPTY" | "VERSE" | "FUNCTION",
  setTourPopoverVisible: (tour: "EMPTY" | "VERSE" | "FUNCTION") => {
    tourState$.tourPopoverVisible.set(tour);
  },
});
