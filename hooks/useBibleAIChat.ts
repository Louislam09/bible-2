import { useState, useCallback, useRef } from "react";
import useBibleAIChatCompletion from "./useBibleAIChatCompletion";

export interface ChatMessage {
    id: string;
    type: "user" | "ai";
    content: string;
    timestamp: Date;
    scriptureReferences?: string[];
}

interface UseBibleAIChatReturn {
    messages: ChatMessage[];
    loading: boolean;
    error: string | null;
    sendMessage: (content: string, translation?: string) => Promise<void>;
    clearConversation: () => void;
    startNewConversation: () => void;
    isEmpty: boolean;
}

const MAX_MESSAGES = 5; // Keep last 5 messages

const useBibleAIChat = (googleAIKey: string | null): UseBibleAIChatReturn => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversationId, setConversationId] = useState<string>(Date.now().toString());

    const {
        loading,
        error,
        sendMessage: sendChatMessage,
        clearResults,
        isEmpty: aiEmpty,
    } = useBibleAIChatCompletion(googleAIKey);

    // Keep only the last MAX_MESSAGES messages
    const trimMessages = useCallback((msgs: ChatMessage[]): ChatMessage[] => {
        if (msgs.length <= MAX_MESSAGES) {
            return msgs;
        }
        // Keep the last MAX_MESSAGES messages
        return msgs.slice(-MAX_MESSAGES);
    }, []);

    const sendMessage = useCallback(
        async (content: string, translation: string = "RV1960") => {
            if (!content.trim() || !googleAIKey) {
                return;
            }

            // Add user message
            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                type: "user",
                content: content.trim(),
                timestamp: new Date(),
            };

            // Build conversation history from current messages before adding new user message
            const conversationHistory: Array<{ role: "user" | "model"; parts: string }> = messages
                .slice(-4) // Last 4 messages for context (2 user + 2 AI pairs)
                .map((msg) => ({
                    role: (msg.type === "user" ? "user" : "model") as "user" | "model",
                    parts: msg.content,
                }));

            // Add user message to UI first
            setMessages((prev) => {
                const updated = [...prev, userMessage];
                return trimMessages(updated);
            });

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

                setMessages((prev) => {
                    const updated = [...prev, aiMessage];
                    return trimMessages(updated);
                });
            } catch (err) {
                console.error("Error sending message:", err);
                // Error is already handled by the chat completion hook
            }
        },
        [googleAIKey, sendChatMessage, messages, trimMessages]
    );

    const clearConversation = useCallback(() => {
        setMessages([]);
        clearResults();
        setConversationId(Date.now().toString());
    }, [clearResults]);

    const startNewConversation = useCallback(() => {
        setMessages([]);
        clearResults();
        setConversationId(Date.now().toString());
    }, [clearResults]);

    return {
        messages,
        loading,
        error,
        sendMessage,
        clearConversation,
        startNewConversation,
        isEmpty: messages.length === 0 && aiEmpty,
    };
};

export default useBibleAIChat;

