/**
 * OpenRouter provider — meta-llama/llama-3.3-70b-instruct:free
 * Free tier: ~200 req/day, no credit card — https://openrouter.ai
 */
import { AIProvider, ChatMessage, ChatOptions } from "../types";
import { openaiCompatChat, openaiCompatStream } from "./_openaiCompat";

const BASE_URL = "https://openrouter.ai/api/v1";
/**
 * openrouter/free — smart router that picks available free models at random.
 * Released Feb 2026. Supports structured outputs, tool calling, image understanding.
 * Better than hardcoding a specific free model that might become unavailable.
 * https://openrouter.ai/openrouter/free
 */
export const OPENROUTER_MODEL = "openrouter/free";

const EXTRA_HEADERS = {
  "HTTP-Referer": "https://bible-app.local",
  "X-Title": "Bible App",
};

const getApiKey = () => process.env.EXPO_PUBLIC_OPENROUTER_API_KEY ?? "";

export const openRouterProvider: AIProvider = {
  id: "openrouter",
  name: "OpenRouter",
  isAvailable: () => !!getApiKey(),
  chat: (messages: ChatMessage[], options?: ChatOptions) =>
    openaiCompatChat(
      "openrouter",
      BASE_URL,
      getApiKey(),
      OPENROUTER_MODEL,
      messages,
      options ?? {},
      EXTRA_HEADERS,
    ),
  stream: (
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    options?: ChatOptions,
  ) =>
    openaiCompatStream(
      "openrouter",
      BASE_URL,
      getApiKey(),
      OPENROUTER_MODEL,
      messages,
      onChunk,
      options ?? {},
      EXTRA_HEADERS,
    ),
};
