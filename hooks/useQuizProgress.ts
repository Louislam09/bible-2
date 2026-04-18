import { DB_BOOK_NAMES } from "@/constants/BookNames";
import type { ChapterQuizAttemptRow } from "@/services/chapterQuizLocalDbService";
import { getTotalChaptersForBook } from "@/utils/quizHistory";
import { useMemo } from "react";

export type BookSummary = {
  book: string;
  bookNumber: number;
  totalChapters: number;
  completedChapters: number;
  passedChapters: number;
  percent: number;
  lastCompletedAt: string | null;
  attemptCount: number;
  hasAnyAttempt: boolean;
};

export type ChapterAttemptIndex = {
  /** Best (highest score%) attempt for each chapter number. */
  bestByChapter: Map<number, ChapterQuizAttemptRow>;
  /** Most recent attempt for each chapter number. */
  lastByChapter: Map<number, ChapterQuizAttemptRow>;
};

export function useQuizProgress(attempts: ChapterQuizAttemptRow[]) {
  const attemptsByBook = useMemo(() => {
    const m = new Map<string, ChapterQuizAttemptRow[]>();
    for (const a of attempts) {
      const arr = m.get(a.book);
      if (arr) arr.push(a);
      else m.set(a.book, [a]);
    }
    return m;
  }, [attempts]);

  const bookSummaries: BookSummary[] = useMemo(() => {
    return DB_BOOK_NAMES.map((b) => {
      const list = attemptsByBook.get(b.longName) ?? [];
      const totalChapters = getTotalChaptersForBook(b.longName);

      const bestByChapter = new Map<number, ChapterQuizAttemptRow>();
      for (const a of list) {
        const prev = bestByChapter.get(a.chapter);
        const aRatio = a.total > 0 ? a.score / a.total : 0;
        const prevRatio =
          prev && prev.total > 0 ? prev.score / prev.total : -1;
        if (!prev || aRatio > prevRatio) bestByChapter.set(a.chapter, a);
      }

      const passedChapters = Array.from(bestByChapter.values()).filter(
        (a) => a.pass,
      ).length;
      const completedChapters = bestByChapter.size;
      const percent =
        totalChapters > 0
          ? Math.round((passedChapters / totalChapters) * 100)
          : 0;

      const lastCompletedAt =
        list.length > 0
          ? list.reduce(
              (acc, x) => (x.completedAt > acc ? x.completedAt : acc),
              list[0].completedAt,
            )
          : null;

      return {
        book: b.longName,
        bookNumber: b.bookNumber,
        totalChapters,
        completedChapters,
        passedChapters,
        percent,
        lastCompletedAt,
        attemptCount: list.length,
        hasAnyAttempt: list.length > 0,
      };
    });
  }, [attemptsByBook]);

  const indexByBook = useMemo(() => {
    const m = new Map<string, ChapterAttemptIndex>();
    for (const [book, list] of attemptsByBook.entries()) {
      const bestByChapter = new Map<number, ChapterQuizAttemptRow>();
      const lastByChapter = new Map<number, ChapterQuizAttemptRow>();
      for (const a of list) {
        const prevBest = bestByChapter.get(a.chapter);
        const aRatio = a.total > 0 ? a.score / a.total : 0;
        const prevRatio =
          prevBest && prevBest.total > 0
            ? prevBest.score / prevBest.total
            : -1;
        if (!prevBest || aRatio > prevRatio) bestByChapter.set(a.chapter, a);

        const prevLast = lastByChapter.get(a.chapter);
        if (!prevLast || a.completedAt > prevLast.completedAt) {
          lastByChapter.set(a.chapter, a);
        }
      }
      m.set(book, { bestByChapter, lastByChapter });
    }
    return m;
  }, [attemptsByBook]);

  return { bookSummaries, indexByBook };
}
