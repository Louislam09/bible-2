/**
 * Gemini provider — gemini-3-flash-preview (Gemini 3 Flash)
 *
 * Key priority (matches useGoogleAI.ts):
 *   1. _userKey — storedData$.googleAIKey, set via aiManager.setGeminiKey() from settings
 *   2. EXPO_PUBLIC_GEMINI_API_KEY — .env fallback when the user has not saved a key
 *
 * User key wins so a misconfigured or disabled-project env key does not override a
 * working AI Studio key the user already configured in the app.
 *
 * Free tier quotas: https://aistudio.google.com/app/apikey
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_MODEL } from "@/constants/geminiModel";
import { AIProvider, ChatMessage, ChatOptions, ONE_DAY_MS, ProviderError } from "../types";

/** User key from settings (same source as useGoogleAI). Set via aiManager.setGeminiKey(). */
let _userKey = "";

const getActiveKey = (): string => {
  const user = _userKey.trim();
  if (user) return user;
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";
};

/**
 * Called when storedData$.googleAIKey changes (e.g. ai-providers screen, quiz hooks).
 */
export function setGeminiApiKey(key: string): void {
  _userKey = key ?? "";
}

type GeminiHistory = Array<{
  role: "user" | "model";
  parts: [{ text: string }];
}>;

function parseMessages(messages: ChatMessage[]): {
  systemInstruction: string | null;
  history: GeminiHistory;
  lastMessage: string;
} {
  const systemMessages = messages.filter((m) => m.role === "system");
  const conversational = messages.filter((m) => m.role !== "system");

  if (conversational.length === 0) {
    throw new ProviderError("gemini", 400, false, 0, "[gemini] no messages to send");
  }

  const systemInstruction =
    systemMessages.length > 0
      ? systemMessages.map((m) => m.content).join("\n")
      : null;

  const lastMsg = conversational[conversational.length - 1];
  const historyMessages = conversational.slice(0, -1);

  const history: GeminiHistory = historyMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  return { systemInstruction, history, lastMessage: lastMsg.content };
}

function mapGeminiError(err: unknown): ProviderError {
  const msg = String((err as Record<string, unknown>)?.message ?? "");
  const isDaily =
    msg.includes("PerDay") ||
    msg.includes("FreeTier") ||
    msg.includes("per_day");
  const isRate =
    msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota");
  const is403 =
    msg.includes("[403") ||
    msg.includes(" 403 ") ||
    msg.includes("blocked") ||
    msg.includes("PERMISSION_DENIED");
  const retryMs = isDaily ? ONE_DAY_MS : isRate ? 60_000 : 0;
  const httpStatus = isRate ? 429 : is403 ? 403 : 500;
  return new ProviderError(
    "gemini",
    httpStatus,
    isDaily,
    retryMs,
    `[gemini] ${msg.slice(0, 300)}`,
  );
}

export const geminiProvider: AIProvider = {
  id: "gemini",
  name: "Gemini",
  modelName: GEMINI_MODEL,
  isAvailable: () => !!getActiveKey(),

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
    const key = getActiveKey();
    if (!key) throw new ProviderError("gemini", 401, false, 0, "[gemini] no API key");
    const { systemInstruction, history, lastMessage } = parseMessages(messages);
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      ...(systemInstruction ? { systemInstruction } : {}),
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens ?? 4096,
      },
    });
    try {
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastMessage);
      return result.response.text();
    } catch (err) {
      throw mapGeminiError(err);
    }
  },

  async stream(
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    options: ChatOptions = {},
  ): Promise<void> {
    const key = getActiveKey();
    if (!key) throw new ProviderError("gemini", 401, false, 0, "[gemini] no API key");
    const { systemInstruction, history, lastMessage } = parseMessages(messages);
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      ...(systemInstruction ? { systemInstruction } : {}),
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens ?? 4096,
      },
    });
    try {
      const chat = model.startChat({ history });
      const result = await chat.sendMessageStream(lastMessage);
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) onChunk(text);
      }
    } catch (err) {
      throw mapGeminiError(err);
    }
  },
};
