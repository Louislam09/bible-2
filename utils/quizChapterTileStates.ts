import type { ChapterAttemptIndex } from "@/hooks/useQuizProgress";

/**
 * One char per chapter (1..total): `o` = aprobado, `p` = en progreso, `n` = sin intentar.
 */
export function encodeChapterTileStates(
  totalChapters: number,
  index: ChapterAttemptIndex | undefined,
): string {
  if (totalChapters <= 0) {
    return "";
  }
  const best = index?.bestByChapter;
  let s = "";
  for (let ch = 1; ch <= totalChapters; ch++) {
    const a = best?.get(ch);
    if (!a) {
      s += "n";
    } else if (a.pass) {
      s += "o";
    } else {
      s += "p";
    }
  }
  return s;
}
