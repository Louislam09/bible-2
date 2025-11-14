import { useState, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Verse {
  reference: string;
  text: string;
  relevance: string;
}

interface Article {
  title: string;
  summary: string;
  keyPoints: string[];
}

interface PredictedAnswer {
  title: string;
  description: string;
  reference: string;
}

interface BibleAIResponse {
  predictedAnswer: PredictedAnswer;
  verses: Verse[];
  articles: Article[];
}

interface UseBibleAIReturn {
  loading: boolean;
  error: string | null;
  predictedAnswer: PredictedAnswer | null;
  verses: Verse[];
  articles: Article[];
  searchBible: (query: string, translation?: string) => Promise<void>;
  clearResults: () => void;
  retry: (query: string, translation?: string) => void;
  hasResults: boolean;
  isEmpty: boolean;
}

const useBibleAI = (googleAIKey: string): UseBibleAIReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictedAnswer, setPredictedAnswer] =
    useState<PredictedAnswer | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  // Initialize the AI model
  const genAI = new GoogleGenerativeAI(googleAIKey);
  const model = genAI.getGenerativeModel({
    // model: "gemini-1.5-flash",
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192, // Increased to handle longer responses
    },
  });


  const searchBible = useCallback(
    async (query: string, translation: string = "RV1960"): Promise<void> => {
      if (!query.trim()) return;

      setLoading(true);
      setError(null);

      try {
        // Create a comprehensive prompt for Bible AI (optimized for token usage)
        const prompt = `Responde sobre la Biblia: "${query}"

Formato JSON requerido:
{
  "predictedAnswer": {
    "title": "Respuesta breve",
    "description": "Explicación detallada (máx 300 palabras)",
    "reference": "Referencia bíblica principal"
  },
  "verses": [
    {
      "reference": "Libro Capítulo:Versículo",
      "text": "Texto RV1960",
      "relevance": "Por qué es relevante (máx 50 palabras)"
    }
  ],
  "articles": [
    {
      "title": "Tema relacionado",
      "summary": "Resumen (máx 150 palabras)",
      "keyPoints": ["Punto 1", "Punto 2", "Punto 3"]
    }
  ]
}

Reglas:
- Máximo 3-4 versículos más relevantes
- Textos en Reina Valera 1960
- Sé conciso: description máx 300 palabras, relevance máx 50 palabras
- Responde en español con nombres bíblicos en español
- Solo JSON válido, sin markdown ni texto adicional`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        // Check if response was truncated
        const finishReason = response.candidates?.[0]?.finishReason;
        if (finishReason === "MAX_TOKENS") {
          console.warn("Response was truncated due to token limit");
        }

        const text = response.text();
        console.log("Response text length:", text.length);
        console.log("Finish reason:", finishReason);

        // Parse the JSON response
        let parsedResponse: BibleAIResponse;
        let cleanedText = "";

        try {
          // Clean the response text to ensure it's valid JSON
          // Remove markdown code blocks (```json, ```, etc.)
          cleanedText = text
            .replace(/^```json\s*/i, "") // Remove opening ```json
            .replace(/^```\s*/i, "") // Remove opening ```
            .replace(/```\s*$/i, "") // Remove closing ```
            .trim();

          // If response was truncated, try to extract valid JSON
          if (finishReason === "MAX_TOKENS" && !cleanedText.endsWith("}")) {
            // Try to find the last complete JSON object
            const lastBraceIndex = cleanedText.lastIndexOf("}");
            if (lastBraceIndex > 0) {
              cleanedText = cleanedText.substring(0, lastBraceIndex + 1);
            }
          }

          parsedResponse = JSON.parse(cleanedText);
        } catch (parseError: any) {
          console.error("JSON Parse Error:", parseError);
          console.error("Cleaned text (first 500 chars):", cleanedText.substring(0, 500));

          // Try to extract partial JSON if parsing fails
          try {
            // Try to find JSON object boundaries
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const partialJson = jsonMatch[0];
              parsedResponse = JSON.parse(partialJson);
            } else {
              throw new Error("Could not extract valid JSON from response");
            }
          } catch (retryError) {
            throw new Error(`Failed to parse AI response: ${parseError.message}`);
          }
        }

        // Update state with the parsed response
        setPredictedAnswer(parsedResponse.predictedAnswer || null);
        setVerses(parsedResponse.verses || []);
        setArticles(parsedResponse.articles || []);
      } catch (err: any) {
        console.error("Bible AI Search Error:", err);
        setError(err.message || "Failed to search Bible");

        // Set fallback data on error
        setPredictedAnswer(null);
        setVerses([]);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    },
    [model]
  );

  const clearResults = useCallback((): void => {
    setPredictedAnswer(null);
    setVerses([]);
    setArticles([]);
    setError(null);
  }, []);

  const retry = useCallback(
    (query: string, translation?: string): void => {
      searchBible(query, translation);
    },
    [searchBible]
  );

  const returnValue: UseBibleAIReturn = {
    loading,
    error,
    predictedAnswer,
    verses,
    articles,
    searchBible,
    clearResults,
    retry,
    hasResults: !!(predictedAnswer || verses.length > 0 || articles.length > 0),
    isEmpty:
      !loading &&
      !predictedAnswer &&
      verses.length === 0 &&
      articles.length === 0,
  };

  return returnValue;
};

export default useBibleAI;
