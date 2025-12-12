import { IBookVerse } from "@/types";

export const getVerseTextRaw = (
  text: any = "",
  addIcon: boolean = false
): string => {
  return text
    .replace(/<.*?>|<\/.*?> |<.*?>.*?<\/.*?>|\[.*?\]/gi, "")
    .replace(/\d+/g, addIcon ? "🔍" : "")
    .replace(/\s{2,}/g, " ");
};

export const getChapterTextRawForReading = (verses: IBookVerse[] = []) => {
  const text = [];
  for (const verse of verses) {
    // Remove  all * from text
    const rawText = getVerseTextRaw(verse.text).replace(/\*/g, "");
    text.push(rawText);
  }
  return text;
};

export const getChapterTextRaw = (verses: IBookVerse[] = []) => {
  const text = [""];
  for (const verse of verses) {
    const rawText = getVerseTextRaw(verse.text);
    text.push(rawText);
  }
  return text.join("\n");
};
