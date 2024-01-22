import { IBookVerse } from "types";
import { getVerseTextRaw } from "./getVerseTextRaw";

const formatTextToClipboard = (
  highlightedVerses: IBookVerse[] | any[],
  highlightedGreaterThanOne: any,
  book: any,
  chapter: any
) => {
  return highlightedVerses.reduce((acc, next) => {
    return acc + `\n ${next.verse} ${getVerseTextRaw(next.text)}`;
  }, `${book} ${chapter}:${highlightedVerses[0].verse}${highlightedGreaterThanOne ? "-" + highlightedVerses[highlightedVerses.length - 1].verse : ""}`);
};

export default formatTextToClipboard;
