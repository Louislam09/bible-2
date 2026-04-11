import { storedData$, StoredAIMessage, StoredAIThread } from "@/context/LocalstoreContext";
import { useState, useCallback, useEffect } from "react";
import useBibleAIChatCompletion from "./useBibleAIChatCompletion";

export interface ChatMessage {
    id: string;
    type: "user" | "ai";
    content: string;
    timestamp: Date;
    scriptureReferences?: string[];
}

export interface ChatThread {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messages: ChatMessage[];
}

interface UseBibleAIChatReturn {
    messages: ChatMessage[];
    threads: ChatThread[];
    activeThreadId: string;
    loading: boolean;
    error: string | null;
    sendMessage: (content: string, translation?: string) => Promise<void>;
    clearConversation: () => void;
    startNewConversation: () => void;
    switchThread: (threadId: string) => void;
    deleteThread: (threadId: string) => void;
    isEmpty: boolean;
}

const MAX_MESSAGES = 30;
const MAX_THREADS = 10;

const buildThreadTitle = (messages: ChatMessage[]): string => {
    const firstUserMessage = messages.find((message) => message.type === "user");
    if (!firstUserMessage) {
        return "Nuevo chat bíblico";
    }
    const trimmed = firstUserMessage.content.trim();
    if (!trimmed) {
        return "Nuevo chat bíblico";
    }
    return trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed;
};

const toStoredMessage = (message: ChatMessage): StoredAIMessage => ({
    id: message.id,
    type: message.type,
    content: message.content,
    timestamp: message.timestamp.toISOString(),
    scriptureReferences: message.scriptureReferences,
});

const toRuntimeMessage = (message: StoredAIMessage): ChatMessage => ({
    id: message.id,
    type: message.type,
    content: message.content,
    timestamp: new Date(message.timestamp),
    scriptureReferences: message.scriptureReferences,
});

const toStoredThread = (thread: ChatThread): StoredAIThread => ({
    id: thread.id,
    title: thread.title,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    messages: thread.messages.map(toStoredMessage),
});

const toRuntimeThread = (thread: StoredAIThread): ChatThread => ({
    id: thread.id,
    title: thread.title,
    createdAt: new Date(thread.createdAt),
    updatedAt: new Date(thread.updatedAt),
    messages: (thread.messages || []).map(toRuntimeMessage),
});

const createNewThread = (): ChatThread => {
    const now = new Date();
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: "Nuevo chat bíblico",
        createdAt: now,
        updatedAt: now,
        messages: [],
    };
};

const useBibleAIChat = (googleAIKey: string | null): UseBibleAIChatReturn => {
    const [threads, setThreads] = useState<ChatThread[]>(() => {
        const storedThreads = storedData$.aiBibleThreads.get() || [];
        const runtimeThreads = storedThreads.map(toRuntimeThread).sort((a, b) => +b.updatedAt - +a.updatedAt);
        if (runtimeThreads.length > 0) {
            return runtimeThreads.slice(0, MAX_THREADS);
        }
        return [createNewThread()];
    });
    const [activeThreadId, setActiveThreadId] = useState<string>(() => {
        const storedActiveThreadId = storedData$.aiBibleActiveThreadId.get();
        const storedThreads = storedData$.aiBibleThreads.get() || [];
        const hasStoredActiveThread = storedThreads.some((thread) => thread.id === storedActiveThreadId);
        if (storedActiveThreadId && hasStoredActiveThread) {
            return storedActiveThreadId;
        }
        if (storedThreads.length > 0) {
            return storedThreads[0].id;
        }
        return "";
    });
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const storedThreads = storedData$.aiBibleThreads.get() || [];
        const runtimeThreads = storedThreads.map(toRuntimeThread);
        const initialActiveId = storedData$.aiBibleActiveThreadId.get();
        const activeThread = runtimeThreads.find((thread) => thread.id === initialActiveId) || runtimeThreads[0];
        return activeThread?.messages || [];
    });

    const {
        loading,
        error,
        sendMessage: sendChatMessage,
        clearResults,
        isEmpty: aiEmpty,
    } = useBibleAIChatCompletion(googleAIKey);

    useEffect(() => {
        const normalizedThreads = [...threads]
            .sort((a, b) => +b.updatedAt - +a.updatedAt)
            .slice(0, MAX_THREADS);
        storedData$.aiBibleThreads.set(normalizedThreads.map(toStoredThread));
        storedData$.aiBibleActiveThreadId.set(activeThreadId || normalizedThreads[0]?.id || "");
    }, [threads, activeThreadId]);

    // Keep only the last MAX_MESSAGES messages
    const trimMessages = useCallback((msgs: ChatMessage[]): ChatMessage[] => {
        if (msgs.length <= MAX_MESSAGES) {
            return msgs;
        }
        // Keep the last MAX_MESSAGES messages
        return msgs.slice(-MAX_MESSAGES);
    }, []);

    const ensureActiveThread = useCallback((): string => {
        if (activeThreadId) {
            return activeThreadId;
        }
        const newThread = createNewThread();
        setThreads((prev) => [newThread, ...prev].slice(0, MAX_THREADS));
        setActiveThreadId(newThread.id);
        setMessages([]);
        return newThread.id;
    }, [activeThreadId]);

    const upsertThreadMessages = useCallback(
        (threadId: string, nextMessages: ChatMessage[]) => {
            const now = new Date();
            setThreads((prev) => {
                const threadIndex = prev.findIndex((thread) => thread.id === threadId);
                if (threadIndex === -1) {
                    const newThread: ChatThread = {
                        id: threadId,
                        title: buildThreadTitle(nextMessages),
                        createdAt: now,
                        updatedAt: now,
                        messages: nextMessages,
                    };
                    return [newThread, ...prev].sort((a, b) => +b.updatedAt - +a.updatedAt).slice(0, MAX_THREADS);
                }
                const existing = prev[threadIndex];
                const updated: ChatThread = {
                    ...existing,
                    title: buildThreadTitle(nextMessages),
                    updatedAt: now,
                    messages: nextMessages,
                };
                const merged = prev.map((thread) => (thread.id === threadId ? updated : thread));
                return merged.sort((a, b) => +b.updatedAt - +a.updatedAt).slice(0, MAX_THREADS);
            });
        },
        []
    );

    const sendMessage = useCallback(
        async (content: string, translation: string = "RV1960") => {
            if (!content.trim() || !googleAIKey) {
                return;
            }

            const currentThreadId = ensureActiveThread();

            // Add user message
            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                type: "user",
                content: content.trim(),
                timestamp: new Date(),
            };

            // Build conversation history from current messages before adding new user message
            const currentMessages = messages;
            const conversationHistory: Array<{ role: "user" | "model"; parts: string }> = currentMessages
                .slice(-4) // Last 4 messages for context (2 user + 2 AI pairs)
                .map((msg) => ({
                    role: (msg.type === "user" ? "user" : "model") as "user" | "model",
                    parts: msg.content,
                }));

            // Add user message to UI first
            const messagesWithUser = trimMessages([...currentMessages, userMessage]);
            setMessages(messagesWithUser);
            upsertThreadMessages(currentThreadId, messagesWithUser);

            try {
                // Add the current user message to history for chat completion
                const historyWithNewMessage = [
                    ...conversationHistory,
                    {
                        role: "user" as const,
                        parts: content.trim(),
                    },
                ];

                // Send message with conversation history
                const response = await sendChatMessage(content.trim(), historyWithNewMessage);

                // Add AI response to messages
                const aiMessage: ChatMessage = {
                    id: Date.now().toString(),
                    type: "ai",
                    content: response.content,
                    timestamp: new Date(),
                    scriptureReferences: response.scriptureReferences,
                };

                const messagesWithAI = trimMessages([...messagesWithUser, aiMessage]);
                setMessages(messagesWithAI);
                upsertThreadMessages(currentThreadId, messagesWithAI);
            } catch (err) {
                console.error("Error sending message:", err);
                // Error is already handled by the chat completion hook
            }
        },
        [googleAIKey, sendChatMessage, messages, trimMessages, ensureActiveThread, upsertThreadMessages]
    );

    const clearConversation = useCallback(() => {
        setMessages([]);
        const threadId = ensureActiveThread();
        upsertThreadMessages(threadId, []);
        clearResults();
    }, [clearResults, ensureActiveThread, upsertThreadMessages]);

    const startNewConversation = useCallback(() => {
        const newThread = createNewThread();
        setThreads((prev) => [newThread, ...prev].sort((a, b) => +b.updatedAt - +a.updatedAt).slice(0, MAX_THREADS));
        setActiveThreadId(newThread.id);
        setMessages([]);
        clearResults();
    }, [clearResults]);

    const switchThread = useCallback(
        (threadId: string) => {
            const thread = threads.find((item) => item.id === threadId);
            if (!thread) return;
            setActiveThreadId(threadId);
            setMessages(thread.messages);
            clearResults();
        },
        [threads, clearResults]
    );

    const deleteThread = useCallback(
        (threadId: string) => {
            setThreads((prev) => {
                const remaining = prev.filter((thread) => thread.id !== threadId);
                if (remaining.length > 0) {
                    if (activeThreadId === threadId) {
                        const nextActive = remaining[0];
                        setActiveThreadId(nextActive.id);
                        setMessages(nextActive.messages);
                    }
                    return remaining;
                }
                const fallbackThread = createNewThread();
                setActiveThreadId(fallbackThread.id);
                setMessages([]);
                return [fallbackThread];
            });
            clearResults();
        },
        [activeThreadId, clearResults]
    );

    useEffect(() => {
        if (!activeThreadId && threads.length > 0) {
            setActiveThreadId(threads[0].id);
            setMessages(threads[0].messages);
        }
    }, [activeThreadId, threads]);

    useEffect(() => {
        if (!activeThreadId) return;
        const activeThread = threads.find((thread) => thread.id === activeThreadId);
        if (!activeThread) return;
        setMessages(activeThread.messages);
    }, [activeThreadId, threads]);

    return {
        messages,
        threads,
        activeThreadId,
        loading,
        error,
        sendMessage,
        clearConversation,
        startNewConversation,
        switchThread,
        deleteThread,
        isEmpty: messages.length === 0 && aiEmpty,
    };
};

export default useBibleAIChat;

