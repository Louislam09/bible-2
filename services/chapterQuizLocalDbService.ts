import { Question } from "@/types";
import { getAppDatabase } from "@/utils/appDatabase";

const QUIZ_CACHE_TABLE = "chapter_quiz_cache_local";
const QUIZ_COMPLETION_TABLE = "chapter_quiz_completion_local";

const CREATE_QUIZ_CACHE_TABLE = `
CREATE TABLE IF NOT EXISTS ${QUIZ_CACHE_TABLE} (
  chapter_key TEXT PRIMARY KEY,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  questions_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);`;

const CREATE_QUIZ_COMPLETION_TABLE = `
CREATE TABLE IF NOT EXISTS ${QUIZ_COMPLETION_TABLE} (
  chapter_key TEXT PRIMARY KEY,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  completed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);`;

const CREATE_QUIZ_CACHE_UPDATED_AT_INDEX = `
CREATE INDEX IF NOT EXISTS idx_chapter_quiz_cache_updated_at
ON ${QUIZ_CACHE_TABLE}(updated_at);`;

const parseQuestions = (value: string): Question[] => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as Question[]) : [];
  } catch {
    return [];
  }
};

const toIso = () => new Date().toISOString();

class ChapterQuizLocalDbService {
  private initialized = false;

  private async init() {
    if (this.initialized) return;
    const db = await getAppDatabase();
    await db.execAsync(CREATE_QUIZ_CACHE_TABLE);
    await db.execAsync(CREATE_QUIZ_COMPLETION_TABLE);
    await db.execAsync(CREATE_QUIZ_CACHE_UPDATED_AT_INDEX);
    this.initialized = true;
  }

  /**
   * @param maxAgeMs Max age in ms; use `Infinity` for no time-based expiry (cache forever).
   */
  async getValidCachedQuestions(chapterKey: string, maxAgeMs: number): Promise<Question[] | null> {
    await this.init();
    const db = await getAppDatabase();
    const statement = await db.prepareAsync(
      `SELECT questions_json, updated_at FROM ${QUIZ_CACHE_TABLE} WHERE chapter_key = ? LIMIT 1;`
    );
    try {
      const result = await statement.executeAsync([chapterKey]);
      const rows = (await result.getAllAsync()) as Array<{
        questions_json: string;
        updated_at: string;
      }>;
      const row = rows[0];
      if (!row) return null;

      const updatedMs = new Date(row.updated_at).getTime();
      if (Number.isNaN(updatedMs)) return null;
      if (maxAgeMs !== Infinity && Date.now() - updatedMs > maxAgeMs) {
        return null;
      }

      const questions = parseQuestions(row.questions_json);
      return questions.length > 0 ? questions : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async upsertCachedQuestions({
    chapterKey,
    book,
    chapter,
    questions,
  }: {
    chapterKey: string;
    book: string;
    chapter: number;
    questions: Question[];
  }) {
    await this.init();
    const db = await getAppDatabase();
    const now = toIso();
    const statement = await db.prepareAsync(
      `INSERT INTO ${QUIZ_CACHE_TABLE} (chapter_key, book, chapter, questions_json, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(chapter_key) DO UPDATE SET
         book = excluded.book,
         chapter = excluded.chapter,
         questions_json = excluded.questions_json,
         updated_at = excluded.updated_at;`
    );
    try {
      await statement.executeAsync([
        chapterKey,
        book,
        chapter,
        JSON.stringify(questions),
        now,
      ]);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async saveCompletion({
    chapterKey,
    score,
    total,
    completedAt,
  }: {
    chapterKey: string;
    score: number;
    total: number;
    completedAt: string;
  }) {
    await this.init();
    const db = await getAppDatabase();
    const statement = await db.prepareAsync(
      `INSERT INTO ${QUIZ_COMPLETION_TABLE} (chapter_key, score, total, completed_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(chapter_key) DO UPDATE SET
         score = excluded.score,
         total = excluded.total,
         completed_at = excluded.completed_at,
         updated_at = excluded.updated_at;`
    );
    try {
      await statement.executeAsync([
        chapterKey,
        score,
        total,
        completedAt,
        toIso(),
      ]);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getAllCompletions(): Promise<
    Record<string, { score: number; total: number; completedAt: string }>
  > {
    await this.init();
    const db = await getAppDatabase();
    const statement = await db.prepareAsync(
      `SELECT chapter_key, score, total, completed_at FROM ${QUIZ_COMPLETION_TABLE};`
    );
    try {
      const result = await statement.executeAsync([]);
      const rows = (await result.getAllAsync()) as Array<{
        chapter_key: string;
        score: number;
        total: number;
        completed_at: string;
      }>;
      return rows.reduce<Record<string, { score: number; total: number; completedAt: string }>>(
        (acc, row) => {
          acc[row.chapter_key] = {
            score: row.score,
            total: row.total,
            completedAt: row.completed_at,
          };
          return acc;
        },
        {}
      );
    } finally {
      await statement.finalizeAsync();
    }
  }
}

export const chapterQuizLocalDbService = new ChapterQuizLocalDbService();
