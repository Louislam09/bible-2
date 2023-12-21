/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

export type RootStackParamList = {
  Home: NavigatorScreenParams<RootTabParamList> | { book?: string; chapter?: string | number; };
  Book: NavigatorScreenParams<RootTabParamList> | undefined;
  ChooseChapterNumber: NavigatorScreenParams<RootTabParamList> | { book?: string; chapter?: string | number; };
  Modal: undefined;
  NotFound: undefined;
};

export enum Screens {
  Home = 'Home',
  Book = 'Book',
  ChooseChapterNumber = 'ChooseChapterNumber'
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export interface HomeParams {
  book?: string;
  chapter?: number | string;
  strongKey?: string;
}

export type RootTabParamList = {
  Home: undefined;
  Book: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;

export interface IDBBookNames {
  bookColor: string;
  bookNumber: number;
  longName: string;
  shortName: string;
}

export interface BookChapter {
  [key: string]: number;
}

export interface IBookVerse {
  bookNumber: number;
  chapter: number;
  text: string;
  verse: 1
}