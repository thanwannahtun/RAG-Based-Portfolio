import { create } from "zustand";
import {
    ChatMessage,
    KnowledgeChunk,
    ModelConfig,
    ResponseType,
    AVAILABLE_MODELS,
} from "@/types";

// ============================================================
// Chat Store
// ============================================================

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    selectedModel: ModelConfig;
    isRAGEnabled: boolean;

    // Actions
    addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => string;
    updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
    appendToMessage: (id: string, chunk: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setModel: (config: ModelConfig) => void;
    toggleRAG: () => void;
    clearMessages: () => void;
}

const DEFAULT_MODEL: ModelConfig = {
    provider: "ollama-cloud",
    model: AVAILABLE_MODELS[0].name,
    host: process.env.NEXT_PUBLIC_OLLAMA_HOST || "https://ollama.com",
    temperature: 0.7,
    apiKey: process.env.NEXT_PUBLIC_OLLAMA_API_KEY,
};

function generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    isLoading: false,
    error: null,
    selectedModel: DEFAULT_MODEL,
    isRAGEnabled: true,

    addMessage: (msg) => {
        const id = generateId();
        const message: ChatMessage = {
            ...msg,
            id,
            timestamp: new Date(),
        };
        set((state) => ({ messages: [...state.messages, message] }));
        return id;
    },

    updateMessage: (id, updates) => {
        set((state) => ({
            messages: state.messages.map((m) =>
                m.id === id ? { ...m, ...updates } : m
            ),
        }));
    },

    appendToMessage: (id, chunk) => {
        set((state) => ({
            messages: state.messages.map((m) =>
                m.id === id ? { ...m, content: m.content + chunk } : m
            ),
        }));
    },

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setModel: (config) => set({ selectedModel: config }),
    toggleRAG: () => set((state) => ({ isRAGEnabled: !state.isRAGEnabled })),
    clearMessages: () => set({ messages: [] }),
}));

// ============================================================
// Chat Hook
// ============================================================

export function useSendMessage() {
    const {
        messages,
        selectedModel,
        isRAGEnabled,
        addMessage,
        appendToMessage,
        updateMessage,
        setLoading,
        setError,
    } = useChatStore();

    const sendMessage = async (userInput: string): Promise<void> => {
        if (!userInput.trim()) return;

        setError(null);
        setLoading(true);

        // Add user message
        addMessage({ role: "user", content: userInput });

        // Add empty assistant message for streaming
        const assistantId = addMessage({
            role: "assistant",
            content: "",
            isStreaming: true,
        });

        try {
            const history = messages
                .slice(-10)
                .map((m) => ({ role: m.role, content: m.content }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userInput,
                    history,
                    modelConfig: selectedModel,
                    useRAG: isRAGEnabled,
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error("No response stream");

            let sources: KnowledgeChunk[] = [];
            let responseType: ResponseType = "general";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const raw = decoder.decode(value, { stream: true });
                const lines = raw.split("\n").filter((l) => l.startsWith("data: "));

                for (const line of lines) {
                    try {
                        const json = JSON.parse(line.slice(6));

                        if (json.type === "chunk") {
                            appendToMessage(assistantId, json.content);
                        } else if (json.type === "sources") {
                            sources = json.sources;
                            responseType = json.responseType;
                        } else if (json.type === "done") {
                            responseType = json.responseType || responseType;
                        } else if (json.type === "error") {
                            throw new Error(json.error);
                        }
                    } catch {
                        // skip malformed SSE lines
                    }
                }
            }

            updateMessage(assistantId, {
                isStreaming: false,
                sources,
                responseType,
            });
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Something went wrong";
            updateMessage(assistantId, {
                content: `⚠️ Error: ${errorMsg}\n\nMake sure your Ollama API key is configured correctly.`,
                isStreaming: false,
                responseType: "general",
            });
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return { sendMessage };
}