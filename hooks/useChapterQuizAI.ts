import { GEMINI_MODEL } from "@/constants/geminiModel";
import { chapterQuizState$ } from "@/state/chapterQuizState";
import { chapterQuizCacheService } from "@/services/chapterQuizCacheService";
import { Question } from "@/types";
import { shuffleArray } from "@/utils/shuffleOptions";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { useCallback, useRef, useState } from "react";

const MAX_CHAPTER_QUESTIONS = 20;
/** Attempts per generateContent (includes first try + retries). */
const GENERATE_MAX_RETRIES = 5;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const isRateLimitError = (err: unknown): boolean => {
  if (!err || typeof err !== "object") return false;
  const any = err as Record<string, unknown>;
  const msg = String(any.message ?? "");
  const status = any.status;
  const code = any.code;
  return (
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("Too Many Requests") ||
    msg.includes("quota") ||
    status === 429 ||
    code === 429 ||
    code === "RESOURCE_EXHAUSTED"
  );
};

/** 503 / overload — worth retrying with backoff (Google often recovers quickly). */
const isTransientServiceError = (err: unknown): boolean => {
  if (!err || typeof err !== "object") return false;
  const any = err as Record<string, unknown>;
  const msg = String(any.message ?? "").toLowerCase();
  const status = any.status;
  const code = any.code;
  return (
    status === 503 ||
    status === 502 ||
    status === 504 ||
    code === 503 ||
    code === 502 ||
    code === 504 ||
    msg.includes("503") ||
    msg.includes("high demand") ||
    msg.includes("try again later") ||
    msg.includes("unavailable") ||
    msg.includes("overloaded")
  );
};

const isRetryableGenerationError = (err: unknown): boolean =>
  isRateLimitError(err) || isTransientServiceError(err);

/** One in-flight AI generation per chapter key (same process) to avoid duplicate spend. */
const inFlightByChapterKey = new Map<
  string,
  Promise<{ chapterKey: string; questions: Question[] }>
>();

const shuffleOptions = (options: string[]): string[] => {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const normalizeDifficulty = (difficulty: string): Question["difficulty"] => {
  const value = `${difficulty || ""}`.toLowerCase().trim();
  if (value.includes("hard") || value.includes("dif")) return "hard";
  if (value.includes("easy") || value.includes("fac")) return "easy";
  return "medium";
};

const cleanJson = (text: string) =>
  text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

const validateQuestion = (item: any): Question | null => {
  if (!item || typeof item !== "object") return null;
  const rawOptions = Array.isArray(item.options)
    ? item.options.filter((x: unknown) => typeof x === "string").slice(0, 4)
    : [];
  if (!item.question || rawOptions.length < 2 || !item.correct) return null;

  const options = shuffleOptions(rawOptions);
  const correct = rawOptions.includes(item.correct) ? item.correct : rawOptions[0];

  return {
    question: `${item.question}`.trim(),
    options,
    correct,
    reference: `${item.reference || ""}`.trim(),
    explanation: `${item.explanation || ""}`.trim(),
    difficulty: normalizeDifficulty(item.difficulty),
  };
};

/** Reglas fijas y formato; el texto del capítulo va en el mensaje de usuario. */
const CHAPTER_QUIZ_SYSTEM_INSTRUCTION = `Eres un generador de quizzes bíblicos veloz en español. Responde solo en JSON puro (sin markdown, sin bloques de código, sin texto antes ni después).

Traducción de referencia: Reina Valera 1960 (RV60). Alinea formulaciones, citas y términos con la RV60.

Reglas:
- Basa cada pregunta únicamente en el texto del capítulo que el usuario envía en su mensaje.
- Exactamente 4 opciones por pregunta.
- "correct" debe coincidir exactamente con una de las opciones.
- difficulty: "easy", "medium" o "hard".

Formato JSON obligatorio:
{
  "questions": [
    {
      "question": "texto",
      "options": ["A", "B", "C", "D"],
      "correct": "A",
      "reference": "Libro capítulo:versículo",
      "explanation": "breve explicación",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;

const buildUserPrompt = ({
  book,
  chapter,
  maxQuestions,
  versesText,
}: {
  book: string;
  chapter: number;
  maxQuestions: number;
  versesText: string;
}) => {
  return `Libro y capítulo: ${book} ${chapter}

Texto del capítulo (Reina Valera 1960):

${versesText}

Genera exactamente ${maxQuestions} preguntas de opción múltiple basadas solo en el texto anterior.`;
};

const parseQuestions = (rawText: string, maxQuestions: number): Question[] => {
  const cleaned = cleanJson(rawText);
  const parsed = JSON.parse(cleaned);
  const list = Array.isArray(parsed?.questions) ? parsed.questions : [];
  return list
    .map(validateQuestion)
    .filter((item: Question | null): item is Question => !!item)
    .slice(0, maxQuestions);
};

async function generateContentWithRetry(model: GenerativeModel, prompt: string) {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= GENERATE_MAX_RETRIES; attempt += 1) {
    try {
      const result = await model.generateContent(prompt);
      return await result.response;
    } catch (err) {
      lastErr = err;
      if (!isRetryableGenerationError(err) || attempt === GENERATE_MAX_RETRIES) {
        throw err;
      }
      await sleep(2000 * attempt);
    }
  }
  throw lastErr;
}

export const useChapterQuizAI = (googleAIKey: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<GenerativeModel | null>(null);
  const lastKeyRef = useRef<string | null>(null);

  const ensureModel = useCallback(() => {
    if (!googleAIKey) {
      throw new Error("Google AI key is missing");
    }
    if (lastKeyRef.current !== googleAIKey) {
      modelRef.current = null;
      lastKeyRef.current = googleAIKey;
    }
    if (!modelRef.current) {
      const genAI = new GoogleGenerativeAI(googleAIKey);
      // Note: generation_config.responseMimeType is only on v1beta; this SDK hits v1,
      // which rejects it. We rely on the prompt + parseQuestions/cleanJson instead.
      modelRef.current = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: CHAPTER_QUIZ_SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        },
      });
    }
    return modelRef.current;
  }, [googleAIKey]);

  const getQuestionsForChapter = useCallback(
    async ({
      book,
      chapter,
      requestedCount,
      versesText,
    }: {
      book: string;
      chapter: number;
      requestedCount: number;
      /** Texto plano del capítulo (p. ej. getChapterTextRaw); obligatorio si hace falta llamar a la IA. */
      versesText: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const chapterKey = chapterQuizCacheService.buildChapterKey(book, chapter);
        const prefetchedQuestions =
          chapterQuizState$.prefetchedQuestionsByChapter.get()[chapterKey];

        if (prefetchedQuestions && prefetchedQuestions.length >= requestedCount) {
          return {
            chapterKey,
            questions: shuffleArray(prefetchedQuestions.slice(0, requestedCount)),
            source: "prefetch" as const,
          };
        }

        const cachedQuestions = await chapterQuizCacheService.getValidChapterQuestions(chapterKey);

        if (cachedQuestions && cachedQuestions.length >= requestedCount) {
          return {
            chapterKey,
            questions: shuffleArray(cachedQuestions.slice(0, requestedCount)),
            source: "cache" as const,
          };
        }

        let inFlight = inFlightByChapterKey.get(chapterKey);
        if (!inFlight) {
          inFlight = (async () => {
            try {
              const trimmedVerses = versesText.trim();
              if (!trimmedVerses) {
                throw new Error("No hay texto del capítulo para generar el quiz");
              }
              const model = ensureModel();
              const prompt = buildUserPrompt({
                book,
                chapter,
                maxQuestions: MAX_CHAPTER_QUESTIONS,
                versesText: trimmedVerses,
              });
              const response = await generateContentWithRetry(model, prompt);
              const generatedQuestions = parseQuestions(response.text(), MAX_CHAPTER_QUESTIONS);

              if (generatedQuestions.length === 0) {
                throw new Error("No se pudieron generar suficientes preguntas");
              }

              await chapterQuizCacheService.upsertChapterQuestions({
                key: chapterKey,
                book,
                chapter,
                questions: generatedQuestions,
              });

              return { chapterKey, questions: generatedQuestions };
            } finally {
              inFlightByChapterKey.delete(chapterKey);
            }
          })();
          inFlightByChapterKey.set(chapterKey, inFlight);
        }

        const { questions: generatedQuestions } = await inFlight;

        if (generatedQuestions.length < requestedCount) {
          throw new Error("No se pudieron generar suficientes preguntas");
        }

        return {
          chapterKey,
          questions: shuffleArray(generatedQuestions.slice(0, requestedCount)),
          source: "ai" as const,
        };
      } catch (err: unknown) {
        console.error("[ChapterQuizAI]", err);
        if (isRateLimitError(err)) {
          setError("Mucha demanda ahora. Reintenta en unos segundos.");
        } else if (isTransientServiceError(err)) {
          setError("El servicio de IA está saturado. Reintenta en unos segundos.");
        } else {
          setError("No se pudo preparar el quiz de este capítulo");
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [ensureModel]
  );

  return {
    loading,
    error,
    getQuestionsForChapter,
  };
};
