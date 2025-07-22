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
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });

  const searchBible = useCallback(
    async (query: string, translation: string = "RV1960"): Promise<void> => {
      if (!query.trim()) return;

      setLoading(true);
      setError(null);

      try {
        // Create a comprehensive prompt for Bible AI
        const prompt = `
            Eres un asistente de IA Bíblica. Responde la siguiente pregunta sobre la Biblia: "${query}"
            
            Proporciona tu respuesta en el siguiente formato JSON:
            {
              "predictedAnswer": {
                "title": "Respuesta breve (ej: 'Belén de Judea')",
                "description": "Explicación detallada de la respuesta",
                "reference": "Referencia bíblica principal"
              },
              "verses": [
                {
                  "reference": "Libro Capítulo:Versículo",
                  "text": "El texto del versículo de la traducción Reina Valera 1960",
                  "relevance": "Breve explicación de por qué este versículo es relevante"
                }
              ],
              "articles": [
                {
                  "title": "Tema o concepto relacionado",
                  "summary": "Breve resumen del concepto teológico o contexto histórico",
                  "keyPoints": ["Punto 1", "Punto 2", "Punto 3"]
                }
              ]
            }
    
            Pautas:
            - Proporciona información bíblica precisa
            - Incluye 2-4 versículos más relevantes
            - Usa SIEMPRE la traducción Reina Valera 1960 para el texto de los versículos
            - Incluye contexto histórico y teológico cuando sea apropiado
            - Sé conciso pero informativo
            - Si la pregunta no puede ser respondida desde las escrituras, indícalo claramente
            - Responde COMPLETAMENTE en español
            - Usa nombres bíblicos en español (ej: Jesús, no Jesus; Mateo, no Matthew)
            
            Devuelve solo JSON válido sin texto adicional o formato.
          `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        let parsedResponse: BibleAIResponse;
        try {
          // Clean the response text to ensure it's valid JSON
          const cleanedText = text.replace(/```json|```/g, "").trim();
          parsedResponse = JSON.parse(cleanedText);
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          throw new Error("Failed to parse AI response");
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
