import { storedData$ } from "@/context/LocalstoreContext";
import { chapterQuizCacheService } from "@/services/chapterQuizCacheService";
import { aiManager } from "@/services/ai/aiManager";
import { chapterQuizState$ } from "@/state/chapterQuizState";
import { Question } from "@/types";
import { shuffleArray } from "@/utils/shuffleOptions";
import { use$ } from "@legendapp/state/react";
import { useCallback, useEffect, useState } from "react";

const MAX_CHAPTER_QUESTIONS = 20;
const MAX_OUTPUT_TOKENS = 6000;
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

  return `Eres un generador de cuestionarios bíblicos. Genera EXACTAMENTE ${maxQuestions} preguntas de opción múltiple en español sobre ${book} ${chapter} (Reina Valera 1960).

${chapterSection}

Responde SOLO con JSON válido, sin markdown ni texto adicional. Estructura requerida:
{
  "questions": [
    {
      "question": "<pregunta en español>",
      "options": ["<opción 1>", "<opción 2>", "<opción 3>", "<opción 4>"],
      "correct": "<texto exacto de la opción correcta>",
      "reference": "${book} ${chapter}:<verso>",
      "explanation": "<explicación breve>",
      "difficulty": "easy"
    }
  ]
}

Reglas:
- El array "questions" debe tener EXACTAMENTE ${maxQuestions} elementos.
- "options" es un array de 4 strings cortos, SIN letras A/B/C/D como prefijos.
- "correct" es el texto EXACTO de una de las 4 opciones.
- difficulty puede ser "easy", "medium" o "hard".
- Cierra correctamente todos los arrays [] y objetos {}.`;
};

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// JSON repair: fixes the most common model mistake where the "options" array
// is never closed because the model writes the next key inside it:
//   "options": ["A. text", "correct": "A"  ← missing ] before "correct"
// Strategy: find each options array that has un-closed bracket and close it.
// ---------------------------------------------------------------------------
const repairJson = (text: string): string => {
  // Close unclosed "options" arrays: replace patterns like
  // ["item1","item2",...,"correct": with ["item1","item2"...],"correct":
  // We also handle truncated responses by closing open structures at the end.
  let repaired = text;

  // Fix: "options": ["opt1", "opt2", ... <missing ]> \n"correct":
  repaired = repaired.replace(
    /("options"\s*:\s*\[)((?:"[^"]*"\s*,?\s*)+?)(\s*"correct"\s*:)/g,
    (_match, open, items, next) => {
      const trimmed = items.trimEnd().replace(/,\s*$/, "");
      return `${open}${trimmed}]${next.startsWith(",") ? "" : ","}${next}`;
    },
  );

  // Try to close any truncated JSON by adding missing brackets/braces at the end
  const opens = [...repaired].reduce(
    (acc, ch) => {
      if (ch === "{") return { ...acc, braces: acc.braces + 1 };
      if (ch === "}") return { ...acc, braces: Math.max(0, acc.braces - 1) };
      if (ch === "[") return { ...acc, brackets: acc.brackets + 1 };
      if (ch === "]") return { ...acc, brackets: Math.max(0, acc.brackets - 1) };
      return acc;
    },
    { braces: 0, brackets: 0 },
  );

  repaired += "]".repeat(opens.brackets) + "}".repeat(opens.braces);
  return repaired;
};

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

const tryParseQuestions = (text: string): unknown[] => {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed?.questions)) return parsed.questions;
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // not valid JSON
  }
  return [];
};

const parseQuestions = (rawText: string, maxQuestions: number): Question[] => {
  const cleaned = cleanJson(rawText);

  // Attempt 1: straight parse
  let questions = tryParseQuestions(cleaned);

  // Attempt 2: repair common model mistakes then parse
  if (questions.length === 0) {
    const repaired = repairJson(cleaned);
    questions = tryParseQuestions(repaired);
    if (questions.length > 0) {
      console.log("[parseQuestions] recovered with repairJson");
    }
  }

  // Attempt 3: extract the outermost {...} block then repair + parse
  if (questions.length === 0) {
    const match = cleaned.match(/\{[\s\S]*"questions"[\s\S]*/);
    if (match) {
      questions = tryParseQuestions(repairJson(match[0]));
      if (questions.length > 0) {
        console.log("[parseQuestions] recovered with regex + repairJson");
      }
    }
  }

  if (questions.length === 0) {
    console.warn("[parseQuestions] all parse attempts failed. raw[:300]:", cleaned.slice(0, 300));
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

              const { text: rawText, providerId, modelName } = await aiManager.chat(
                [
                  { role: "user", content: prompt },
                ],
                { maxTokens: MAX_OUTPUT_TOKENS, jsonMode: true },
              );

              console.log("[ChapterQuizAI] raw response (first 500):", rawText.slice(0, 500));

              const generatedQuestions = parseQuestions(rawText, MAX_CHAPTER_QUESTIONS);
              console.log("[ChapterQuizAI] parsed questions count:", generatedQuestions.length);
              if (generatedQuestions.length === 0) {
                throw new Error("No se pudieron generar suficientes preguntas");
              }

              await chapterQuizCacheService.upsertChapterQuestions({
                key: chapterKey,
                book,
                chapter,
                questions: generatedQuestions,
                aiProvider: providerId,
                model: modelName,
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
