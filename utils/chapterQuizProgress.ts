import type { ChapterQuizAttemptRow } from "@/services/chapterQuizLocalDbService";
import { computeChapterQuizMetrics } from "@/utils/quizHistory";

/**
 * Progreso de quiz: XP total y niveles. Una sola fuente de verdad para la UI
 * (WebView de inicio, etc.).
 *
 * - Maestría: por capítulo aprobado, según el mejor resultado (reintentar para mejorar
 *   nota SÍ suma, sin límite artificial extra).
 * - Práctica: intentos en capítulos aún no aprobados, con tope bajo (evita farmear
 *   fallos infinitos).
 * - Racha: bonus suave, acotado.
 *
 * Nivel: curva con primeros subidas rápidas, segmentos 72 + 5 (nivel−1) XP; tope 99.
 */

const MAX_LEVEL = 99;
/** Nivel 1 → 2: 72 XP; luego +5 por nivel (77, 82, …). */
const BASE_SEGMENT = 72;
const SEGMENT_STEP = 5;

const MASTERY_FLOOR = 20;
const MASTERY_RANGE = 78;
const PRACTICE_PER_RATIO = 6;
const PRACTICE_CHAPTER_CAP = 36;
const STREAK_BONUS_PER_DAY = 2;
const STREAK_BONUS_CAP = 32;

function scoreRatio(a: ChapterQuizAttemptRow): number {
  if (a.total <= 0) return 0;
  return a.score / a.total;
}

function segmentXpToNext(level: number): number {
  if (level < 1 || level >= MAX_LEVEL) return 0;
  return BASE_SEGMENT + (level - 1) * SEGMENT_STEP;
}

/**
 * A partir de XP total acumulada: nivel, % en tramo, XP dentro del tramo, etc.
 */
function progressFromTotalXpClamped(
  totalXp: number,
): {
  level: number;
  levelProgressPercent: number;
  xpInCurrentLevel: number;
  xpToNext: number;
  xpForNextLevel: number;
  isMaxLevel: boolean;
} {
  const x = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let atLevelStart = 0;

  while (level < MAX_LEVEL) {
    const need = segmentXpToNext(level);
    if (x < atLevelStart + need) {
      const into = x - atLevelStart;
      const pct = need > 0 ? (100 * into) / need : 0;
      return {
        level,
        levelProgressPercent: Math.max(0, Math.min(100, pct)),
        xpInCurrentLevel: into,
        xpToNext: atLevelStart + need - x,
        xpForNextLevel: need,
        isMaxLevel: false,
      };
    }
    atLevelStart += need;
    level += 1;
  }

  return {
    level: MAX_LEVEL,
    levelProgressPercent: 100,
    xpInCurrentLevel: x - atLevelStart,
    xpToNext: 0,
    xpForNextLevel: 0,
    isMaxLevel: true,
  };
}

export type ChapterQuizProgress = {
  totalXp: number;
  level: number;
  /** 0–100, avance en el tramo hacia el siguiente nivel. */
  levelProgressPercent: number;
  xpInCurrentLevel: number;
  /** XP restantes para el siguiente nivel (0 si ya estás en 99 o sin datos). */
  xpToNext: number;
  /** Tamaño del tramo actual (mismo que la suma a sumar en la barra). */
  xpForNextLevel: number;
  isMaxLevel: boolean;
  /** Suma de bonus por racha en esta puntuación (transparente, opcional p. mostrar). */
  streakBonusApplied: number;
};

export function computeChapterQuizProgress(
  attempts: ChapterQuizAttemptRow[],
): ChapterQuizProgress {
  if (attempts.length === 0) {
    return {
      totalXp: 0,
      level: 1,
      levelProgressPercent: 0,
      xpInCurrentLevel: 0,
      xpToNext: segmentXpToNext(1),
      xpForNextLevel: segmentXpToNext(1),
      isMaxLevel: false,
      streakBonusApplied: 0,
    };
  }

  const metrics = computeChapterQuizMetrics(attempts);
  const byKey = new Map<string, ChapterQuizAttemptRow[]>();
  for (const a of attempts) {
    const list = byKey.get(a.chapterKey);
    if (list) list.push(a);
    else byKey.set(a.chapterKey, [a]);
  }

  let chapterSubtotal = 0;
  for (const [, list] of byKey) {
    const passed = list.filter((r) => r.pass);
    if (passed.length > 0) {
      let best = 0;
      for (const a of passed) {
        const r = scoreRatio(a);
        if (r > best) best = r;
      }
      const t = best ** 1.08;
      chapterSubtotal += Math.round(MASTERY_FLOOR + MASTERY_RANGE * Math.min(1, Math.max(0, t)));
    } else {
      let practice = 0;
      for (const a of list) {
        practice += Math.round(PRACTICE_PER_RATIO * scoreRatio(a));
      }
      chapterSubtotal += Math.min(PRACTICE_CHAPTER_CAP, practice);
    }
  }

  const streakBonus = Math.min(
    STREAK_BONUS_CAP,
    STREAK_BONUS_PER_DAY * metrics.streakDays,
  );

  const totalXp = Math.max(0, Math.round(chapterSubtotal + streakBonus));
  const p = progressFromTotalXpClamped(totalXp);
  return {
    totalXp,
    level: p.level,
    levelProgressPercent: p.levelProgressPercent,
    xpInCurrentLevel: p.xpInCurrentLevel,
    xpToNext: p.xpToNext,
    xpForNextLevel: p.xpForNextLevel,
    isMaxLevel: p.isMaxLevel,
    streakBonusApplied: streakBonus,
  };
}
