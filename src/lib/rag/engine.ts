import { GoogleGenAI } from '@google/genai';
import ollama from "ollama";
import fs from "fs";
import path from "path";
import { KnowledgeChunk, KnowledgeCategory, ChunkMetadata } from "@/types";

// ============================================================
// Configuration
// ============================================================

const USE_OLLAMA = process.env.NEXT_PUBLIC_EMBEDDING_PROVIDER === "ollama";
// Note: Use server-side env vars (without NEXT_PUBLIC) for API keys if possible for security
const client = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "" });


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

// ============================================================
// Types & State
// ============================================================

interface HybridIndex {
  chunks: KnowledgeChunk[];
  idf: Map<string, number>;
  tfidfVectors: Map<string, Map<string, number>>;
  semanticVectors: Map<string, number[]>; // Store embeddings here
}

let ragIndex: HybridIndex | null = null;

// ============================================================
// Universal Embedding Fetcher
// ============================================================

async function getEmbedding(text: string): Promise<number[]> {
  try {
    if (USE_OLLAMA) {
      const response = await ollama.embed({
        model: "nomic-embed-text-v2-moe:latest",
        input: text,
      });
      // Ollama returns an array of arrays (one for each input)
      return Array.isArray(response.embeddings[0])
        ? (response.embeddings[0] as unknown as number[])
        : (response.embeddings as unknown as number[]);
    } else {
      // New SDK syntax for Gemini-embedding-001
      const result = await client.models.embedContent({
        model: "gemini-embedding-001",
        contents: [text],
      });
      // The new SDK returns results in a specific object structure
      return result.embeddings?.[0]?.values || [];
    }
  } catch (error) {
    console.error("Embedding failed:", error);
    return [];
  }
}

// ============================================================
// Document Loading & Chunking (Your existing logic)
// ============================================================

const KNOWLEDGE_DIR = path.join(process.cwd(), "public", "knowledge");
const CATEGORY_MAP: Record<string, KnowledgeCategory> = {
  "about.md": "about", "skills.md": "skills", "projects.md": "projects",
  "experience.md": "experience", "availability.md": "availability",
};

export async function loadKnowledgeFiles() {
  const files: Array<{ filename: string; content: string; category: KnowledgeCategory }> = [];
  try {
    const dirFiles = fs.readdirSync(KNOWLEDGE_DIR);
    for (const file of dirFiles) {
      if (file.endsWith(".md") || file.endsWith(".txt")) {
        const fullPath = path.join(KNOWLEDGE_DIR, file);
        const content = fs.readFileSync(fullPath, "utf-8");
        files.push({ filename: file, content, category: CATEGORY_MAP[file] || "about" });
      }
    }
  } catch { console.error("Knowledge directory not found"); }
  return files;
}

function chunkMarkdown(content: string, filename: string, category: KnowledgeCategory): KnowledgeChunk[] {
  // Simplified chunking for brevity, fits your existing logic
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 20);
  return paragraphs.map((text, i) => ({
    id: `${filename}-${i}-${Date.now()}`,
    content: text.trim(),
    metadata: { source: filename, category }
  }));
}

// ============================================================
// Search Utilities
// ============================================================

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  tokens.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));
  tf.forEach((v, k) => tf.set(k, v / tokens.length));
  return tf;
}

function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dot = 0, magA = 0, magB = 0;
  vecA.forEach((val, word) => { dot += val * (vecB.get(word) || 0); magA += val * val; });
  vecB.forEach(val => magB += val * val);
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

function cosineSimilarityVectors(vecA: number[], vecB: number[]): number {
  if (!vecA.length || !vecB.length) return 0;
  const dot = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

// ============================================================
// Public RAG API (Hybrid Implementation)
// ============================================================

export async function initRAG(): Promise<void> {
  if (ragIndex) return;

  const files = await loadKnowledgeFiles();
  const allChunks: KnowledgeChunk[] = [];
  for (const file of files) {
    allChunks.push(...chunkMarkdown(file.content, file.filename, file.category));
  }

  // 1. Build TF-IDF
  const tokenized = allChunks.map(c => ({ id: c.id, tokens: tokenize(c.content) }));
  const df = new Map<string, number>();
  tokenized.forEach(t => new Set(t.tokens).forEach(tok => df.set(tok, (df.get(tok) || 0) + 1)));

  const idf = new Map<string, number>();
  const N = allChunks.length;
  df.forEach((count, word) => idf.set(word, Math.log((N + 1) / (count + 1)) + 1));

  const tfidfVectors = new Map<string, Map<string, number>>();
  const semanticVectors = new Map<string, number[]>();

  // 2. Generate Embeddings & TF-IDF Vectors
  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    const tf = computeTF(tokenized[i].tokens);
    const tfidf = new Map<string, number>();
    tf.forEach((v, k) => tfidf.set(k, v * (idf.get(k) || 1)));
    tfidfVectors.set(chunk.id, tfidf);

    // AI Semantic Vector
    const emb = await getEmbedding(chunk.content);
    semanticVectors.set(chunk.id, emb);
  }

  ragIndex = { chunks: allChunks, idf, tfidfVectors, semanticVectors };
  console.log(`Hybrid RAG Index built: ${allChunks.length} chunks`);
}

export async function retrieveRelevantChunks(query: string, topK = 5): Promise<KnowledgeChunk[]> {
  if (!ragIndex) await initRAG();
  if (!ragIndex || ragIndex.chunks.length === 0) return [];

  // A. Lexical Score (TF-IDF)
  const qTokens = tokenize(query);
  const qTF = computeTF(qTokens);
  const qTFIDF = new Map<string, number>();
  qTF.forEach((v, k) => qTFIDF.set(k, v * (ragIndex!.idf.get(k) || 1)));

  const lexicalResults = ragIndex.chunks
    .map(c => ({ id: c.id, score: cosineSimilarity(qTFIDF, ragIndex!.tfidfVectors.get(c.id)!) }))
    .sort((a, b) => b.score - a.score);

  // B. Semantic Score (Vector)
  const qEmb = await getEmbedding(query);
  const semanticResults = ragIndex.chunks
    .map(c => ({ id: c.id, score: cosineSimilarityVectors(qEmb, ragIndex!.semanticVectors.get(c.id)!) }))
    .sort((a, b) => b.score - a.score);

  // C. Reciprocal Rank Fusion (RRF)
  const rrfScores = new Map<string, number>();
  const k = 60;

  lexicalResults.forEach((res, rank) => rrfScores.set(res.id, (rrfScores.get(res.id) || 0) + 1 / (k + rank)));
  semanticResults.forEach((res, rank) => rrfScores.set(res.id, (rrfScores.get(res.id) || 0) + 1 / (k + rank)));

  return ragIndex.chunks
    .filter(c => rrfScores.has(c.id))
    .sort((a, b) => rrfScores.get(b.id)! - rrfScores.get(a.id)!)
    .slice(0, topK);
}

/**
 * Context Formatter
 * Organizes retrieved chunks by category for the LLM prompt
 */
export function formatContextForPrompt(chunks: KnowledgeChunk[]): string {
  if (!chunks || chunks.length === 0) return "";

  // Group chunks by category (e.g., 'projects', 'skills') to help LLM structure
  const grouped = new Map<string, KnowledgeChunk[]>();

  for (const chunk of chunks) {
    const key = chunk.metadata.category || "general";
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(chunk);
  }

  let context = "--- START OF KNOWLEDGE BASE CONTEXT ---\n\n";

  for (const [category, categoryChunks] of grouped) {
    context += `[CATEGORY: ${category.toUpperCase()}]\n`;
    // Join chunks with double newlines for readability
    context += categoryChunks.map((c) => c.content).join("\n\n") + "\n\n";
  }

  context += "--- END OF KNOWLEDGE BASE CONTEXT ---";

  return context;
}
