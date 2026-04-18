import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { QUERY_BY_DB } from "@/constants/queries";
import { EBibleVersions, IBookVerse } from "@/types";
import { getChapterTextRaw } from "@/utils/getVerseTextRaw";

type GetBibleServices = (args: { isNewCovenant?: boolean }) => {
  primaryDB: {
    executeSql: <T = unknown>(
      sql: string,
      params?: unknown[],
      queryName?: string,
    ) => Promise<T[]>;
  } | null;
};

/**
 * Loads verse text for the current Bible version (same logic as BibleChapterContext.fetchChapter)
 * so chapter quiz can be started from Quiz History without opening the reader first.
 */
export async function loadChapterVersesTextForQuiz(
  getBibleServices: GetBibleServices,
  currentBibleVersion: string,
  book: string,
  chapter: number,
): Promise<string> {
  const currentBook = DB_BOOK_NAMES.find((x) => x.longName === book);
  if (!currentBook) return "";

  const isInterlinear = [EBibleVersions.INTERLINEAR, EBibleVersions.GREEK].includes(
    currentBibleVersion as EBibleVersions,
  );
  const queryKey = isInterlinear ? EBibleVersions.BIBLE : currentBibleVersion;
  const query = QUERY_BY_DB[queryKey] || QUERY_BY_DB["OTHERS"];
  const NT_BOOK_NUMBER = 470;
  const isNewCovenant = currentBook.bookNumber >= NT_BOOK_NUMBER;
  const { primaryDB } = getBibleServices({ isNewCovenant });
  if (!primaryDB) return "";

  const verses = await primaryDB.executeSql<IBookVerse>(
    query.GET_VERSES_BY_BOOK_AND_CHAPTER,
    [currentBook.bookNumber, chapter],
    "verses",
  );

  return getChapterTextRaw(verses);
}
