/**
 * Shared fetch helpers for OpenAI-compatible chat APIs.
 * Used by Groq, Cerebras and OpenRouter providers.
 */
import { ChatMessage, ChatOptions, ONE_DAY_MS, ProviderError } from "../types";

function parseRetryAfterMs(body: unknown): number {
  try {
    const text = JSON.stringify(body);
    const m =
      text.match(/"retry_after"\s*:\s*(\d+(?:\.\d+)?)/i) ??
      text.match(/(\d+(?:\.\d+)?)\s*s(?:econds?)?/i);
    return m ? Math.ceil(parseFloat(m[1])) * 1000 + 500 : 60_000;
  } catch {
    return 60_000;
  }
}

function isDailyQuotaBody(body: unknown): boolean {
  const t = JSON.stringify(body).toLowerCase();
  return (
    t.includes("perday") ||
    t.includes("per_day") ||
    t.includes("requests per day")
  );
}

export async function openaiCompatChat(
  providerId: string,
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options: ChatOptions = {},
  extraHeaders?: Record<string, string>,
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.3,
      ...(options.jsonMode
        ? { response_format: { type: "json_object" } }
        : {}),
    }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const daily = res.status === 429 && isDailyQuotaBody(body);
    const retryAfterMs = res.status === 429 ? parseRetryAfterMs(body) : 0;
    throw new ProviderError(
      providerId,
      res.status,
      daily,
      daily ? ONE_DAY_MS : retryAfterMs,
      `[${providerId}] HTTP ${res.status}: ${JSON.stringify(body).slice(0, 300)}`,
    );
  }

  const content: string =
    (body as Record<string, any>).choices?.[0]?.message?.content ?? "";
  if (!content) {
    throw new ProviderError(
      providerId,
      200,
      false,
      0,
      `[${providerId}] empty response`,
    );
  }
  return content;
}

export async function openaiCompatStream(
  providerId: string,
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  options: ChatOptions = {},
  extraHeaders?: Record<string, string>,
): Promise<void> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.3,
      stream: true,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const daily = res.status === 429 && isDailyQuotaBody(body);
    const retryAfterMs = res.status === 429 ? parseRetryAfterMs(body) : 0;
    throw new ProviderError(
      providerId,
      res.status,
      daily,
      daily ? ONE_DAY_MS : retryAfterMs,
      `[${providerId}] HTTP ${res.status}: ${JSON.stringify(body).slice(0, 300)}`,
    );
  }

  if (!res.body) {
    throw new ProviderError(
      providerId,
      200,
      false,
      0,
      `[${providerId}] no response body for streaming`,
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;
        try {
          const json = JSON.parse(data);
          const text = json.choices?.[0]?.delta?.content;
          if (text) onChunk(text);
        } catch {
          // skip malformed SSE chunk
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
