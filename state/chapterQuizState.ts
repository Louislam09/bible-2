import { storedData$ } from "@/context/LocalstoreContext";
import { chapterQuizLocalDbService } from "@/services/chapterQuizLocalDbService";
import { Question } from "@/types";
import { observable } from "@legendapp/state";

export type ChapterQuizResult = {
  score: number;
  total: number;
  completedAt: string;
};

export type ActiveChapterQuiz = {
  chapterKey: string;
  book: string;
  chapter: number;
  requestedCount: number;
  questions: Question[];
};

type ChapterQuizState = {
  activeQuiz: ActiveChapterQuiz | null;
  completedByChapter: Record<string, ChapterQuizResult>;
  prefetchedQuestionsByChapter: Record<string, Question[]>;
};

export const chapterQuizState$ = observable<ChapterQuizState>({
  activeQuiz: null,
  completedByChapter: {},
  prefetchedQuestionsByChapter: {},
});

export const chapterQuizStateHelpers = {
  setActiveQuiz(quiz: ActiveChapterQuiz) {
    chapterQuizState$.activeQuiz.set(quiz);
  },
  clearActiveQuiz() {
    chapterQuizState$.activeQuiz.set(null);
  },
  setPrefetchedQuestions(chapterKey: string, questions: Question[]) {
    chapterQuizState$.prefetchedQuestionsByChapter.set((prev) => ({
      ...prev,
      [chapterKey]: questions,
    }));
  },
  clearPrefetchedChapter(chapterKey: string) {
    chapterQuizState$.prefetchedQuestionsByChapter.set((prev) => {
      if (!prev[chapterKey]) return prev;
      const next = { ...prev };
      delete next[chapterKey];
      return next;
    });
  },
  markChapterCompleted(chapterKey: string, score: number, total: number) {
    const nextValue = {
      score,
      total,
      completedAt: new Date().toISOString(),
    };
    chapterQuizState$.completedByChapter.set((prev) => ({
      ...prev,
      [chapterKey]: nextValue,
    }));
    storedData$.chapterQuizCompletedByChapter.set((prev) => ({
      ...prev,
      [chapterKey]: nextValue,
    }));
    void chapterQuizLocalDbService.saveCompletion({
      chapterKey,
      score,
      total,
      completedAt: nextValue.completedAt,
    });
  },
};
