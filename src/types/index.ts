// ============================================================
// AI & Chat Types
// ============================================================

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: Date;
    sources?: KnowledgeChunk[];
    responseType?: ResponseType;
    isStreaming?: boolean;
}

export type ResponseType =
    | "skills"
    | "projects"
    | "experience"
    | "availability"
    | "contact"
    | "about"
    | "general"
    | "code";

// ============================================================
// RAG / Knowledge Base Types
// ============================================================

export interface KnowledgeChunk {
    id: string;
    content: string;
    metadata: ChunkMetadata;
    embedding?: number[];
    score?: number; // similarity score
}

export interface ChunkMetadata {
    source: string; // filename
    category: KnowledgeCategory;
    section?: string;
    charStart?: number;
    charEnd?: number;
}

export type KnowledgeCategory =
    | "about"
    | "skills"
    | "projects"
    | "experience"
    | "availability";

export interface KnowledgeBase {
    chunks: KnowledgeChunk[];
    lastIndexed: Date;
}

// ============================================================
// Ollama Model Types
// ============================================================

export type ModelProvider = "ollama-cloud" | "ollama-local";

export interface ModelConfig {
    provider?: ModelProvider;
    model: string;
    host: string;
    apiKey?: string;
    temperature?: number;
    contextWindow?: number;
}

export interface OllamaModel {
    name: string;
    provider: ModelProvider;
    label: string;
    description?: string;
    contextWindow: number;
    supportsStreaming: boolean;
}

export const AVAILABLE_MODELS: OllamaModel[] = [
    {
        name: "gpt-oss:120b",
        provider: "ollama-cloud",
        label: "GPT-OSS 120B (Cloud)",
        description: "Most capable — best for complex questions",
        contextWindow: 128000,
        supportsStreaming: true,
    },
    {
        name: "llama3.3:70b",
        provider: "ollama-cloud",
        label: "Llama 3.3 70B (Cloud)",
        description: "Fast and smart — ideal for most queries",
        contextWindow: 128000,
        supportsStreaming: true,
    },
    {
        name: "deepseek-r1:70b",
        provider: "ollama-cloud",
        label: "DeepSeek R1 70B (Cloud)",
        description: "Strong reasoning model",
        contextWindow: 64000,
        supportsStreaming: true,
    },
    {
        name: "llama3.2:3b",
        provider: "ollama-local",
        label: "Llama 3.2 3B (Local)",
        description: "Lightweight — runs on your machine",
        contextWindow: 32000,
        supportsStreaming: true,
    },
    {
        name: "mistral:7b",
        provider: "ollama-local",
        label: "Mistral 7B (Local)",
        description: "Balanced local model",
        contextWindow: 32000,
        supportsStreaming: true,
    },
];

// ============================================================
// API Request/Response Types
// ============================================================

export interface ChatRequest {
    message: string;
    history: Array<{ role: MessageRole; content: string }>;
    modelConfig: ModelConfig;
    useRAG?: boolean;
}

export interface ChatStreamEvent {
    type: "chunk" | "sources" | "done" | "error";
    content?: string;
    sources?: KnowledgeChunk[];
    error?: string;
    responseType?: ResponseType;
}

// ============================================================
// Portfolio / Personal Info Types
// ============================================================

export interface SocialLink {
    name: string;
    url: string;
    icon: string;
    username?: string;
}

export interface SuggestedPrompt {
    text: string;
    category: ResponseType;
    icon: string;
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
    { text: "What are your strongest technical skills?", category: "skills", icon: "⚡" },
    { text: "Tell me about your most impressive projects", category: "projects", icon: "🚀" },
    { text: "Are you available for hire?", category: "availability", icon: "💼" },
    { text: "What's your work experience?", category: "experience", icon: "📋" },
    { text: "What tech stack do you use for fullstack apps?", category: "skills", icon: "🛠️" },
    { text: "What kind of role are you looking for?", category: "availability", icon: "🎯" },
    { text: "What have you built with AI/ML?", category: "projects", icon: "🤖" },
    { text: "How do you approach system design?", category: "experience", icon: "🏗️" },
    { text: "What makes you different from other developers?", category: "about", icon: "✨" },
    { text: "Can you work remotely?", category: "availability", icon: "🌍" },
];