/**
 * Cerebras provider — qwen-3-235b-a22b-instruct-2507
 * Free tier: 14 400 req/day, 30 RPM, ultra-fast inference
 * https://inference-docs.cerebras.ai/support/rate-limits
 *
 * Available free models (Apr 2026):
 *   qwen-3-235b-a22b-instruct-2507  — 235B params, best quality  ✅ (this)
 *   gpt-oss-120b                    — 120B params
 *   llama3.1-8b                     — 8B params, fastest
 */
import { AIProvider, ChatMessage, ChatOptions } from "../types";
import { openaiCompatChat, openaiCompatStream } from "./_openaiCompat";

const BASE_URL = "https://api.cerebras.ai/v1";
export const CEREBRAS_MODEL = "qwen-3-235b-a22b-instruct-2507";

const getApiKey = () => process.env.EXPO_PUBLIC_CEREBRA_API_KEY ?? "";

export const cerebrasProvider: AIProvider = {
  id: "cerebras",
  name: "Cerebras",
  modelName: CEREBRAS_MODEL,
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
