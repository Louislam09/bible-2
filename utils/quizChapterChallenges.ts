import type {
  ChapterQuizAttemptRow,
  ChapterQuizSessionRow,
} from "@/services/chapterQuizLocalDbService";

export const CHAPTER_QUIZ_SIZE_OPTIONS = [5, 10, 15, 20] as const;
export type ChapterQuizSizeOption = (typeof CHAPTER_QUIZ_SIZE_OPTIONS)[number];

export type ChapterQuizChallengeState = "none" | "in_progress" | "completed";

export function hasSessionForQuizSize(
  sessions: ChapterQuizSessionRow[],
  chapterKey: string,
  size: number,
): boolean {
  return sessions.some(
    (s) => s.chapterKey === chapterKey && s.questionCount === size,
  );
}

export function getChallengeStateForQuizSize(
  attempts: ChapterQuizAttemptRow[],
  size: number,
  hasOpenSession?: boolean,
): ChapterQuizChallengeState {
  const forSize = attempts.filter((a) => a.questions.length === size);
  if (forSize.some((a) => a.pass)) return "completed";
  if (forSize.length > 0) return "in_progress";
  if (hasOpenSession) return "in_progress";
  return "none";
}

/** How many of the four standard sizes (5/10/15/20) have at least one passed attempt. */
export function countCompletedChallengesForChapter(
  attempts: ChapterQuizAttemptRow[],
  book: string,
  chapter: number,
): number {
  const chapterAttempts = attempts.filter(
    (a) => a.book === book && a.chapter === chapter,
  );
  let n = 0;
  for (const size of CHAPTER_QUIZ_SIZE_OPTIONS) {
    const forSize = chapterAttempts.filter((a) => a.questions.length === size);
    if (forSize.some((a) => a.pass)) n++;
  }
  return n;
}
