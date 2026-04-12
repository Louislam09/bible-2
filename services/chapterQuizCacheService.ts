import { pb } from "@/globalConfig";
import { chapterQuizLocalDbService } from "@/services/chapterQuizLocalDbService";
import { Question } from "@/types";

const QUIZ_CACHE_COLLECTION = "chapter_quiz_cache";

/** No TTL: chapter quiz rows stay valid until replaced by a new upsert. */
const CACHE_MAX_AGE_MS = Infinity;

const escapeFilterValue = (value: string) => value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const parseQuestions = (rawValue: unknown): Question[] => {
  if (!rawValue) return [];
  if (Array.isArray(rawValue)) return rawValue as Question[];
  if (typeof rawValue === "string") {
    try {
      const parsed = JSON.parse(rawValue);
      return Array.isArray(parsed) ? (parsed as Question[]) : [];
    } catch (error) {
      console.error("[ChapterQuizCache] Failed to parse cached questions", error);
      return [];
    }
  }
  return [];
};

type CacheRecord = {
  id: string;
  key?: string;
  book?: string;
  chapter?: number;
  questions?: Question[] | string;
  updated?: string;
};

export const chapterQuizCacheService = {
  buildChapterKey(book: string, chapter: number) {
    return `${book.trim().toLowerCase()}-${chapter}`;
  },

  async getValidChapterQuestions(key: string): Promise<Question[] | null> {
    const localQuestions = await chapterQuizLocalDbService.getValidCachedQuestions(
      key,
      CACHE_MAX_AGE_MS
    );
    if (localQuestions && localQuestions.length > 0) {
      return localQuestions;
    }

    try {
      const record = (await pb
        .collection(QUIZ_CACHE_COLLECTION)
        .getFirstListItem(`key = "${escapeFilterValue(key)}"`)) as CacheRecord;

      if (!record) {
        return null;
      }

      const questions = parseQuestions(record.questions);
      if (questions.length > 0) {
        await chapterQuizLocalDbService.upsertCachedQuestions({
          chapterKey: key,
          book: record.book || "",
          chapter: Number(record.chapter || 0),
          questions,
        });
        return questions;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  async upsertChapterQuestions({
    key,
    book,
    chapter,
    questions,
  }: {
    key: string;
    book: string;
    chapter: number;
    questions: Question[];
  }): Promise<void> {
    await chapterQuizLocalDbService.upsertCachedQuestions({
      chapterKey: key,
      book,
      chapter,
      questions,
    });

    const payload = {
      key,
      book,
      chapter,
      questions: JSON.stringify(questions),
    };

    try {
      const existing = (await pb
        .collection(QUIZ_CACHE_COLLECTION)
        .getFirstListItem(`key = "${escapeFilterValue(key)}"`)) as CacheRecord;

      await pb.collection(QUIZ_CACHE_COLLECTION).update(existing.id, payload);
    } catch {
      await pb.collection(QUIZ_CACHE_COLLECTION).create(payload);
    }
  },
};
