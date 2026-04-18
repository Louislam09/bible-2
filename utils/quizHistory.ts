import { DB_BOOK_CHAPTER_VERSES, DB_BOOK_NAMES } from "@/constants/BookNames";
import type { ChapterQuizAttemptRow } from "@/services/chapterQuizLocalDbService";

export type ChapterQuizHistoryFilter = "all" | "passed" | "failed" | "favorites";

export type ChapterQuizHistoryMetrics = {
  avgPercent: number;
  streakDays: number;
  chaptersCompleted: number;
};

const bookNumberByLongName: Map<string, number> = (() => {
  const m = new Map<string, number>();
  for (const b of DB_BOOK_NAMES) m.set(b.longName, b.bookNumber);
  return m;
})();

const chapterCountByBookNumber: Map<number, number> = (() => {
  const m = new Map<number, number>();
  for (const row of DB_BOOK_CHAPTER_VERSES) {
    const prev = m.get(row.bookNumber) ?? 0;
    if (row.chapterNumber > prev) m.set(row.bookNumber, row.chapterNumber);
  }
  return m;
})();

export function getTotalChaptersForBook(longName: string): number {
  const num = bookNumberByLongName.get(longName);
  if (num == null) return 0;
  return chapterCountByBookNumber.get(num) ?? 0;
}

export function getBookNumber(longName: string): number | undefined {
  return bookNumberByLongName.get(longName);
}

function computeStreakDays(attempts: { completedAt: string }[]): number {
  if (attempts.length === 0) return 0;
  const daySet = new Set(attempts.map((a) => a.completedAt.slice(0, 10)));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 400; i++) {
    const key = d.toISOString().slice(0, 10);
    if (daySet.has(key)) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else if (streak > 0) {
      break;
    } else {
      d.setDate(d.getDate() - 1);
    }
  }
  return streak;
}

export function computeChapterQuizMetrics(
  attempts: ChapterQuizAttemptRow[],
): ChapterQuizHistoryMetrics {
  if (attempts.length === 0) {
    return { avgPercent: 0, streakDays: 0, chaptersCompleted: 0 };
  }
  const ratios = attempts.map((a) => (a.total > 0 ? a.score / a.total : 0));
  const avgPercent = Math.round(
    (ratios.reduce((s, x) => s + x, 0) / ratios.length) * 100,
  );
  const streakDays = computeStreakDays(attempts);
  const chaptersWithPass = new Set(
    attempts.filter((a) => a.pass).map((a) => a.chapterKey),
  );
  return {
    avgPercent,
    streakDays,
    chaptersCompleted: chaptersWithPass.size,
  };
}

export function filterAttempts(
  attempts: ChapterQuizAttemptRow[],
  filter: ChapterQuizHistoryFilter,
): ChapterQuizAttemptRow[] {
  switch (filter) {
    case "passed":
      return attempts.filter((a) => a.pass);
    case "failed":
      return attempts.filter((a) => !a.pass);
    case "favorites":
      return attempts.filter((a) => a.isFavorite);
    default:
      return attempts;
  }
}

export function formatRelativeDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const days = Math.floor(diffMs / 86400000);
    if (days <= 0) return "Hoy";
    if (days === 1) return "Ayer";
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} sem`;
    return d.toLocaleDateString("es", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}
