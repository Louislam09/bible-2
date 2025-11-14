import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatCompletionResponse {
    content: string;
    scriptureReferences: string[];
}

interface UseBibleAIChatCompletionReturn {
    loading: boolean;
    error: string | null;
    sendMessage: (
        message: string,
        conversationHistory: Array<{ role: "user" | "model"; parts: string }>
    ) => Promise<ChatCompletionResponse>;
    clearResults: () => void;
    isEmpty: boolean;
}

const useBibleAIChatCompletion = (googleAIKey: string | null): UseBibleAIChatCompletionReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const modelRef = useRef<any>(null);
    const chatRef = useRef<any>(null);

    // Initialize the AI model
    useEffect(() => {
        if (googleAIKey && !modelRef.current) {
            try {
                const genAI = new GoogleGenerativeAI(googleAIKey);
                modelRef.current = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.95,
                        topK: 40,
                        maxOutputTokens: 8192,
                    },
                });
            } catch (err) {
                console.error("Error initializing AI model:", err);
            }
        }
    }, [googleAIKey]);

    const sendMessage = useCallback(
        async (
            message: string,
            conversationHistory: Array<{ role: "user" | "model"; parts: string }> = []
        ): Promise<ChatCompletionResponse> => {
            if (!message.trim() || !googleAIKey || !modelRef.current) {
                throw new Error("Invalid request or AI not initialized");
            }

            setLoading(true);
            setError(null);

            try {
                // Build conversation history for chat completion
                const history = conversationHistory.map((msg) => ({
                    role: msg.role === "user" ? "user" : "model",
                    parts: [{ text: msg.parts }],
                }));

                // System instruction for Bible guide context
                const systemInstruction = `Eres un asistente bíblico experto y comprensivo. Tu propósito es ayudar a las personas a entender y explorar las Escrituras de manera clara y accesible.

Instrucciones:
- Responde en español con nombres bíblicos en español
- Sé claro, conciso y basado en las Escrituras
- IMPORTANTE: Siempre incluye referencias bíblicas cuando menciones versículos. Debes usar el formato exacto: "Libro Capítulo:Versículo" o "Libro Capítulo:Versículo-Versículo" para rangos
- Ejemplos de formato correcto: "Juan 3:16", "Mateo 5:3-5", "1 Corintios 15:55", "2 Timoteo 3:16-17"
- El formato debe ser: [Número opcional] [Nombre del Libro] [Capítulo]:[Versículo] o [Número opcional] [Nombre del Libro] [Capítulo]:[Versículo]-[Versículo]
- SIEMPRE incluye al menos una referencia bíblica en cada respuesta cuando sea relevante
- Mantén el contexto de la conversación anterior
- Si el usuario hace preguntas de seguimiento, responde considerando el contexto previo
- Sé amable, pastoral y edificante`;

                // Always rebuild chat session with current history to maintain context
                // This ensures we always have the correct conversation context
                chatRef.current = modelRef.current.startChat({
                    history: history,
                    systemInstruction: systemInstruction,
                });

                // Send the message
                const result = await chatRef.current.sendMessage(message);
                const response = await result.response;
                const text = response.text();

                // Extract scripture references from the response
                // Pattern: Book Chapter:Verse or Book Chapter:Verse-Verse
                const referencePattern = /([1-3]?\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)\s+(\d+):(\d+(?:-\d+)?)/g;
                const references: string[] = [];
                let match;

                while ((match = referencePattern.exec(text)) !== null) {
                    const reference = `${match[1]} ${match[2]}:${match[3]}`;
                    if (!references.includes(reference)) {
                        references.push(reference);
                    }
                }

                return {
                    content: text,
                    scriptureReferences: references,
                };
            } catch (err: any) {
                console.error("Chat Completion Error:", err);

                // Parse error message to provide user-friendly Spanish messages
                let errorMessage = "Error al generar respuesta";

                if (err.message) {
                    const message = err.message.toLowerCase();
                    if (message.includes("api key") || message.includes("api_key") || message.includes("invalid")) {
                        errorMessage = "La clave de API de Google AI no es válida. Por favor verifica tu clave en la configuración.";
                    } else if (message.includes("quota") || message.includes("limit")) {
                        errorMessage = "Se ha alcanzado el límite de solicitudes. Por favor intenta más tarde.";
                    } else if (message.includes("network") || message.includes("fetch")) {
                        errorMessage = "Error de conexión. Por favor verifica tu conexión a internet.";
                    } else if (message.includes("permission") || message.includes("forbidden")) {
                        errorMessage = "No tienes permiso para usar este servicio. Verifica tu clave de API.";
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
        [googleAIKey]
    );

    const clearResults = useCallback((): void => {
        setError(null);
        // Reset chat session
        chatRef.current = null;
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

