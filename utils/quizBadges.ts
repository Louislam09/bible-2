import type { ChapterQuizAttemptRow } from "@/services/chapterQuizLocalDbService";
import { chapterQuizLocalDbService } from "@/services/chapterQuizLocalDbService";
import type { ChapterQuizProgress } from "@/utils/chapterQuizProgress";
import { computeChapterQuizMetrics } from "@/utils/quizHistory";

/**
 * Insignias de perfil (quiz): reglas declaradas aquí y evaluación pura desde intentos locales + XP.
 *
 * - Superestrella: nivel alto (recompensa constancia y maestría acumulada).
 * - Campeón quiz: muchos capítulos aprobados (ancho de contenido domado).
 * - Mente ágil: calidad sostenida (promedio + volumen mínimo de intentos).
 * - Explorador: diversidad de libros (no quedarse en un solo libro).
 */

export type QuizBadgeId =
  | "superestrella"
  | "campeon_quiz"
  | "mente_agil"
  | "explorador";

export type QuizBadgeDefinition = {
  id: QuizBadgeId;
  label: string;
  emoji: string;
  color: string;
  /** Objetivo en una frase (perfil con insignia bloqueada). */
  requirementSummary: string;
};

export const QUIZ_BADGE_DEFINITIONS: readonly QuizBadgeDefinition[] = [
  {
    id: "superestrella",
    label: "Superestrella",
    emoji: "⭐",
    color: "#eab308",
    requirementSummary: "Alcanza el nivel 18 con tu XP de quizzes.",
  },
  {
    id: "campeon_quiz",
    label: "Campeón quiz",
    emoji: "🏆",
    color: "#3b82f6",
    requirementSummary: "Aprueba 15 capítulos distintos.",
  },
  {
    id: "mente_agil",
    label: "Mente ágil",
    emoji: "🧠",
    color: "#ef4444",
    requirementSummary: "Mantén ≥85% de acierto en al menos 10 intentos.",
  },
  {
    id: "explorador",
    label: "Explorador",
    emoji: "🔭",
    color: "#a855f7",
    requirementSummary: "Aprueba capítulos en 4 libros de la Biblia distintos.",
  },
] as const;

export type QuizBadgeState = QuizBadgeDefinition & {
  unlocked: boolean;
  /** 0–1 hacia desbloquear (UI de progreso). */
  progress: number;
  /** Texto corto de avance, p. ej. "12/15 capítulos". */
  progressLabel: string;
  /** Fecha ISO del primer desbloqueo en SQLite (si consta). */
  unlockedAtIso?: string;
};

const LEVEL_SUPERSTAR = 18;
const CHAMPION_DISTINCT_CHAPTERS = 15;
const SHARP_MIN_ATTEMPTS = 10;
const SHARP_MIN_AVG_PERCENT = 85;
const EXPLORER_DISTINCT_BOOKS = 4;

export function getQuizBadgeStates(
  attempts: ChapterQuizAttemptRow[],
  progress: ChapterQuizProgress,
): QuizBadgeState[] {
  const metrics = computeChapterQuizMetrics(attempts);
  const passedChapterKeys = new Set(
    attempts.filter((a) => a.pass).map((a) => a.chapterKey),
  );
  const distinctPassedBooks = new Set(
    attempts.filter((a) => a.pass).map((a) => a.book),
  );
  const chaptersPassed = passedChapterKeys.size;
  const attemptCount = attempts.length;

  const out: QuizBadgeState[] = [];

  for (const def of QUIZ_BADGE_DEFINITIONS) {
    switch (def.id) {
      case "superestrella": {
        const unlocked = progress.level >= LEVEL_SUPERSTAR;
        const prog = Math.min(1, progress.level / LEVEL_SUPERSTAR);
        out.push({
          ...def,
          unlocked,
          progress: prog,
          progressLabel: `Nivel ${Math.min(progress.level, LEVEL_SUPERSTAR)}/${LEVEL_SUPERSTAR}`,
        });
        break;
      }
      case "campeon_quiz": {
        const unlocked = chaptersPassed >= CHAMPION_DISTINCT_CHAPTERS;
        const prog = Math.min(1, chaptersPassed / CHAMPION_DISTINCT_CHAPTERS);
        out.push({
          ...def,
          unlocked,
          progress: prog,
          progressLabel: `${Math.min(chaptersPassed, CHAMPION_DISTINCT_CHAPTERS)}/${CHAMPION_DISTINCT_CHAPTERS} capítulos`,
        });
        break;
      }
      case "mente_agil": {
        const unlocked =
          attemptCount >= SHARP_MIN_ATTEMPTS &&
          metrics.avgPercent >= SHARP_MIN_AVG_PERCENT;
        const prog = Math.min(
          1,
          Math.min(
            attemptCount / SHARP_MIN_ATTEMPTS,
            metrics.avgPercent / SHARP_MIN_AVG_PERCENT,
          ),
        );
        out.push({
          ...def,
          unlocked,
          progress: prog,
          progressLabel: `${metrics.avgPercent}% · ${Math.min(attemptCount, SHARP_MIN_ATTEMPTS)}/${SHARP_MIN_ATTEMPTS} intentos`,
        });
        break;
      }
      case "explorador": {
        const n = distinctPassedBooks.size;
        const unlocked = n >= EXPLORER_DISTINCT_BOOKS;
        const prog = Math.min(1, n / EXPLORER_DISTINCT_BOOKS);
        out.push({
          ...def,
          unlocked,
          progress: prog,
          progressLabel: `${Math.min(n, EXPLORER_DISTINCT_BOOKS)}/${EXPLORER_DISTINCT_BOOKS} libros`,
        });
        break;
      }
    }
  }

  return out;
}

/**
 * Aplica desbloqueos ya guardados en SQLite: la insignia sigue mostrándose aunque
 * los intentos actuales ya no cumplan el umbral (logro permanente en este dispositivo).
 */
export function mergePersistedQuizBadgeUnlocks(
  states: QuizBadgeState[],
  unlockedAtByBadgeId: ReadonlyMap<string, string>,
): QuizBadgeState[] {
  return states.map((s) => {
    const unlockedAtIso = unlockedAtByBadgeId.get(s.id);
    if (unlockedAtIso == null) return s;
    return {
      ...s,
      unlocked: true,
      progress: 1,
      progressLabel: "Desbloqueada",
      unlockedAtIso,
    };
  });
}

/** Texto para la UI: "Obtenida el 22 abr 2026" */
export function formatQuizBadgeUnlockedAtLabel(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const datePart = d
      .toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })
      .replace(/\./g, "")
      .replace(/\s+/g, " ")
      .trim();
    return `Obtenida el ${datePart}`;
  } catch {
    return "";
  }
}

/** Solo persiste nuevas insignias que cumplen criterios (p. ej. tras guardar un intento). */
export async function persistNewQuizBadgeUnlocks(
  attempts: ChapterQuizAttemptRow[],
  progress: ChapterQuizProgress,
): Promise<void> {
  const computed = getQuizBadgeStates(attempts, progress);
  await chapterQuizLocalDbService.syncQuizBadgeUnlocksFromCriteria(computed);
}

/** Criterios actuales + SQLite: sincroniza y devuelve estado listo para la UI. */
export async function resolveQuizBadgeStatesWithPersistence(
  attempts: ChapterQuizAttemptRow[],
  progress: ChapterQuizProgress,
): Promise<QuizBadgeState[]> {
  const computed = getQuizBadgeStates(attempts, progress);
  await chapterQuizLocalDbService.syncQuizBadgeUnlocksFromCriteria(computed);
  const rows = await chapterQuizLocalDbService.getPersistedQuizBadgeUnlocks();
  const unlockedAtByBadgeId = new Map(rows.map((r) => [r.badgeId, r.unlockedAt]));
  return mergePersistedQuizBadgeUnlocks(computed, unlockedAtByBadgeId);
}
