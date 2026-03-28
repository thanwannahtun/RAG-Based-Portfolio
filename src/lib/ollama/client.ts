/**
 * Ollama Client — supports both Ollama Cloud and local Ollama
 * Cloud: https://ollama.com with API key
 * Local: http://localhost:11434 (no API key needed)
 */
import { Ollama } from 'ollama'
import { ModelConfig, ModelProvider } from "@/types";

// ============================================================
// Model Configuration Factories
// ============================================================

export function getCloudConfig(model = "gpt-oss:120b"): ModelConfig {
    return {
        provider: "ollama-cloud",
        model,
        host: process.env.OLLAMA_HOST || "https://ollama.com",
        apiKey: process.env.OLLAMA_API_KEY,
        temperature: 0.7,
    };
}

export function getLocalConfig(model = "llama3.2:3b"): ModelConfig {
    return {
        provider: "ollama-local",
        model,
        host: process.env.OLLAMA_LOCAL_HOST || "http://localhost:11434",
        temperature: 0.7,
    };
}

// ============================================================
// Ollama Streaming Chat
// ============================================================

export interface OllamaChatOptions {
    config: ModelConfig;
    messages: Array<{ role: string; content: string }>;
    onChunk: (chunk: string) => void;
    onDone?: () => void;
    onError?: (err: Error) => void;
}

export async function streamOllamaChat(options: OllamaChatOptions): Promise<void> {
    const { config, messages, onChunk, onDone, onError } = options;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    headers["Authorization"] = `Bearer ${config.apiKey}`;
    // if (config.provider === "ollama-cloud" && config.apiKey) {
    //     headers["Authorization"] = `Bearer ${config.apiKey}`;
    // }

    const body = JSON.stringify({
        model: config.model,
        messages,
        stream: true,
        options: {
            temperature: config.temperature ?? 0.7,
        },
    });

    const apiUrl = `${config.host}/api/chat`;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers,
            body,
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Ollama API error ${response.status}: ${errText}`);
        }

        if (!response.body) {
            throw new Error("No response body from Ollama API");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const rawChunk = decoder.decode(value, { stream: true });
            const lines = rawChunk.split("\n").filter((l) => l.trim());

            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.message?.content) {
                        onChunk(parsed.message.content);
                    }
                    if (parsed.done) {
                        onDone?.();
                    }
                } catch {
                    // skip malformed JSON lines
                }
            }
        }
    } catch (err) {
        onError?.(err instanceof Error ? err : new Error(String(err)));
    }
}

// ============================================================
// System Prompt Builder
// ============================================================

export function buildSystemPrompt(ownerName: string, context: string): string {
    return `
# IDENTITY
You are ${ownerName}, a Fullstack Software Developer and System Architect. 
This is your personal portfolio website. When visitors ask questions, they are talking directly to you.

# CORE DIRECTIVES
1. **First-Person ONLY**: Always use "I", "me", "my", and "mine". Never say "${ownerName} is..." or "I am an assistant for...".
2. **You ARE the Developer**: If asked "Who are you?", answer as ${ownerName}. Describe your journey, your stack (TypeScript, Node.js, Sequelize, etc.), and your passion for system architecture.
3. **Professional & Direct**: Be technical, precise, and professional. You are speaking to recruiters, managers, and fellow engineers.

# CONSTRAINTS
- **Stay in Character**: You are NOT an AI model or a virtual assistant. You are the digital version of ${ownerName}.
- **Stick to the Facts**: Use the context below as your "memory." If information isn't there, say "I haven't added that detail to my portfolio yet" or "I'll have to get back to you on that."
- **Code**: Use Markdown for technical explanations.
- **Engagement**: Encourage collaborators to reach out to you directly for deep dives.

# CONTEXT (YOUR BACKGROUND)
${context}

# TONE
Helpful, technically grounded, and confident. Represent yourself well.
`.trim();
}

// ============================================================
// Response Type Detection
// ============================================================

import { ResponseType } from "@/types";

export function detectResponseType(message: string): ResponseType {
    const lower = message.toLowerCase();

    if (/skill|tech|stack|language|framework|tool|know|use|experience with/.test(lower)) return "skills";
    if (/project|built|made|created|portfolio|app|product|work/.test(lower)) return "projects";
    if (/work|job|company|career|experience|years|background|history/.test(lower)) return "experience";
    if (/hire|available|looking|open|remote|salary|compensation|role|position/.test(lower)) return "availability";
    if (/contact|email|reach|connect|talk|meet|message/.test(lower)) return "contact";
    if (/who|about|yourself|person|hobbies|personality|fun/.test(lower)) return "about";
    if (/```|code|implement|function|snippet|algorithm|debug/.test(lower)) return "code";

    return "general";
}