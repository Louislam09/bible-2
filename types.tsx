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
import { IconProps } from "@/components/Icon";
import { Router } from 'expo-router';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export enum Screens {
  Dashboard = 'dashboard',
  Settings = 'settings',
  Home = 'home',
  Search = 'search',
  Concordance = 'concordance',
  ChooseBook = 'chooseBook',
  ChooseChapterNumber = 'chooseChapterNumber',
  ChooseVerseNumber = 'chooseVerseNumber',
  Favorite = 'favorite',
  DownloadManager = 'downloadManager',
  Notes = 'notes',
  Onboarding = 'onboarding',
  Character = 'character',
  Song = 'song',
  StrongSearchEntire = 'searchStrongWordEntire',
  DictionarySearch = 'dictionary',
  NoteDetail = 'noteDetail',
  Hymn = 'hymn',
  Game = '(game)',
  ChooseGame = 'chooseGame',
}

type TScreensName = { [key in Screens]: string };

export const ScreensName: TScreensName = {
  [Screens.Home]: 'Santa Escritura',
  [Screens.Search]: 'Busqueda',
  [Screens.Concordance]: 'Concordancia',
  [Screens.ChooseBook]: 'Seleccione un libro',
  [Screens.ChooseChapterNumber]: 'Capitulos',
  [Screens.ChooseVerseNumber]: 'Versiculos',
  [Screens.Favorite]: 'Versiculos Favoritos',
  [Screens.Notes]: 'Notas',
  [Screens.Dashboard]: 'Dashboard',
  [Screens.Settings]: 'Ajustes',
  [Screens.DownloadManager]: 'Gestor de descargas',
  [Screens.Onboarding]: 'Guia',
  [Screens.Character]: 'Personaje',
  [Screens.Song]: 'Himnario',
  [Screens.StrongSearchEntire]: 'Explorador de Números Strong',
  [Screens.DictionarySearch]: 'Dictionary Search',
  [Screens.NoteDetail]: 'Nota',
  [Screens.Hymn]: 'Selecciona un himnario',
  [Screens.Game]: 'Juego Biblico',
  [Screens.ChooseGame]: '',
};

// export type RootTabParamList = { [key in Screens]: any };
export type RootTabParamList = {
  dashboard: undefined;
  settings: undefined;
  home: undefined;
  book: undefined;
  chooseBook: { book: string };
  search: undefined;
  concordance: undefined;
  strongSearchEntire: undefined;
  downloadManager: undefined;
  notes: undefined;
  noteDetail: undefined;
  favorite: undefined;
  notFound: undefined;
  dictionary: undefined;
};

export type RootStackParamList = {
  dashboard: NavigatorScreenParams<RootTabParamList> | undefined;
  settings: NavigatorScreenParams<RootTabParamList> | undefined;
  home: NavigatorScreenParams<RootTabParamList> | HomeParams;
  book: NavigatorScreenParams<RootTabParamList> | undefined;
  favorite: NavigatorScreenParams<RootTabParamList> | undefined;
  downloadManager: NavigatorScreenParams<RootTabParamList> | undefined;
  notes: NavigatorScreenParams<RootTabParamList> | { shouldRefresh: boolean };
  noteDetail:
    | NavigatorScreenParams<RootTabParamList>
    | { noteId: number | null; isNewNote: boolean };
  character: NavigatorScreenParams<RootTabParamList> | undefined;
  chooseBook:
    | NavigatorScreenParams<RootTabParamList>
    | ChooseChapterNumberParams;
  search: NavigatorScreenParams<RootTabParamList> | { book?: string };
  concordance: NavigatorScreenParams<RootTabParamList> | {};
  strongSearchEntire:
    | NavigatorScreenParams<RootTabParamList>
    | { paramCode: string };
  dictionary: NavigatorScreenParams<RootTabParamList> | { word: string };
  chooseChapterNumber:
    | NavigatorScreenParams<RootTabParamList>
    | ChooseChapterNumberParams;
  chooseVerseNumber:
    | NavigatorScreenParams<RootTabParamList>
    | ChooseChapterNumberParams;
  modal: undefined;
  onboarding: undefined;
  song: { isAlegres: boolean };
  '(game)': { questionsPerLevel: number };
  hymn: undefined;
  notFound: undefined;
};

export type HomeParams = {
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
};
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

export enum OrientationType {
  "LANDSCAPE",
  "PORTRAIT",
}

export type TNote = {
  id: number;
  title: string;
  note_text: string;
  created_at: string;
  updated_at?: string;
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
  id: string;
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

// GAME TYPES
export interface Question {
  question: string;
  options: string[];
  correct: any;
  reference: string;
  explanation: string;
  difficulty: string;
}

export interface GameProgress {
  current: number;
  total: number;
  score: number;
  level: number;
  totalLevels: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  reference: string;
}

export interface ICardTheme {
  title: string;
  currentQuestion: Question | null;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  progress: GameProgress | null;
  selectedAnswer: string | null;
  feedback: AnswerResult | null;
  router: Router
  scrollViewRef?: any;
}

export enum QuestionDifficulty {
  hard = '#f05448',
  medium = '#fccd0e',
  easy = '#83cb99'
}
export enum QuestionDifficultyKey {
  hard = 'Dificil',
  medium = 'Medio',
  easy = 'Facil'
}