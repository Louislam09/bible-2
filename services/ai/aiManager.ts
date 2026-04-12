/**
 * AIManager — singleton that manages multiple AI providers with
 * automatic fallback and per-provider cooldowns.
 *
 * Provider priority (best free tier first):
 *   1. Groq        — 1 000 req/day  (app key via EXPO_PUBLIC_GROQ_API_KEY)
 *   2. Cerebras    — generous limits (app key via EXPO_PUBLIC_CEREBRA_API_KEY)
 *   3. OpenRouter  — 200 req/day    (app key via EXPO_PUBLIC_OPENROUTER_API_KEY)
 *   4. Gemini      — 20 req/day     (user key stored in storedData$.googleAIKey)
 *
 * Adding a new provider: create a file in services/ai/providers/, then
 * add a single line to the `providers` array at the bottom of this file.
 */
import { AIProvider, ChatMessage, ChatOptions, ONE_DAY_MS, ProviderError } from "./types";
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

  private getAvailableProviders(): AIProvider[] {
    return this.providers.filter(
      (p) => p.isAvailable() && !this.isOnCooldown(p.id),
    );
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
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const available = this.getAvailableProviders();
    const failures: string[] = [];

    for (const provider of available) {
      try {
        const result = await provider.chat(messages, options);
        console.log(`[AIManager] chat provider=${provider.id} ✓`);
        return result;
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
    const available = this.getAvailableProviders();
    const failures: string[] = [];

    for (const provider of available) {
      try {
        await provider.stream(messages, onChunk, options);
        console.log(`[AIManager] stream provider=${provider.id} ✓`);
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
