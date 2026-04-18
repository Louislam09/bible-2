import { storedData$ } from "@/context/LocalstoreContext";
import { aiManager } from "@/services/ai/aiManager";
import { ChatMessage } from "@/services/ai/types";
import { use$ } from "@legendapp/state/react";
import { useCallback, useEffect, useState } from "react";

interface ChatCompletionResponse {
  content: string;
  scriptureReferences: string[];
}

interface UseBibleAIChatCompletionReturn {
  loading: boolean;
  error: string | null;
  sendMessage: (
    message: string,
    conversationHistory: Array<{ role: "user" | "model"; parts: string }>,
  ) => Promise<ChatCompletionResponse>;
  clearResults: () => void;
  isEmpty: boolean;
}

const BIBLE_REFERENCE_REGEX =
  /([1-3]?\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)\s+(\d+):(\d+(?:-\d+)?)/g;

const BIBLE_SYSTEM_INSTRUCTION = `Eres un guía bíblico cristiano. NO eres reemplazo de la Biblia.

REGLA SUPREMA:
- Solo puedes responder temas de Biblia, fe cristiana, teología cristiana y aplicación espiritual basada en Escritura.
- Si el usuario pide algo fuera de este dominio, rechaza brevemente y redirígelo a un tema bíblico.
- Puedes responder definiciones siempre que estén relacionadas con Biblia, fe cristiana, doctrina, historia bíblica o contexto religioso.
- Si una palabra es ambigua, pregunta si el usuario la quiere en contexto bíblico antes de responder fuera de alcance.
- No inventes información ni versículos.

Instrucciones:
- Responde en español con nombres bíblicos en español
- Sé claro, conciso y basado en las Escrituras
- No inventes versículos ni doctrinas fuera del texto bíblico
- Siempre prioriza invitar al usuario a leer la Escritura
- IMPORTANTE: Siempre incluye referencias bíblicas cuando menciones versículos. Debes usar el formato exacto: "Libro Capítulo:Versículo" o "Libro Capítulo:Versículo-Versículo" para rangos
- Ejemplos de formato correcto: "Juan 3:16", "Mateo 5:3-5", "1 Corintios 15:55", "2 Timoteo 3:16-17"
- El formato debe ser: [Número opcional] [Nombre del Libro] [Capítulo]:[Versículo] o [Número opcional] [Nombre del Libro] [Capítulo]:[Versículo]-[Versículo]
- SIEMPRE incluye al menos una referencia bíblica en cada respuesta
- Mantén el contexto de la conversación anterior
- Si el usuario hace preguntas de seguimiento, responde considerando el contexto previo
- Sé amable, pastoral y edificante

Formato de respuesta obligatorio:
1. Explicación breve
2. Versículos (referencias bíblicas claras)
3. Aplicación
4. Pregunta reflexiva (al menos una pregunta final)`;

function extractScriptureReferences(text: string): string[] {
  const references: string[] = [];
  BIBLE_REFERENCE_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = BIBLE_REFERENCE_REGEX.exec(text)) !== null) {
    const reference = `${match[1]} ${match[2]}:${match[3]}`;
    if (!references.includes(reference)) {
      references.push(reference);
    }
  }
  return references;
}

/**
 * Converts the Gemini-format history from useBibleAIChat into a standard
 * ChatMessage array ready for any AI provider.
 */
function buildMessages(
  conversationHistory: Array<{ role: "user" | "model"; parts: string }>,
): ChatMessage[] {
  const history: ChatMessage[] = conversationHistory.map((msg) => ({
    role: msg.role === "model" ? "assistant" : "user",
    content: msg.parts,
  }));
  return [
    { role: "system", content: BIBLE_SYSTEM_INSTRUCTION },
    ...history,
  ];
}

const useBibleAIChatCompletion = (): UseBibleAIChatCompletionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep Gemini key in sync with the manager
  const googleAIKey = use$(() => storedData$.googleAIKey.get());
  useEffect(() => {
    aiManager.setGeminiKey(googleAIKey ?? "");
  }, [googleAIKey]);

  const sendMessage = useCallback(
    async (
      message: string,
      conversationHistory: Array<{ role: "user" | "model"; parts: string }> = [],
    ): Promise<ChatCompletionResponse> => {
      if (!message.trim()) {
        throw new Error("Empty message");
      }

      setLoading(true);
      setError(null);

      try {
        const messages = buildMessages(conversationHistory);
        const { text } = await aiManager.chat(messages, {
          maxTokens: 8192,
          temperature: 0.3,
        });

        return {
          content: text,
          scriptureReferences: extractScriptureReferences(text),
        };
      } catch (err: unknown) {
        console.error("[BibleAIChatCompletion]", err);

        const anyErr = err as Record<string, unknown>;
        let errorMessage: string;

        if (anyErr?._noProviders) {
          errorMessage =
            "No hay proveedores de IA disponibles. Verifica la configuración.";
        } else if (anyErr?._allProvidersFailed) {
          const cooldownInfo = anyErr._cooldownInfo as string | undefined;
          errorMessage = cooldownInfo
            ? `Todos los proveedores alcanzaron su límite. ${cooldownInfo}.`
            : "Todos los proveedores fallaron. Reintenta en unos minutos.";
        } else {
          const msg = String((err as { message?: string })?.message ?? "").toLowerCase();
          if (msg.includes("api key") || msg.includes("invalid")) {
            errorMessage =
              "La clave de API no es válida. Verifica tu clave en la configuración.";
          } else if (msg.includes("quota") || msg.includes("limit")) {
            errorMessage =
              "Se ha alcanzado el límite de solicitudes. Por favor intenta más tarde.";
          } else if (msg.includes("network") || msg.includes("fetch")) {
            errorMessage =
              "Error de conexión. Por favor verifica tu conexión a internet.";
          } else {
            errorMessage = "Error al generar respuesta. Por favor intenta nuevamente.";
          }
        }

        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearResults = useCallback((): void => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    sendMessage,
    clearResults,
    isEmpty: !loading && !error,
  };
};

export default useBibleAIChatCompletion;
