import { useState, useEffect, useCallback, useRef } from "react";
import useBibleAI from "./useBibleAI";

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
    const lastProcessedUserMessageId = useRef<string | null>(null);

    const {
        loading,
        error,
        predictedAnswer,
        verses,
        searchBible,
        clearResults,
        hasResults,
        isEmpty: aiEmpty,
    } = useBibleAI(googleAIKey || "");

    // Keep only the last MAX_MESSAGES messages
    const trimMessages = useCallback((msgs: ChatMessage[]): ChatMessage[] => {
        if (msgs.length <= MAX_MESSAGES) {
            return msgs;
        }
        // Keep the last MAX_MESSAGES messages
        return msgs.slice(-MAX_MESSAGES);
    }, []);

    // Add AI response to messages when it's ready
    useEffect(() => {
        if (predictedAnswer && !loading && hasResults && googleAIKey) {
            setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                // Only add AI message if the last message is from user and we haven't processed it yet
                if (lastMessage && lastMessage.type === "user" && lastMessage.id !== lastProcessedUserMessageId.current) {
                    // Extract scripture references from verses
                    const references = verses.map((v) => v.reference);

                    const aiMessage: ChatMessage = {
                        id: Date.now().toString(),
                        type: "ai",
                        content: predictedAnswer.description,
                        timestamp: new Date(),
                        scriptureReferences: references,
                    };

                    lastProcessedUserMessageId.current = lastMessage.id;
                    const updated = [...prev, aiMessage];
                    return trimMessages(updated);
                }
                return prev;
            });
        }
    }, [predictedAnswer, loading, hasResults, verses, googleAIKey, trimMessages]);

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

            setMessages((prev) => {
                const updated = [...prev, userMessage];
                return trimMessages(updated);
            });

            // Clear previous results and search
            clearResults();
            await searchBible(content.trim(), translation);
        },
        [googleAIKey, searchBible, clearResults, trimMessages]
    );

    const clearConversation = useCallback(() => {
        setMessages([]);
        clearResults();
        setConversationId(Date.now().toString());
        lastProcessedUserMessageId.current = null;
    }, [clearResults]);

    const startNewConversation = useCallback(() => {
        setMessages([]);
        clearResults();
        setConversationId(Date.now().toString());
        lastProcessedUserMessageId.current = null;
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

