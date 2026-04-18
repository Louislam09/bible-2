const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export { ONE_DAY_MS };

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  /** Hint provider to return JSON. Supported by Groq, Cerebras, OpenRouter. */
  jsonMode?: boolean;
}

/** Result of a successful non-streaming chat (includes which provider answered). */
export interface AIChatResult {
  text: string;
  providerId: string;
  modelName: string;
}

export class ProviderError extends Error {
  constructor(
    public readonly providerId: string,
    public readonly httpStatus: number,
    public readonly isDailyQuota: boolean,
    public readonly retryAfterMs: number,
    message: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  readonly modelName: string;
  /** Non-streaming completion. Returns the full response text. */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
  /** Streaming completion. Calls onChunk for each token. */
  stream(
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    options?: ChatOptions,
  ): Promise<void>;
  /** Returns true when an API key is configured and the provider can be used. */
  isAvailable(): boolean;
}
