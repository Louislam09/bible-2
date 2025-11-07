import { Platform, ToastAndroid } from "react-native";
import * as Clipboard from "expo-clipboard";
import { IBookVerse, IVerseItem } from "@/types";
import { getVerseTextRaw } from "./getVerseTextRaw";
import { DB_BOOK_NAMES } from "@/constants/BookNames";

type FormatTextToClipboard = {
  highlightedVerses: IVerseItem[];
  highlightedGreaterThanOne: boolean;
  book?: string;
  chapter?: number;
  shouldReturnHmlt?: boolean;
  noTitle?: boolean;
};

export const formatTextToClipboard = (data: FormatTextToClipboard): string => {
  const {
    highlightedGreaterThanOne,
    highlightedVerses,
    book,
    chapter,
    shouldReturnHmlt,
    noTitle,
  } = data;
  const firstVerse = highlightedVerses[0].verse;
  const lastVerse = highlightedGreaterThanOne
    ? highlightedVerses[highlightedVerses.length - 1].verse
    : firstVerse;

  const verseTitle = noTitle ? "" : `${book} ${chapter}:${firstVerse}${highlightedGreaterThanOne ? "-" + lastVerse : ""
    }`;
  const verseText = highlightedVerses
    .map((verse) => `${verse.verse} ${getVerseTextRaw(verse.text)}`)
    .join(shouldReturnHmlt ? "<br>" : "\n");


  return noTitle ? verseText : `${shouldReturnHmlt ? `<b>${verseTitle}</b>` : verseTitle}${shouldReturnHmlt ? `<br>${verseText} <br>` : `\n${verseText}`
    }`;
  // return `${shouldReturnHmlt ? `<b>${verseTitle}</b>` : verseTitle}${shouldReturnHmlt ? `<br>${verseText} <br>` : `\n${verseText}`
  //   }`;
};

export const copyTextToClipboard = async (text: string): Promise<void> => {
  await Clipboard.setStringAsync(text);
  ToastAndroid?.show("Texto copiado!", ToastAndroid.SHORT);
};

const copyToClipboard = async (
  item: IVerseItem | IVerseItem[],
  shouldReturnHmlt?: boolean
): Promise<void | string> => {
  const isArray = Array.isArray(item);
  const currentBook = DB_BOOK_NAMES.find(
    (x) => x.bookNumber === +(isArray ? item[0] : item).book_number
  );

  const bookName = currentBook?.longName;
  const textCopied = formatTextToClipboard({
    highlightedVerses: isArray ? item : [item],
    highlightedGreaterThanOne: isArray ? item.length > 1 : false,
    book: isArray ? bookName : item.bookName || bookName,
    chapter: isArray ? item[0].chapter : item.chapter,
    shouldReturnHmlt: shouldReturnHmlt,
  });

  if (shouldReturnHmlt) {
    return textCopied;
  }
  await Clipboard.setStringAsync(textCopied);
  ToastAndroid?.show("Versículo copiado!", ToastAndroid.SHORT);
};

type FormatForImageQuote = {
  text: string;
  reference: string;
};

type FormatForImageQuoteArgs = {
  items: IVerseItem | IVerseItem[];
  shouldReturnHmlt?: boolean;
  includeVerseNumbers?: boolean;
};

const formatForImageQuote = (args: FormatForImageQuoteArgs): FormatForImageQuote => {
  const { items, shouldReturnHmlt, includeVerseNumbers } = args;
  const isArray = Array.isArray(items);
  const verses = isArray ? items : [items];

  // Get book name
  const currentBook = DB_BOOK_NAMES.find(
    (x) => x.bookNumber === +verses[0].book_number
  );
  const bookName = verses[0].bookName || currentBook?.longName || "";
  const chapter = verses[0].chapter;

  // Format reference intelligently
  let reference = "";
  if (verses.length === 1) {
    // Single verse: "Salmos 119:1"
    reference = `${bookName} ${chapter}:${verses[0].verse}`;
  } else {
    // Check if verses are consecutive
    const verseNumbers = verses.map(v => v.verse).sort((a, b) => a - b);
    const isConsecutive = verseNumbers.every((num, i) =>
      i === 0 || num === verseNumbers[i - 1] + 1
    );

    if (isConsecutive) {
      // Consecutive: "Salmos 119:1-5"
      reference = `${bookName} ${chapter}:${verseNumbers[0]}-${verseNumbers[verseNumbers.length - 1]}`;
    } else {
      // Non-consecutive: "Salmos 119:1, 3, 5"
      reference = `${bookName} ${chapter}:${verseNumbers.join(", ")}`;
    }
  }

  // Format text
  const text = verses
    .map((verse) => `${includeVerseNumbers ? `${verse.verse} ` : ""}${getVerseTextRaw(verse.text)}`)
    .join(shouldReturnHmlt ? "<br>" : "\n");

  // Return formatted result
  return {
    text,
    reference
  };;
};

export { formatForImageQuote };
export default copyToClipboard;
