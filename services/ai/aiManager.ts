/**
 * AIManager — singleton that manages multiple AI providers with
 * round-robin rotation, automatic fallback and per-provider cooldowns.
 *
 * Rotation strategy:
 *   Each request starts from the next provider in the list (round-robin).
 *   If that provider fails, it falls back to the following ones in order.
 *   Providers on cooldown (429 rate-limit) are skipped entirely.
 *   This distributes the daily quota evenly across all providers.
 *
 * Providers (app keys — users configure nothing):
 *   1. Groq        — 1 000 req/day  (EXPO_PUBLIC_GROQ_API_KEY)
 *   2. Cerebras    — generous limits (EXPO_PUBLIC_CEREBRA_API_KEY)
 *   3. OpenRouter  — 200 req/day    (EXPO_PUBLIC_OPENROUTER_API_KEY)
 *   4. Gemini      — 20 req/day     (EXPO_PUBLIC_GEMINI_API_KEY)
 *
 * Adding a new provider: create a file in services/ai/providers/, then
 * add a single line to the `providers` array at the bottom of this file.
 */
import {
  AIChatResult,
  AIProvider,
  ChatMessage,
  ChatOptions,
  ONE_DAY_MS,
  ProviderError,
} from "./types";
import { groqProvider } from "./providers/groqProvider";
import { cerebrasProvider } from "./providers/cerebrasProvider";
import { openRouterProvider } from "./providers/openRouterProvider";
import { geminiProvider } from "./providers/geminiProvider";
import { setGeminiApiKey } from "./providers/geminiProvider";

export interface ProviderStatus {
  id: string;
  name: string;
  available: boolean;
  onCooldown: boolean;
  cooldownLabel: string | null;
}

class AIManager {
  private readonly providers: AIProvider[];
  private readonly cooldowns = new Map<string, number>();
  /** Index of the provider that will start the next request (round-robin). */
  private currentIndex = 0;

  constructor(providers: AIProvider[]) {
    this.providers = providers;
  }

  // ---------------------------------------------------------------------------
  // Key management
  // ---------------------------------------------------------------------------

  /** Updates the Gemini user key. Call whenever storedData$.googleAIKey changes. */
  setGeminiKey(key: string): void {
    setGeminiApiKey(key ?? "");
  }

  // ---------------------------------------------------------------------------
  // Cooldown helpers
  // ---------------------------------------------------------------------------

  private isOnCooldown(id: string): boolean {
    return Date.now() < (this.cooldowns.get(id) ?? 0);
  }

  private setCooldown(id: string, ms: number): void {
    this.cooldowns.set(id, Date.now() + ms);
  }

  getCooldownLabel(id: string): string | null {
    const remaining = (this.cooldowns.get(id) ?? 0) - Date.now();
    if (remaining <= 0) return null;
    if (remaining > ONE_DAY_MS - 60_000) return "mañana";
    const mins = Math.ceil(remaining / 60_000);
    return mins > 60 ? `${Math.ceil(mins / 60)}h` : `${mins}min`;
  }

  private handleProviderError(providerId: string, err: unknown): void {
    if (err instanceof ProviderError && err.retryAfterMs > 0) {
      this.setCooldown(providerId, err.retryAfterMs);
    }
  }

  // ---------------------------------------------------------------------------
  // Provider availability
  // ---------------------------------------------------------------------------

  /**
   * Returns available providers starting from currentIndex (round-robin),
   * then advances the index so the next request starts from the following one.
   * Providers on cooldown or with no key are skipped.
   */
  private getProvidersForRequest(): AIProvider[] {
    const n = this.providers.length;
    const startIndex = this.currentIndex;
    this.currentIndex = (this.currentIndex + 1) % n;

    const rotated: AIProvider[] = [];
    for (let i = 0; i < n; i++) {
      rotated.push(this.providers[(startIndex + i) % n]!);
    }

    const available = rotated.filter((p) => p.isAvailable() && !this.isOnCooldown(p.id));

    const nextProvider = this.providers[this.currentIndex];
    const nextAvailable = this.providers
      .slice(this.currentIndex)
      .concat(this.providers.slice(0, this.currentIndex))
      .find((p) => p.isAvailable() && !this.isOnCooldown(p.id));

    console.log(
      `[AIManager] round-robin start=${available[0]?.id ?? "none"} | model=${available[0]?.modelName ?? "none"} | queue=[${available.map((p) => p.id).join(" → ")}] | next_request_start=${nextProvider?.id ?? "?"}${nextAvailable && nextAvailable.id !== nextProvider?.id ? ` (skip to ${nextAvailable.id})` : ""}`,
    );

    return available;
  }

  /** Returns true when at least one provider is configured and not on cooldown. */
  hasAnyProvider(): boolean {
    return this.providers.some((p) => p.isAvailable());
  }

  /** Returns status info for all providers (used by the status screen). */
  getProviderStatuses(): ProviderStatus[] {
    return this.providers.map((p) => ({
      id: p.id,
      name: p.name,
      available: p.isAvailable(),
      onCooldown: this.isOnCooldown(p.id),
      cooldownLabel: this.getCooldownLabel(p.id),
    }));
  }

  // ---------------------------------------------------------------------------
  // Core methods
  // ---------------------------------------------------------------------------

  /**
   * Sends a chat request. Tries each available provider in priority order.
   * Automatically applies cooldowns on rate-limit errors and falls back to
   * the next provider.
   */
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<AIChatResult> {
    const available = this.getProvidersForRequest();
    const failures: string[] = [];

    for (const provider of available) {
      try {
        const startedAt = performance.now();
        const text = await provider.chat(messages, options);
        const elapsedMs = performance.now() - startedAt;
        const minutes = elapsedMs / 60_000;
        const seconds = elapsedMs / 1000;
        console.log(
          `[AIManager] ✓ used=${provider.id} | model=${provider.modelName} | latency=${minutes.toFixed(4)} min (${seconds.toFixed(1)} s)`,
        );
        return {
          text,
          providerId: provider.id,
          modelName: provider.modelName,
        };
      } catch (err) {
        this.handleProviderError(provider.id, err);
        failures.push(
          `${provider.id}(${err instanceof ProviderError ? err.httpStatus : "err"})`,
        );
        console.warn(`[AIManager] chat provider=${provider.id} failed`, err);
      }
    }

    throw this.buildAllFailedError(failures);
  }

  /**
   * Streaming chat request. Calls onChunk for each text token received.
   * Falls back to the next provider on error.
   */
  async stream(
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    options?: ChatOptions,
  ): Promise<void> {
    const available = this.getProvidersForRequest();
    const failures: string[] = [];

    for (const provider of available) {
      try {
        const startedAt = performance.now();
        await provider.stream(messages, onChunk, options);
        const elapsedMs = performance.now() - startedAt;
        const minutes = elapsedMs / 60_000;
        const seconds = elapsedMs / 1000;
        console.log(
          `[AIManager] ✓ used=${provider.id} | latency=${minutes.toFixed(4)} min (${seconds.toFixed(1)} s)`,
        );
        return;
      } catch (err) {
        this.handleProviderError(provider.id, err);
        failures.push(
          `${provider.id}(${err instanceof ProviderError ? err.httpStatus : "err"})`,
        );
        console.warn(`[AIManager] stream provider=${provider.id} failed`, err);
      }
    }

    throw this.buildAllFailedError(failures);
  }

  // ---------------------------------------------------------------------------
  // Error builder
  // ---------------------------------------------------------------------------

  private buildAllFailedError(failures: string[]): Error {
    const cooldownInfo = this.providers
      .map((p) => {
        const label = this.getCooldownLabel(p.id);
        return label ? `${p.id} (disponible en ${label})` : null;
      })
      .filter(Boolean)
      .join(", ");

    const noProviders = !this.hasAnyProvider();
    const detail = noProviders
      ? "no-providers"
      : failures.length > 0
        ? failures.join(", ")
        : "all-on-cooldown";

    return Object.assign(
      new Error(`[AIManager] all providers failed: ${detail}`),
      {
        _allProvidersFailed: true,
        _noProviders: noProviders,
        _cooldownInfo: cooldownInfo,
        _failures: failures,
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// To add a new provider: create the file, then add it to this array.
// ---------------------------------------------------------------------------
export const aiManager = new AIManager([
  groqProvider,
  cerebrasProvider,
  openRouterProvider,
  geminiProvider,
]);
