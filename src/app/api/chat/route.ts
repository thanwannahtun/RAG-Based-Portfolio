import { NextRequest } from "next/server";
import { retrieveRelevantChunks, formatContextForPrompt, initRAG } from "@/lib/rag/engine";
import { streamOllamaChat, buildSystemPrompt, detectResponseType } from "@/lib/ollama/client";
import { ChatRequest } from "@/types";

// Init RAG on first request
let ragReady = false;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, history, modelConfig, useRAG = true } = body;

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize RAG index
    if (!ragReady) {
      await initRAG();
      ragReady = true;
    }

    // Retrieve relevant knowledge chunks
    let contextStr = "";
    let sources = <any>[];

    if (useRAG) {
      sources = await retrieveRelevantChunks(message, 6);
      contextStr = formatContextForPrompt(sources);
    }

    const ownerName = process.env.NEXT_PUBLIC_OWNER_NAME || "Thanwanna Htun";
    const systemPrompt = buildSystemPrompt(ownerName, contextStr);
    const responseType = detectResponseType(message);

    // Build messages array for Ollama
    const ollamaMessages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10), // keep last 10 turns for context
      { role: "user", content: message },
    ];

    // Create streaming response
    const encoder = new TextEncoder();
    let streamController: ReadableStreamDefaultController<Uint8Array>;

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller;
      },
    });

    const sendEvent = (data: object) => {
      const line = `data: ${JSON.stringify(data)}\n\n`;
      streamController.enqueue(encoder.encode(line));
    };

    // Send sources first
    if (sources.length > 0) {
      sendEvent({ type: "sources", sources, responseType });
    }

    // Start streaming from Ollama
    streamOllamaChat({
      config: modelConfig,
      messages: ollamaMessages,
      onChunk: (chunk) => {
        sendEvent({ type: "chunk", content: chunk });
      },
      onDone: () => {
        sendEvent({ type: "done", responseType });
        streamController.close();
      },
      onError: (err) => {
        sendEvent({ type: "error", error: err.message });
        streamController.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
