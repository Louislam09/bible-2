import { IBookVerse } from "types";

export const getVerseTextRaw = (text: any, addIcon: boolean = false) => {
  return text
    .replace(/<.*?>|<\/.*?> |<.*?>.*?<\/.*?>|\[.*?\]/gi, "")
    .replace(/\d+/g, addIcon ? "🔍" : "");
};

export const getChapterTextRaw = (verses: IBookVerse[]) => {
  const text = [""];
  for (const verse of verses) {
    const rawText = getVerseTextRaw(verse.text);
    text.push(rawText);
  }
  return text.join("\n");
};
