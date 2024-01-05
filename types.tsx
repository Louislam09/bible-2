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

export type RootTabParamList = {
  Home: undefined;
  Book: undefined;
};

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

export type TRoute = RouteProp<ParamListBase>;

export enum TFont {
  Roboto = "Roboto",
  // ComingSoon = "ComingSoon",
  OpenSans = "OpenSans",
  Cardo = "Cardo",
}

export enum TVersion {
  RVR1960 = "RVR1960",
  RVR1965 = "RVR1965",
}

export type TSubtitle = {
  book_number: number;
  chapter: number;
  order_if_several: number;
  subheading: string;
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
  bookNumber: number;
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
