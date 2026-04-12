/**
 * Cerebras provider — llama-3.3-70b
 * Free tier: generous rate limits, ultra-fast inference — https://cloud.cerebras.ai
 */
import { AIProvider, ChatMessage, ChatOptions } from "../types";
import { openaiCompatChat, openaiCompatStream } from "./_openaiCompat";

const BASE_URL = "https://api.cerebras.ai/v1";
export const CEREBRAS_MODEL = "llama-3.3-70b";

const getApiKey = () => process.env.EXPO_PUBLIC_CEREBRA_API_KEY ?? "";

export const cerebrasProvider: AIProvider = {
  id: "cerebras",
  name: "Cerebras",
  isAvailable: () => !!getApiKey(),
  chat: (messages: ChatMessage[], options?: ChatOptions) =>
    openaiCompatChat(
      "cerebras",
      BASE_URL,
      getApiKey(),
      CEREBRAS_MODEL,
      messages,
      options ?? {},
    ),
  stream: (
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    options?: ChatOptions,
  ) =>
    openaiCompatStream(
      "cerebras",
      BASE_URL,
      getApiKey(),
      CEREBRAS_MODEL,
      messages,
      onChunk,
      options ?? {},
    ),
};
