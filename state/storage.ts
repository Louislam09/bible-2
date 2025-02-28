// import { configureSynced, syncObservable } from "@legendapp/state/sync";
// import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { StorageKeys } from "@/constants/StorageKeys";
// import { batch, observable } from "@legendapp/state";
// import { EBibleVersions, SortOption, TFont } from "@/types";

// type IBibleQuery = {
//   book: string;
//   chapter: number;
//   verse: number;
//   bottomSideBook: string;
//   bottomSideChapter: number;
//   bottomSideVerse: number;
//   isBibleBottom: boolean;
//   isHistory: boolean;
//   shouldFetch: boolean;
// };

// const persistOptions = configureSynced({
//   persist: {
//     plugin: observablePersistAsyncStorage({ AsyncStorage }),
//   },
// });

// export const setupPersistence = (state$: any) => {
//   syncObservable(
//     state$,
//     persistOptions({
//       persist: {
//         name: StorageKeys.STORAGE,
//         // transform: {
//         //   load(value, method) {
//         //     console.log({ value, method });
//         //   },
//         // },
//       },
//     })
//   );
// };

// export const storageState$ = observable({
//   currentTheme: "Green",
//   fontSize: 24,
//   selectedFont: TFont.Roboto,
//   isDarkMode: true,
//   isGridLayout: false,
//   isShowName: false,
//   currentBibleVersion: EBibleVersions.BIBLE,
//   isSongLyricEnabled: false,
//   songFontSize: 21,
//   currentVoiceIdentifier: "es-us-x-esd-local",
//   currentVoiceRate: 1,
//   floatingNoteButtonPosition: { x: 0, y: 0 },
//   memorySortOption: SortOption.MostRecent,
//   deleteLastStreakNumber: 1,
//   bibleQuery: {
//     book: "Génesis",
//     chapter: 1,
//     verse: 1,
//     bottomSideBook: "Génesis",
//     bottomSideChapter: 1,
//     bottomSideVerse: 1,
//     isBibleBottom: false,
//     isHistory: false,
//     shouldFetch: true,
//   },
//   isDataLoading: {
//     top: true,
//     bottom: false,
//   },
//   changeBibleQuery: (query: Partial<IBibleQuery>) => {
//     console.log("🟡 ChangeBibleQuery 🟡");
//     const loadingKey = query.isBibleBottom ? "bottom" : "top";
//     const newQuery = { ...storageState$.bibleQuery.get(), ...query };
//     batch(() => {
//       storageState$.isDataLoading[loadingKey].set(query.shouldFetch || false);
//       storageState$.bibleQuery.set(newQuery);
//     });
//   },
// });

// setupPersistence(storageState$);
