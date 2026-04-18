/**
 * Groq provider — llama-3.3-70b-versatile
 * Free tier: ~1 000 req/day, 30 RPM — https://console.groq.com
 */
import { AIProvider, ChatMessage, ChatOptions } from "../types";
import { openaiCompatChat, openaiCompatStream } from "./_openaiCompat";

const BASE_URL = "https://api.groq.com/openai/v1";
export const GROQ_MODEL = "llama-3.3-70b-versatile";

const getApiKey = () => process.env.EXPO_PUBLIC_GROQ_API_KEY ?? "";

export const groqProvider: AIProvider = {
  id: "groq",
  name: "Groq",
  modelName: GROQ_MODEL,
  isAvailable: () => !!getApiKey(),
  chat: (messages: ChatMessage[], options?: ChatOptions) =>
    openaiCompatChat(
      "groq",
      BASE_URL,
      getApiKey(),
      GROQ_MODEL,
      messages,
      options ?? {},
    ),
  stream: (
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    options?: ChatOptions,
  ) =>
    openaiCompatStream(
      "groq",
      BASE_URL,
      getApiKey(),
      GROQ_MODEL,
      messages,
      onChunk,
      options ?? {},
    ),
};
