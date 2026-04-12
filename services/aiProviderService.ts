/**
 * Multi-provider AI rotation service.
 *
 * Provider priority (most → least generous free tier):
 *   1. Groq             – llama-3.3-70b-versatile  – 1 000 req/day, 30 RPM  (FREE, no billing)
 *   2. Gemini           – gemini-2.5-flash-lite     –    20 req/day, 15 RPM  (FREE tier)
 *   3. OpenRouter       – llama-3.3-70b:free router –   200 req/day, 20 RPM  (FREE, no billing)
 *
 * Sign-up links (no credit card needed for any):
 *   Groq:        https://console.groq.com
 *   OpenRouter:  https://openrouter.ai
 *   Gemini:      https://aistudio.google.com/app/apikey
 *
 * Cooldowns are module-level so they persist across renders but reset on app restart.
 */

export type AiProviderId = "groq" | "gemini" | "openrouter";

export interface AiProviderKeys {
  googleAIKey?: string | null;
  groqKey?: string | null;
  openRouterKey?: string | null;
}

// Groq: llama-3.3-70b-versatile = 1 000 req/day free.
// Use llama-3.1-8b-instant if you prefer 14 400 req/day at lower quality.
export const GROQ_MODEL = "llama-3.3-70b-versatile";

// OpenRouter: free model router — automatically picks an available free model.
// Replace with e.g. "deepseek/deepseek-chat-v3-0324:free" for a specific model.
export const OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Cooldown tracking
// ---------------------------------------------------------------------------

const cooldowns = new Map<AiProviderId, number>(); // value = expiry timestamp

export const setProviderCooldown = (id: AiProviderId, ms: number): void => {
  cooldowns.set(id, Date.now() + ms);
};

export const isProviderOnCooldown = (id: AiProviderId): boolean =>
  Date.now() < (cooldowns.get(id) ?? 0);

/** Returns a human-readable label for the remaining cooldown, or null if not on cooldown. */
export const getProviderCooldownLabel = (id: AiProviderId): string | null => {
  const remaining = (cooldowns.get(id) ?? 0) - Date.now();
  if (remaining <= 0) return null;
  if (remaining > ONE_DAY_MS - 60_000) return "mañana";
  const mins = Math.ceil(remaining / 60_000);
  return mins > 60 ? `${Math.ceil(mins / 60)}h` : `${mins}min`;
};

// ---------------------------------------------------------------------------
// ProviderError
// ---------------------------------------------------------------------------

export class ProviderError extends Error {
  constructor(
    public readonly providerId: AiProviderId,
    public readonly httpStatus: number,
    public readonly isDailyQuota: boolean,
    public readonly retryAfterMs: number,
    message: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const parseOpenAIRetryAfterMs = (body: unknown): number => {
  try {
    const text = JSON.stringify(body);
    const m = text.match(/"retry_after"\s*:\s*(\d+(?:\.\d+)?)/i)
      ?? text.match(/(\d+(?:\.\d+)?)\s*s(?:econds?)?/i);
    return m ? Math.ceil(parseFloat(m[1])) * 1000 + 500 : 60_000;
  } catch {
    return 60_000;
  }
};

const isDailyQuotaBody = (body: unknown): boolean => {
  const t = JSON.stringify(body).toLowerCase();
  return t.includes("perday") || t.includes("per_day") || t.includes("requests per day");
};

// ---------------------------------------------------------------------------
// JSON system instruction (Groq + OpenRouter)
// Gemini keeps its own TOON-output instruction defined in useChapterQuizAI.ts
// ---------------------------------------------------------------------------

export const JSON_QUIZ_SYSTEM_INSTRUCTION =
  `Quiz bíblico español. Input TOON (b,c,n,verses[v,t]) RV60. ` +
  `Responde SOLO JSON válido sin markdown. ` +
  `Esquema: {"questions":[{"question":"","options":["","","",""],"correct":"","reference":"","explanation":"","difficulty":"easy|medium|hard"}]} ` +
  `Reglas: 4 opciones exactas, correct idéntico a una de las opciones, basa cada pregunta en el texto dado, RV60.`;

// ---------------------------------------------------------------------------
// Core fetch helper (OpenAI-compatible API)
// ---------------------------------------------------------------------------

async function callOpenAICompatible(
  providerId: AiProviderId,
  baseUrl: string,
  apiKey: string,
  model: string,
  systemInstruction: string,
  userPrompt: string,
  maxTokens: number,
  extraHeaders?: Record<string, string>,
): Promise<string> {
  const useJsonMode = providerId === "groq";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.1,
      ...(useJsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const daily = res.status === 429 && isDailyQuotaBody(body);
    const retryAfterMs = res.status === 429 ? parseOpenAIRetryAfterMs(body) : 0;
    throw new ProviderError(
      providerId,
      res.status,
      daily,
      daily ? ONE_DAY_MS : retryAfterMs,
      `[${providerId}] HTTP ${res.status}: ${JSON.stringify(body).slice(0, 300)}`,
    );
  }

  const content: string = (body as any).choices?.[0]?.message?.content ?? "";
  if (!content) {
    throw new ProviderError(providerId, 200, false, 0, `[${providerId}] empty response`);
  }
  return content;
}

// ---------------------------------------------------------------------------
// Public provider call functions
// ---------------------------------------------------------------------------

export async function callGroq(
  apiKey: string,
  userPrompt: string,
  maxTokens: number,
): Promise<string> {
  return callOpenAICompatible(
    "groq",
    "https://api.groq.com/openai/v1",
    apiKey,
    GROQ_MODEL,
    JSON_QUIZ_SYSTEM_INSTRUCTION,
    userPrompt,
    maxTokens,
  );
}

export async function callOpenRouter(
  apiKey: string,
  userPrompt: string,
  maxTokens: number,
): Promise<string> {
  return callOpenAICompatible(
    "openrouter",
    "https://openrouter.ai/api/v1",
    apiKey,
    OPENROUTER_MODEL,
    JSON_QUIZ_SYSTEM_INSTRUCTION,
    userPrompt,
    maxTokens,
    {
      "HTTP-Referer": "https://bible-app.local",
      "X-Title": "Bible Quiz App",
    },
  );
}
