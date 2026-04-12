import { storedData$ } from "@/context/LocalstoreContext";
import { chapterQuizCacheService } from "@/services/chapterQuizCacheService";
import { aiManager } from "@/services/ai/aiManager";
import { chapterQuizState$ } from "@/state/chapterQuizState";
import { Question } from "@/types";
import { shuffleArray } from "@/utils/shuffleOptions";
import { use$ } from "@legendapp/state/react";
import { useCallback, useEffect, useState } from "react";

const MAX_CHAPTER_QUESTIONS = 20;
const MAX_OUTPUT_TOKENS = 2500;
/** Chapters with fewer than this many verses include the full text in the prompt. */
const VERSE_TEXT_THRESHOLD = 40;

// ---------------------------------------------------------------------------
// Prompt builder
//   < 40 verses  → include the actual verse text for better accuracy
//   ≥ 40 verses  → rely on the model's own Bible knowledge (prompt stays small)
// ---------------------------------------------------------------------------

const buildPrompt = (
  book: string,
  chapter: number,
  maxQuestions: number,
  versesText: string,
): string => {
  const lines = versesText
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const includeText = lines.length > 0 && lines.length < VERSE_TEXT_THRESHOLD;

  const chapterSection = includeText
    ? `Texto del capítulo (Reina Valera 1960):\n${lines.map((l, i) => `${i + 1}. ${l}`).join("\n")}`
    : `Capítulo: ${book} ${chapter}\nBasa las preguntas en tu conocimiento de ese capítulo en la Reina Valera 1960.`;

  return `Eres un generador de cuestionarios bíblicos en español.
Genera exactamente ${maxQuestions} preguntas de opción múltiple sobre ${book} ${chapter}.
Usa siempre la traducción Reina Valera 1960 (RV60).

${chapterSection}

Formato JSON obligatorio:
{
  "questions": [
    {
      "question": "texto",
      "options": ["A", "B", "C", "D"],
      "correct": "A",
      "reference": "${book} ${chapter}:1",
      "explanation": "breve explicación",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Reglas:
- Usa español.
- 4 opciones por pregunta.
- "correct" debe coincidir exactamente con una opción.
- Las preguntas deben ser fieles al contenido real de ese capítulo según la Reina Valera 1960.
- Responde SOLO con JSON válido (sin markdown).`;
};

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

const cleanJson = (text: string) =>
  text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

const shuffleOptions = (options: string[]): string[] => {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
};

const normalizeDifficulty = (difficulty: string): Question["difficulty"] => {
  const value = `${difficulty || ""}`.toLowerCase().trim();
  if (value.includes("hard") || value.includes("dif")) return "hard";
  if (value.includes("easy") || value.includes("fac")) return "easy";
  return "medium";
};

const validateQuestion = (item: unknown): Question | null => {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const rawOptions = Array.isArray(o.options)
    ? (o.options as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 4)
    : [];
  if (!o.question || rawOptions.length < 2 || !o.correct) return null;

  const options = shuffleOptions(rawOptions);
  const correct = rawOptions.includes(`${o.correct}`.trim())
    ? `${o.correct}`.trim()
    : rawOptions[0]!;

  return {
    question: `${o.question}`.trim(),
    options,
    correct,
    reference: `${o.reference ?? ""}`.trim(),
    explanation: `${o.explanation ?? ""}`.trim(),
    difficulty: normalizeDifficulty(`${o.difficulty ?? ""}`),
  };
};

const parseQuestions = (rawText: string, maxQuestions: number): Question[] => {
  const cleaned = cleanJson(rawText);

  let questions: unknown[] = [];
  try {
    const parsed = JSON.parse(cleaned);
    questions = Array.isArray(parsed?.questions) ? parsed.questions : [];
  } catch {
    // Try to extract a JSON block if the model added surrounding text
    const match = cleaned.match(/\{[\s\S]*"questions"[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        questions = Array.isArray(parsed?.questions) ? parsed.questions : [];
      } catch {
        /* unparseable */
      }
    }
  }

  return questions
    .map(validateQuestion)
    .filter((q): q is Question => !!q)
    .slice(0, maxQuestions);
};

// ---------------------------------------------------------------------------
// In-flight deduplication
// ---------------------------------------------------------------------------

const inFlightByChapterKey = new Map<
  string,
  Promise<{ chapterKey: string; questions: Question[] }>
>();

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useChapterQuizAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep Gemini user-key override in sync with the manager
  const googleAIKey = use$(() => storedData$.googleAIKey.get());
  useEffect(() => {
    aiManager.setGeminiKey(googleAIKey ?? "");
  }, [googleAIKey]);

  const getQuestionsForChapter = useCallback(
    async ({
      book,
      chapter,
      requestedCount,
      versesText = "",
    }: {
      book: string;
      chapter: number;
      requestedCount: number;
      versesText?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const chapterKey = chapterQuizCacheService.buildChapterKey(book, chapter);

        // 1. In-memory prefetch
        const prefetched =
          chapterQuizState$.prefetchedQuestionsByChapter.get()[chapterKey];
        if (prefetched && prefetched.length >= requestedCount) {
          return {
            chapterKey,
            questions: shuffleArray(prefetched.slice(0, requestedCount)),
            source: "prefetch" as const,
          };
        }

        // 2. Local cache
        const cached = await chapterQuizCacheService.getValidChapterQuestions(chapterKey);
        if (cached && cached.length >= requestedCount) {
          return {
            chapterKey,
            questions: shuffleArray(cached.slice(0, requestedCount)),
            source: "cache" as const,
          };
        }

        // 3. Generate with AI (deduplication guard)
        let inFlight = inFlightByChapterKey.get(chapterKey);
        if (!inFlight) {
          inFlight = (async () => {
            try {
              const prompt = buildPrompt(book, chapter, MAX_CHAPTER_QUESTIONS, versesText);

              const rawText = await aiManager.chat(
                [
                  { role: "user", content: prompt },
                ],
                { maxTokens: MAX_OUTPUT_TOKENS, jsonMode: true },
              );

              const generatedQuestions = parseQuestions(rawText, MAX_CHAPTER_QUESTIONS);
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
        const anyErr = err as Record<string, unknown>;

        if (anyErr?._noProviders) {
          setError("No hay proveedores de IA disponibles.");
        } else if (anyErr?._allProvidersFailed) {
          const cooldownInfo = anyErr._cooldownInfo as string | undefined;
          setError(
            cooldownInfo
              ? `Todos los proveedores alcanzaron su límite. ${cooldownInfo}.`
              : "Todos los proveedores fallaron. Reintenta en unos minutos.",
          );
        } else {
          setError("No se pudo preparar el quiz de este capítulo.");
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { loading, error, getQuestionsForChapter };
};
