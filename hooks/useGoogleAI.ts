import { GoogleGenerativeAI } from "@google/generative-ai";
import { storedData$ } from "@/context/LocalstoreContext";
import { use$ } from "@legendapp/state/react";
import { AiInstructions, userPrompt } from "@/constants/aiPrompts";
import { useState } from "react";

interface UseGoogleAIResponse {
  explanation: string;
  loading: boolean;
  error: string | null;
  fetchExplanation: (verse: {
    text: string;
    reference: string;
  }) => Promise<void>;
}

export const useGoogleAI = (): UseGoogleAIResponse => {
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleAIKey = use$(() => storedData$.googleAIKey.get());

  const fetchExplanation = async (verse: {
    text: string;
    reference: string;
  }) => {
    if (!googleAIKey) {
      setError("Por favor, configura tu API key de Google AI en los ajustes.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

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

      const result = await model.generateContent([
        {
          text: userPrompt(verse),
        },
      ]);

      const response = await result.response;
      // console.log("response", response.text());
      setExplanation(response.text());
    } catch (err: any) {
      console.error("Error fetching explanation:", err);

      // Handle specific error cases
      if (
        err.message?.includes("API_KEY") ||
        err.message?.includes("invalid")
      ) {
        setError("API key inválida. Verifica tu clave de Google AI Studio.");
      } else if (
        err.message?.includes("quota") ||
        err.message?.includes("limit")
      ) {
        setError(
          "Límite de API alcanzado. Intenta más tarde o usa tu propia API key."
        );
      } else if (
        err.message?.includes("not found") ||
        err.message?.includes("404")
      ) {
        setError("Modelo no disponible. Contacta al administrador.");
      } else if (err.message?.includes("SAFETY")) {
        setError(
          "Consulta bloqueada por filtros de seguridad. Intenta reformular tu búsqueda."
        );
      } else {
        setError(
          "Lo siento, ha ocurrido un error al obtener la explicación. Por favor intenta de nuevo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    explanation,
    loading,
    error,
    fetchExplanation,
  };
};
