import { chapterQuizState$ } from "@/state/chapterQuizState";
import { chapterQuizCacheService } from "@/services/chapterQuizCacheService";
import { IBookVerse, Question } from "@/types";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { shuffleArray } from "@/utils/shuffleOptions";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useCallback, useRef, useState } from "react";

const MAX_CHAPTER_QUESTIONS = 20;

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

const buildPrompt = ({
  book,
  chapter,
  chapterVerses,
  maxQuestions,
}: {
  book: string;
  chapter: number;
  chapterVerses: IBookVerse[];
  maxQuestions: number;
}) => {
  const versesText = chapterVerses
    .map((verse) => `${verse.verse}. ${getVerseTextRaw(verse.text)}`)
    .join("\n");

  return `Eres un generador de cuestionarios bíblicos en español.
Genera exactamente ${maxQuestions} preguntas de opción múltiple basadas SOLAMENTE en este capítulo: ${book} ${chapter}.

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
- NO inventes datos fuera del capítulo dado.
- Responde SOLO con JSON válido (sin markdown).

Capítulo fuente:
${versesText}`;
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

export const useChapterQuizAI = (googleAIKey: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<any>(null);

  const ensureModel = useCallback(() => {
    if (!googleAIKey) {
      throw new Error("Google AI key is missing");
    }
    if (!modelRef.current) {
      const genAI = new GoogleGenerativeAI(googleAIKey);
      modelRef.current = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          topK: 40,
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
      chapterVerses,
      requestedCount,
    }: {
      book: string;
      chapter: number;
      chapterVerses: IBookVerse[];
      requestedCount: number;
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

        const model = ensureModel();
        const prompt = buildPrompt({
          book,
          chapter,
          chapterVerses,
          maxQuestions: MAX_CHAPTER_QUESTIONS,
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedQuestions = parseQuestions(
          response.text(),
          MAX_CHAPTER_QUESTIONS
        );

        if (generatedQuestions.length < requestedCount) {
          throw new Error("No se pudieron generar suficientes preguntas");
        }

        await chapterQuizCacheService.upsertChapterQuestions({
          key: chapterKey,
          book,
          chapter,
          questions: generatedQuestions,
        });

        return {
          chapterKey,
          questions: shuffleArray(generatedQuestions.slice(0, requestedCount)),
          source: "ai" as const,
        };
      } catch (err: any) {
        console.error("[ChapterQuizAI]", err);
        setError("No se pudo preparar el quiz de este capítulo");
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
