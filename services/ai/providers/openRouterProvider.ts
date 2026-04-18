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

/**
 * Sanitize options for OpenRouter free-tier:
 * - Strip jsonMode: many free models (e.g. gemma-3-4b-it) don't support
 *   response_format JSON mode and return a 400.
 * - Cap maxTokens at 4096: requesting more than the routed model's output
 *   limit causes a silent empty response (HTTP 200 with no content).
 */
const OPENROUTER_MAX_TOKENS = 4096;
const safeOptions = (options?: ChatOptions): ChatOptions => ({
  ...options,
  jsonMode: false,
  maxTokens: Math.min(options?.maxTokens ?? OPENROUTER_MAX_TOKENS, OPENROUTER_MAX_TOKENS),
});

export const openRouterProvider: AIProvider = {
  id: "openrouter",
  name: "OpenRouter",
  modelName: OPENROUTER_MODEL,
  isAvailable: () => !!getApiKey(),
  chat: (messages: ChatMessage[], options?: ChatOptions) =>
    openaiCompatChat(
      "openrouter",
      BASE_URL,
      getApiKey(),
      OPENROUTER_MODEL,
      messages,
      safeOptions(options),
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
      safeOptions(options),
      EXTRA_HEADERS,
    ),
};
