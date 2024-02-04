import { ToastAndroid } from "react-native";
import * as Clipboard from "expo-clipboard";
import { IBookVerse, IVerseItem } from "types";
import { getVerseTextRaw } from "./getVerseTextRaw";
import { DB_BOOK_NAMES } from "constants/BookNames";

export const formatTextToClipboard = (
  highlightedVerses: IVerseItem[],
  highlightedGreaterThanOne: boolean,
  book?: string,
  chapter?: number
): string => {
  const firstVerse = highlightedVerses[0].verse;
  const lastVerse = highlightedGreaterThanOne
    ? highlightedVerses[highlightedVerses.length - 1].verse
    : firstVerse;

  const verseText = highlightedVerses
    .map((verse) => ` ${verse.verse} ${getVerseTextRaw(verse.text)}`)
    .join("\n");

  return `${book} ${chapter}:${firstVerse}${
    highlightedGreaterThanOne ? "-" + lastVerse : ""
  }\n${verseText}`;
};

const copyToClipboard = async (
  item: IVerseItem | IVerseItem[]
): Promise<void> => {
  const isArray = Array.isArray(item);
  const currentBook = DB_BOOK_NAMES.find(
    (x) => x.bookNumber === +(isArray ? item[0] : item).book_number
  );
  const bookName = currentBook?.longName;
  const textCopied = formatTextToClipboard(
    isArray ? item : [item],
    isArray,
    bookName,
    isArray ? item[0].chapter : item.chapter
  );

  await Clipboard.setStringAsync(textCopied);
  ToastAndroid.show("Versículo copiado!", ToastAndroid.SHORT);
};

export default copyToClipboard;
