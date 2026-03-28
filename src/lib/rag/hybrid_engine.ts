/**
 * RAG Engine — Pure TypeScript implementation
 * Uses TF-IDF + cosine similarity for semantic-like retrieval
 * No external vector DB required — runs entirely on the server
 * Drop-in ready for pgvector/Qdrant upgrade when needed
 */

import fs from "fs";
import path from "path";
import { KnowledgeChunk, KnowledgeCategory, ChunkMetadata } from "@/types";

// ============================================================
// Document Loading
// ============================================================

const KNOWLEDGE_DIR = path.join(process.cwd(), "public", "knowledge");

const CATEGORY_MAP: Record<string, KnowledgeCategory> = {
    "about.md": "about",
    "skills.md": "skills",
    "projects.md": "projects",
    "experience.md": "experience",
    "availability.md": "availability",
};

export async function loadKnowledgeFiles(): Promise<
    Array<{ filename: string; content: string; category: KnowledgeCategory }>
> {
    const files: Array<{ filename: string; content: string; category: KnowledgeCategory }> = [];

    try {
        const dirFiles = fs.readdirSync(KNOWLEDGE_DIR);
        for (const file of dirFiles) {
            if (file.endsWith(".md") || file.endsWith(".txt")) {
                const fullPath = path.join(KNOWLEDGE_DIR, file);
                const content = fs.readFileSync(fullPath, "utf-8");
                const category = CATEGORY_MAP[file] || "about";
                files.push({ filename: file, content, category });
            }
        }
    } catch {
        console.error("Knowledge directory not found, using fallback");
    }

    return files;
}

// ============================================================
// Text Chunking
// ============================================================

function chunkMarkdown(
    content: string,
    filename: string,
    category: KnowledgeCategory,
    maxChunkSize = 800,
    overlap = 100
): KnowledgeChunk[] {
    const chunks: KnowledgeChunk[] = [];

    // Split by markdown sections (##, ###) first
    const sectionRegex = /^(#{1,3} .+)$/gm;
    const sections: Array<{ title: string; start: number; end: number }> = [];

    let match;
    const matches = [...content.matchAll(sectionRegex)];
    for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        sections.push({
            title: m[0],
            start: m.index!,
            end: i + 1 < matches.length ? matches[i + 1].index! : content.length,
        });
    }

    if (sections.length === 0) {
        // No markdown headers — chunk by paragraph
        const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 20);
        for (let i = 0; i < paragraphs.length; i++) {
            const text = paragraphs[i].trim();
            chunks.push(createChunk(text, filename, category, undefined, i));
        }
        return chunks;
    }

    // Chunk by section, splitting large sections
    for (const section of sections) {
        const sectionText = content.slice(section.start, section.end).trim();

        if (sectionText.length <= maxChunkSize) {
            chunks.push(
                createChunk(sectionText, filename, category, section.title, chunks.length)
            );
        } else {
            // Split large section into overlapping chunks
            const words = sectionText.split(" ");
            let start = 0;
            while (start < words.length) {
                const chunkWords = words.slice(start, start + Math.floor(maxChunkSize / 5));
                const chunkText = chunkWords.join(" ");
                if (chunkText.trim().length > 50) {
                    chunks.push(
                        createChunk(chunkText, filename, category, section.title, chunks.length)
                    );
                }
                start += Math.floor((maxChunkSize - overlap) / 5);
            }
        }
    }

    return chunks;
}

function createChunk(
    content: string,
    source: string,
    category: KnowledgeCategory,
    section?: string,
    index?: number
): KnowledgeChunk {
    const id = `${source}-${index ?? 0}-${Date.now()}`;
    const metadata: ChunkMetadata = { source, category, section };
    return { id, content, metadata };
}

// ============================================================
// TF-IDF Vectorizer (lightweight semantic search)
// ============================================================

interface TFIDFIndex {
    chunks: KnowledgeChunk[];
    idf: Map<string, number>;
    tfidfVectors: Map<string, Map<string, number>>;
}

let ragIndex: TFIDFIndex | null = null;

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

function computeTF(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    for (const token of tokens) {
        tf.set(token, (tf.get(token) || 0) + 1);
    }
    for (const [word, count] of tf) {
        tf.set(word, count / tokens.length);
    }
    return tf;
}

function buildIndex(chunks: KnowledgeChunk[]): TFIDFIndex {
    const tokenizedChunks = chunks.map((c) => ({
        id: c.id,
        tokens: tokenize(c.content),
    }));

    // Compute IDF
    const df = new Map<string, number>();
    for (const { tokens } of tokenizedChunks) {
        const uniqueTokens = new Set(tokens);
        for (const token of uniqueTokens) {
            df.set(token, (df.get(token) || 0) + 1);
        }
    }

    const idf = new Map<string, number>();
    const N = chunks.length;
    for (const [word, count] of df) {
        idf.set(word, Math.log((N + 1) / (count + 1)) + 1);
    }

    // Compute TF-IDF vectors
    const tfidfVectors = new Map<string, Map<string, number>>();
    for (const { id, tokens } of tokenizedChunks) {
        const tf = computeTF(tokens);
        const tfidf = new Map<string, number>();
        for (const [word, tfVal] of tf) {
            tfidf.set(word, tfVal * (idf.get(word) || 1));
        }
        tfidfVectors.set(id, tfidf);
    }

    return { chunks, idf, tfidfVectors };
}

function cosineSimilarity(
    vecA: Map<string, number>,
    vecB: Map<string, number>
): number {
    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (const [word, val] of vecA) {
        dot += val * (vecB.get(word) || 0);
        magA += val * val;
    }
    for (const [, val] of vecB) {
        magB += val * val;
    }

    const mag = Math.sqrt(magA) * Math.sqrt(magB);
    return mag === 0 ? 0 : dot / mag;
}

// ============================================================
// Public RAG API
// ============================================================

export async function initRAG(): Promise<void> {
    if (ragIndex) return;

    const files = await loadKnowledgeFiles();
    const allChunks: KnowledgeChunk[] = [];

    for (const file of files) {
        const chunks = chunkMarkdown(file.content, file.filename, file.category);
        allChunks.push(...chunks);
    }

    ragIndex = buildIndex(allChunks);
    console.log(`RAG index built: ${allChunks.length} chunks from ${files.length} files`);
}

export async function retrieveRelevantChunks(
    query: string,
    topK = 5
): Promise<KnowledgeChunk[]> {
    if (!ragIndex) await initRAG();
    if (!ragIndex || ragIndex.chunks.length === 0) return [];

    const queryTokens = tokenize(query);
    const queryTF = computeTF(queryTokens);
    const queryVector = new Map<string, number>();
    for (const [word, tfVal] of queryTF) {
        queryVector.set(word, tfVal * (ragIndex.idf.get(word) || 1));
    }

    const scored = ragIndex.chunks.map((chunk) => ({
        chunk,
        score: cosineSimilarity(queryVector, ragIndex!.tfidfVectors.get(chunk.id) || new Map()),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored
        .slice(0, topK)
        .filter((s) => s.score > 0.01)
        .map((s) => ({ ...s.chunk, score: s.score }));
}

export function formatContextForPrompt(chunks: KnowledgeChunk[]): string {
    if (chunks.length === 0) return "";

    const grouped = new Map<string, KnowledgeChunk[]>();
    for (const chunk of chunks) {
        const key = chunk.metadata.category;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(chunk);
    }

    let context = "=== KNOWLEDGE BASE CONTEXT ===\n\n";
    for (const [category, categoryChunks] of grouped) {
        context += `[${category.toUpperCase()}]\n`;
        context += categoryChunks.map((c) => c.content).join("\n\n") + "\n\n";
    }
    return context;
}

// ============================================================
// Stop words (English)
// ============================================================

const STOP_WORDS = new Set([
    "the", "is", "at", "which", "on", "a", "an", "and", "or", "but",
    "in", "with", "to", "of", "for", "as", "by", "this", "that", "it",
    "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "may",
    "might", "shall", "can", "from", "not", "also", "more", "very",
    "just", "about", "up", "what", "how", "when", "where", "who",
    "your", "my", "me", "you", "we", "they", "he", "she", "his", "her",
    "their", "our", "its", "i", "am", "im", "tell", "know", "like",
]);
