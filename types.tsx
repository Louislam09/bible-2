/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
  ParamListBase,
  RouteProp,
  Theme,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootTabParamList = {
  Home: undefined;
  Book: undefined;
  Search: undefined;
};

export type RootStackParamList = {
  Home:
    | NavigatorScreenParams<RootTabParamList>
    | { book?: string; chapter?: string | number; verse?: string | number };
  Book: NavigatorScreenParams<RootTabParamList> | undefined;
  Search: NavigatorScreenParams<RootTabParamList> | { book?: string };
  ChooseChapterNumber:
    | NavigatorScreenParams<RootTabParamList>
    | { book?: string; chapter?: string | number };
  ChooseVerseNumber:
    | NavigatorScreenParams<RootTabParamList>
    | { book?: string; chapter?: string | number; verse?: string | number };
  Modal: undefined;
  NotFound: undefined;
};

export enum Screens {
  Home = "Home",
  Search = "Search",
  Book = "Book",
  ChooseChapterNumber = "ChooseChapterNumber",
  ChooseVerseNumber = "ChooseVerseNumber",
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export interface HomeParams {
  book?: string;
  chapter?: number | string;
  verse?: number | string;
  strongKey?: string;
}

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;

export interface IDBBookNames {
  bookColor: string;
  bookNumber: number;
  longName: string;
  shortName: string;
}
export interface IDBBookChapterVerse {
  bookNumber: number;
  chapterNumber: number;
  verseCount: number;
}

export type TRoute = RouteProp<ParamListBase>;

export enum TFont {
  Roboto = "Roboto",
  // ComingSoon = "ComingSoon",
  OpenSans = "OpenSans",
  Cardo = "Cardo",
}

export enum EBibleVersions {
  RVR60 = "RVR60",
  // RVR1965 = "RVR1965",
  NTV = "NTV",
}

export type TSubtitle = {
  book_number: number;
  chapter: number;
  order_if_several: number;
  subheading?: string;
  title?: string;
  verse: number;
};

export type TChapter = {
  dimensions: any;
  item: {
    verses: IBookVerse[];
    subtitles: TSubtitle[];
  };
};

export type TVerse = {
  item: IBookVerse;
  index: number;
  setSelectedWord: any;
  setOpen: any;
  subtitles: TSubtitle[];
};

export interface BookChapter {
  [key: string]: number;
}

export interface IVerseItem {
  book_number: number;
  chapter: number;
  text: string;
  verse: number;
  bookName?: string;
}

export interface IBookVerse {
  bookNumber: number;
  chapter: number;
  text: string;
  verse: number;
  subheading?: string;
  order_if_several?: number;
}

export type TTheme = Theme & {
  colors?: { backgroundContrast?: string };
};

export enum BookIndexes {
  Genesis = 0,
  Malaquias = 39,
  Mateo = 39,
  Apocalipsis = 66,
}

export enum EBookIndexesAudio {
  None,
  Génesis,
  Éxodo,
  Levítico,
  Números,
  Deuteronomio,
  Josué,
  Jueces,
  Rut,
  "1 Samuel",
  "2 Samuel",
  "1 Reyes",
  "2 Reyes",
  "1 Crónicas",
  "2 Crónicas",
  Esdras,
  Nehemías,
  Ester,
  Job,
  Salmos,
  Proverbios,
  Eclesiastés,
  "Cantar de los Cantares",
  Isaías,
  Jeremías,
  Lamentaciones,
  Ezequiel,
  Daniel,
  Oseas,
  Joel,
  Amós,
  Abdías,
  Jonás,
  Miqueas,
  Nahum,
  Habacuc,
  Sofonías,
  Hageo,
  Zacarías,
  Malaquías,
  Mateo,
  Marcos,
  Lucas,
  Juan,
  "Hechos de los Apóstoles",
  Romanos,
  "1 Corintios",
  "2 Corintios",
  Gálatas,
  Efesios,
  Filipenses,
  Colosenses,
  "1 Tesalonicenses",
  "2 Tesalonicenses",
  "1 Timoteo",
  "2 Timoteo",
  Tito,
  Filemón,
  Hebreos,
  Santiago,
  "1 Pedro",
  "2 Pedro",
  "1 Juan",
  "2 Juan",
  "3 Juan",
  Judas,
  "Apocalipsis (de Juan)",
}

export enum EThemes {
  Orange = "#9f463c",
  Cyan = "#20acb6",
  BlueLight = "#3b88bf",
  Green = "#78b0a4",
  Red = "#FF5252",
  Purple = "#2032ac",
  BlueGreen = "#239db8",
  Pink = "#aa2c50",
  PinkLight = "#874a69",
  Yellow = "#c4c733",
  Blue = "#2a7ac6",
  BlackWhite = "#000",
}
