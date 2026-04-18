import type { ChapterAttemptIndex } from "@/hooks/useQuizProgress";

export type QuizStatusBadgeKind = "good" | "mid" | "none";

/** Furthest chapter number with any recorded attempt (for subtitles like "Gn 12"). */
export function maxChapterTouched(
  index: ChapterAttemptIndex | undefined,
): number | null {
  if (!index?.bestByChapter.size) {
    return null;
  }
  return Math.max(...index.bestByChapter.keys());
}

/**
 * Status pill: matches mock (En progreso / Avanzado-style).
 * - No attempts → none
 * - 100% aprobados → Completo
 * - ≥60% → Avanzado
 * - else → En progreso
 */
export function deriveStatusBadge(
  hasAnyAttempt: boolean,
  percent: number,
): { kind: QuizStatusBadgeKind; label: string } {
  if (!hasAnyAttempt) {
    return { kind: "none", label: "Sin intentos" };
  }
  if (percent >= 100) {
    return { kind: "good", label: "Completo" };
  }
  if (percent >= 60) {
    return { kind: "good", label: "Avanzado" };
  }
  return { kind: "mid", label: "En progreso" };
}
