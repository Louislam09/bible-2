import type { ChapterQuizAttemptRow } from "@/services/chapterQuizLocalDbService";
import type { ChapterQuizProgress } from "@/utils/chapterQuizProgress";
import {
  getQuizBadgeStates,
  resolveQuizBadgeStatesWithPersistence,
  type QuizBadgeState,
} from "@/utils/quizBadges";
import { useEffect, useState } from "react";

/**
 * Insignias del perfil: reglas en vivo + desbloqueos persistidos en SQLite.
 */
export function useResolvedQuizBadgeStates(
  attempts: ChapterQuizAttemptRow[],
  progress: ChapterQuizProgress,
): QuizBadgeState[] {
  const [states, setStates] = useState<QuizBadgeState[]>(() =>
    getQuizBadgeStates(attempts, progress),
  );

  useEffect(() => {
    let cancelled = false;
    void resolveQuizBadgeStatesWithPersistence(attempts, progress).then((merged) => {
      if (!cancelled) setStates(merged);
    });
    return () => {
      cancelled = true;
    };
  }, [attempts, progress]);

  return states;
}
