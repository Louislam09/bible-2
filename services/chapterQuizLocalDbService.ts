import { Question } from "@/types";
import { getAppDatabase } from "@/utils/appDatabase";

const QUIZ_CACHE_TABLE = "chapter_quiz_cache_local";
const QUIZ_COMPLETION_TABLE = "chapter_quiz_completion_local";
const QUIZ_ATTEMPTS_TABLE = "chapter_quiz_attempts";
/** Opened quiz (5/10/15/20) not finished — used for “en progreso” until completed or cleared. */
const QUIZ_SESSIONS_TABLE = "chapter_quiz_sessions_local";
/** Insignias de perfil desbloqueadas al menos una vez (persistente). */
const QUIZ_BADGES_UNLOCKED_TABLE = "quiz_badges_unlocked_local";

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

const CREATE_QUIZ_ATTEMPTS_TABLE = `
CREATE TABLE IF NOT EXISTS ${QUIZ_ATTEMPTS_TABLE} (
  id TEXT PRIMARY KEY,
  chapter_key TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  completed_at TEXT NOT NULL,
  questions_json TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  pass INTEGER NOT NULL DEFAULT 0,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);`;

const CREATE_QUIZ_ATTEMPTS_COMPLETED_AT_INDEX = `
CREATE INDEX IF NOT EXISTS idx_chapter_quiz_attempts_completed_at
ON ${QUIZ_ATTEMPTS_TABLE}(completed_at DESC);`;

const CREATE_QUIZ_SESSIONS_TABLE = `
CREATE TABLE IF NOT EXISTS ${QUIZ_SESSIONS_TABLE} (
  chapter_key TEXT NOT NULL,
  question_count INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (chapter_key, question_count)
);`;

const CREATE_QUIZ_BADGES_UNLOCKED_TABLE = `
CREATE TABLE IF NOT EXISTS ${QUIZ_BADGES_UNLOCKED_TABLE} (
  badge_id TEXT PRIMARY KEY,
  unlocked_at TEXT NOT NULL
);`;

export type ChapterQuizAnswerEntry = {
  questionIndex: number;
  selected: string | null;
};

export type ChapterQuizAttemptRow = {
  id: string;
  chapterKey: string;
  book: string;
  chapter: number;
  score: number;
  total: number;
  completedAt: string;
  questions: Question[];
  answers: ChapterQuizAnswerEntry[];
  pass: boolean;
  isFavorite: boolean;
};

export type ChapterQuizSessionRow = {
  chapterKey: string;
  questionCount: number;
  updatedAt: string;
};

export type QuizBadgeUnlockRow = {
  badgeId: string;
  unlockedAt: string;
};

const parseQuestions = (value: string): Question[] => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as Question[]) : [];
  } catch {
    return [];
  }
};

const parseAnswers = (value: string): ChapterQuizAnswerEntry[] => {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is ChapterQuizAnswerEntry =>
        !!x &&
        typeof x === "object" &&
        typeof (x as ChapterQuizAnswerEntry).questionIndex === "number",
    );
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
    await db.execAsync(CREATE_QUIZ_ATTEMPTS_TABLE);
    await db.execAsync(CREATE_QUIZ_CACHE_UPDATED_AT_INDEX);
    await db.execAsync(CREATE_QUIZ_ATTEMPTS_COMPLETED_AT_INDEX);
    await db.execAsync(CREATE_QUIZ_SESSIONS_TABLE);
    await db.execAsync(CREATE_QUIZ_BADGES_UNLOCKED_TABLE);
    this.initialized = true;
  }

  /**
   * Insignias guardadas localmente con la primera fecha de desbloqueo (INSERT OR IGNORE).
   */
  async getPersistedQuizBadgeUnlocks(): Promise<QuizBadgeUnlockRow[]> {
    await this.init();
    const db = await getAppDatabase();
    const statement = await db.prepareAsync(
      `SELECT badge_id, unlocked_at FROM ${QUIZ_BADGES_UNLOCKED_TABLE};`,
    );
    try {
      const result = await statement.executeAsync();
      const rows = (await result.getAllAsync()) as Array<{
        badge_id: string;
        unlocked_at: string;
      }>;
      return rows.map((r) => ({
        badgeId: r.badge_id,
        unlockedAt: r.unlocked_at,
      }));
    } finally {
      await statement.finalizeAsync();
    }
  }

  /**
   * Graba en SQLite cada insignia cuyos criterios se cumplen ahora (INSERT OR IGNORE conserva la primera fecha).
   */
  async syncQuizBadgeUnlocksFromCriteria(
    states: readonly { id: string; unlocked: boolean }[],
  ): Promise<void> {
    await this.init();
    const db = await getAppDatabase();
    const now = toIso();
    const statement = await db.prepareAsync(
      `INSERT OR IGNORE INTO ${QUIZ_BADGES_UNLOCKED_TABLE} (badge_id, unlocked_at) VALUES (?, ?);`,
    );
    try {
      for (const s of states) {
        if (!s.unlocked) continue;
        await statement.executeAsync([s.id, now]);
      }
    } finally {
      await statement.finalizeAsync();
    }
  }

  /** User opened this quiz size but has not finished (or closed mid-quiz). */
  async upsertQuizSession(chapterKey: string, questionCount: number): Promise<void> {
    await this.init();
    const db = await getAppDatabase();
    const now = toIso();
    const statement = await db.prepareAsync(
      `REPLACE INTO ${QUIZ_SESSIONS_TABLE} (chapter_key, question_count, updated_at)
       VALUES (?, ?, ?);`,
    );
    try {
      await statement.executeAsync([chapterKey, questionCount, now]);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async deleteQuizSession(chapterKey: string, questionCount: number): Promise<void> {
    await this.init();
    const db = await getAppDatabase();
    const statement = await db.prepareAsync(
      `DELETE FROM ${QUIZ_SESSIONS_TABLE} WHERE chapter_key = ? AND question_count = ?;`,
    );
    try {
      await statement.executeAsync([chapterKey, questionCount]);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getAllQuizSessions(): Promise<ChapterQuizSessionRow[]> {
    await this.init();
    const db = await getAppDatabase();
    const statement = await db.prepareAsync(
      `SELECT chapter_key, question_count, updated_at FROM ${QUIZ_SESSIONS_TABLE};`,
    );
    try {
      const result = await statement.executeAsync();
      const rows = (await result.getAllAsync()) as Array<{
        chapter_key: string;
        question_count: number;
        updated_at: string;
      }>;
      return rows.map((row) => ({
        chapterKey: row.chapter_key,
        questionCount: row.question_count,
        updatedAt: row.updated_at,
      }));
    } finally {
      await statement.finalizeAsync();
    }
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

  async insertAttempt({
    id,
    chapterKey,
    book,
    chapter,
    score,
    total,
    completedAt,
    questions,
    answers,
    pass,
    isFavorite = false,
  }: {
    id: string;
    chapterKey: string;
    book: string;
    chapter: number;
    score: number;
    total: number;
    completedAt: string;
    questions: Question[];
    answers: ChapterQuizAnswerEntry[];
    pass: boolean;
    isFavorite?: boolean;
  }): Promise<void> {
    await this.init();
    const db = await getAppDatabase();
    const now = toIso();
    const statement = await db.prepareAsync(
      `INSERT INTO ${QUIZ_ATTEMPTS_TABLE} (
        id, chapter_key, book, chapter, score, total, completed_at,
        questions_json, answers_json, pass, is_favorite, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
    );
    try {
      await statement.executeAsync([
        id,
        chapterKey,
        book,
        chapter,
        score,
        total,
        completedAt,
        JSON.stringify(questions),
        JSON.stringify(answers),
        pass ? 1 : 0,
        isFavorite ? 1 : 0,
        now,
      ]);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getAllAttempts(limit = 500): Promise<ChapterQuizAttemptRow[]> {
    await this.init();
    const db = await getAppDatabase();
    const statement = await db.prepareAsync(
      `SELECT id, chapter_key, book, chapter, score, total, completed_at,
              questions_json, answers_json, pass, is_favorite
       FROM ${QUIZ_ATTEMPTS_TABLE}
       ORDER BY completed_at DESC
       LIMIT ?;`
    );
    try {
      const result = await statement.executeAsync([limit]);
      const rows = (await result.getAllAsync()) as Array<{
        id: string;
        chapter_key: string;
        book: string;
        chapter: number;
        score: number;
        total: number;
        completed_at: string;
        questions_json: string;
        answers_json: string;
        pass: number;
        is_favorite: number;
      }>;
      return rows.map((row) => ({
        id: row.id,
        chapterKey: row.chapter_key,
        book: row.book,
        chapter: row.chapter,
        score: row.score,
        total: row.total,
        completedAt: row.completed_at,
        questions: parseQuestions(row.questions_json),
        answers: parseAnswers(row.answers_json),
        pass: row.pass === 1,
        isFavorite: row.is_favorite === 1,
      }));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getAttemptById(id: string): Promise<ChapterQuizAttemptRow | null> {
    await this.init();
    const db = await getAppDatabase();
    const statement = await db.prepareAsync(
      `SELECT id, chapter_key, book, chapter, score, total, completed_at,
              questions_json, answers_json, pass, is_favorite
       FROM ${QUIZ_ATTEMPTS_TABLE} WHERE id = ? LIMIT 1;`
    );
    try {
      const result = await statement.executeAsync([id]);
      const rows = (await result.getAllAsync()) as Array<{
        id: string;
        chapter_key: string;
        book: string;
        chapter: number;
        score: number;
        total: number;
        completed_at: string;
        questions_json: string;
        answers_json: string;
        pass: number;
        is_favorite: number;
      }>;
      const row = rows[0];
      if (!row) return null;
      return {
        id: row.id,
        chapterKey: row.chapter_key,
        book: row.book,
        chapter: row.chapter,
        score: row.score,
        total: row.total,
        completedAt: row.completed_at,
        questions: parseQuestions(row.questions_json),
        answers: parseAnswers(row.answers_json),
        pass: row.pass === 1,
        isFavorite: row.is_favorite === 1,
      };
    } finally {
      await statement.finalizeAsync();
    }
  }

  async setAttemptFavorite(id: string, isFavorite: boolean): Promise<void> {
    await this.init();
    const db = await getAppDatabase();
    const statement = await db.prepareAsync(
      `UPDATE ${QUIZ_ATTEMPTS_TABLE} SET is_favorite = ?, updated_at = ? WHERE id = ?;`
    );
    try {
      await statement.executeAsync([isFavorite ? 1 : 0, toIso(), id]);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async deleteAttempt(id: string): Promise<void> {
    await this.init();
    const db = await getAppDatabase();
    const statement = await db.prepareAsync(
      `DELETE FROM ${QUIZ_ATTEMPTS_TABLE} WHERE id = ?;`
    );
    try {
      await statement.executeAsync([id]);
    } finally {
      await statement.finalizeAsync();
    }
  }

  /** Removes cached questions for a chapter (e.g. after cloud invalidation). */
  async deleteCachedQuestions(chapterKey: string): Promise<void> {
    await this.init();
    const db = await getAppDatabase();
    const statement = await db.prepareAsync(
      `DELETE FROM ${QUIZ_CACHE_TABLE} WHERE chapter_key = ?;`
    );
    try {
      await statement.executeAsync([chapterKey]);
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
