/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
  ParamListBase,
  RouteProp,
  Theme,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { IconProps } from "components/Icon";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export enum Screens {
  Dashboard = "Dashboard",
  Settings = "Settings",
  Home = "Home",
  Search = "Search",
  Concordance = "Concordance",
  Book = "Book",
  ChooseBook = "ChooseBook",
  ChooseChapterNumber = "ChooseChapterNumber",
  ChooseVerseNumber = "ChooseVerseNumber",
  Favorite = "Favorite",
  DownloadManager = "DownloadManager",
  Notes = "Notes",
  Onboarding = "Onboarding",
  Character = "Character",
  Song = "Song",
  StrongSearchEntire = "StrongSearchEntire",
  DictionarySearch = "DictionarySearch",
  NoteDetail = "NoteDetail",
}

type TScreensName = { [key in Screens]: string };

export const ScreensName: TScreensName = {
  [Screens.Home]: "Santa Escritura",
  [Screens.Book]: "Libros",
  [Screens.Search]: "Busqueda",
  [Screens.Concordance]: "Concordancia",
  [Screens.ChooseBook]: "Seleccione un libro",
  [Screens.ChooseChapterNumber]: "Capitulos",
  [Screens.ChooseVerseNumber]: "Versiculos",
  [Screens.Favorite]: "Versiculos Favoritos",
  [Screens.Notes]: "Notas",
  [Screens.Dashboard]: "Dashboard",
  [Screens.Settings]: "Ajustes",
  [Screens.DownloadManager]: "Gestor de descargas",
  [Screens.Onboarding]: "Guia",
  [Screens.Character]: "Personaje",
  [Screens.Song]: "Himnario",
  [Screens.StrongSearchEntire]: "Explorador de Números Strong",
  [Screens.DictionarySearch]: "Dictionary Search",
  [Screens.NoteDetail]: "Nota",
};

// export type RootTabParamList = { [key in Screens]: any };
export type RootTabParamList = {
  Dashboard: undefined;
  Settings: undefined;
  Home: undefined;
  Book: undefined;
  ChooseBook: { book: string };
  Search: undefined;
  Concordance: undefined;
  StrongSearchEntire: undefined;
  DownloadManager: undefined;
  Notes: undefined;
  NoteDetail: undefined;
  Favorite: undefined;
  NotFound: undefined;
  DictionarySearch: undefined;
};

export type RootStackParamList = {
  Dashboard: NavigatorScreenParams<RootTabParamList> | undefined;
  Settings: NavigatorScreenParams<RootTabParamList> | undefined;
  Home: NavigatorScreenParams<RootTabParamList> | HomeParams;
  Book: NavigatorScreenParams<RootTabParamList> | undefined;
  Favorite: NavigatorScreenParams<RootTabParamList> | undefined;
  DownloadManager: NavigatorScreenParams<RootTabParamList> | undefined;
  Notes: NavigatorScreenParams<RootTabParamList> | undefined;
  NoteDetail: NavigatorScreenParams<RootTabParamList> | { noteId: number };
  Character: NavigatorScreenParams<RootTabParamList> | undefined;
  ChooseBook:
    | NavigatorScreenParams<RootTabParamList>
    | ChooseChapterNumberParams;
  Search: NavigatorScreenParams<RootTabParamList> | { book?: string };
  Concordance: NavigatorScreenParams<RootTabParamList> | {};
  StrongSearchEntire:
    | NavigatorScreenParams<RootTabParamList>
    | { paramCode: string };
  DictionarySearch: NavigatorScreenParams<RootTabParamList> | { word: string };
  ChooseChapterNumber:
    | NavigatorScreenParams<RootTabParamList>
    | ChooseChapterNumberParams;
  ChooseVerseNumber:
    | NavigatorScreenParams<RootTabParamList>
    | ChooseChapterNumberParams;
  Modal: undefined;
  Onboarding: undefined;
  Song: undefined;
  NotFound: undefined;
};

export interface HomeParams {
  book?: string;
  chapter?: number | string;
  verse?: number | string;
  bottomSideBook?: string;
  bottomSideChapter?: number | string;
  bottomSideVerse?: number | string;
  strongKey?: string;
  isTour?: boolean;
  isVerseTour?: boolean;
  isHistory?: boolean;
}
export interface ChooseChapterNumberParams {
  book?: string;
  chapter?: number | string;
  verse?: number | string;
  bottomSideBook?: string;
  bottomSideChapter?: number | string;
  bottomSideVerse?: number | string;
}

export type TStep = {
  text: string;
  target: any;
  action?: any;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

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
  OpenSans = "OpenSans",
  Cardo = "Cardo",
}

export enum EBibleVersions {
  BIBLE = "bible",
  NTV = "ntv-bible",
}

export type DownloadBibleItem = {
  name: string;
  url: string;
  key: string;
  storedName: string;
  size: number;
  disabled?: boolean;
};

export type ResouceBookItem = {
  name: string;
  image: string;
  downloadUrl: string;
  description: string;
  longDescription?: string;
  autor?: string;
};

export type TSubtitle = {
  book_number: number;
  chapter: number;
  order_if_several: number;
  subheading?: string;
  title?: string;
  verse: number;
};

export type TNote = {
  id: number;
  title: string;
  note_text: string;
  created_at: string;
};

export enum EViewMode {
  LIST,
  NEW,
  EDIT,
  VIEW,
}

export type TIcon = {
  name: IconProps["name"];
  color?: string | any;
  action?: any;
  longAction?: any;
  isIonicon?: boolean;
  hide?: boolean;
  ref?: any;
  disabled?: boolean;
  isMaterial?: boolean;
  description?: string;
};

export type IStrongWord = {
  text: string;
  code: string;
};

export type MaterialIconNameType = keyof typeof MaterialCommunityIcons.glyphMap;
export type IoniconsIconNameType = keyof typeof Ionicons.glyphMap;

export type DictionaryData = {
  definition: string;
  topic: string;
};

export type SpeechVoice = {
  identifier: string;
  language: string;
  name: string;
  quality: string;
  isMale?: boolean;
};

export type TChapter = {
  dimensions: any;
  item: {
    verses: IBookVerse[];
    subtitles: TSubtitle[];
  };
  verse?: number;
  chapter?: number;
  book?: string;
  estimatedReadingTime?: number;
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
  is_favorite?: any;
}

export interface IBookVerse {
  book_number: number;
  chapter: number;
  text: string;
  verse: number;
  subheading?: string;
  order_if_several?: number;
  is_favorite: any;
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

export enum BookGruop {
  AntiguoPacto = "Antiguo Pacto",
  NuevoPacto = "Nuevo Pacto",
  Pentateuco = "Pentateuco",
  LibrosHistóricos = "Libros Históricos",
  LibrosPoéticos = "Libros Poéticos",
  ProfetasMayores = "Profetas Mayores",
  ProfetasMenores = "Profetas Menores",
  Evangelios = "Evangelios",
  Hechos = "Hechos",
  Epístolas = "Epístolas",
  EpístolasdePablo = "Epístolas de Pablo",
  EpístolasGenerales = "Epístolas Generales",
  Apocalipsis = "Apocalipsis",
}

export type IFavoriteVerse = {
  bookNumber: number;
  chapter: number;
  verse: number;
  isFav: boolean;
};

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
  BlackWhite = "#000",
  BlueGray = "#8EACBB",
  Blue = "#2a7ac6",
  Green = "#78b0a4",
  Red = "#FF5252",
  Orange = "#9f463c",
  Cyan = "#20acb6",
  Purple = "#2032ac",
  Pink = "#aa2c50",
  BlueLight = "#3b88bf",
  BlueGreen = "#239db8",
  PinkLight = "#874a69",
}

export type TSongItem = {
  title: string;
  chorus: string | null;
  stanzas: string[];
};
export type EHistoryItem = {
  book: string;
  chapter: number;
  verse: number;
};

export enum DATABASE_TYPE {
  BIBLE,
  DICTIONARY,
  COMMENTARIES,
}
