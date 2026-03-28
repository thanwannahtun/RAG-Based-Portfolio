"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Database, DatabaseZap } from "lucide-react";
import { useChatStore, useSendMessage } from "@/hooks/useChatStore";

export function ChatInput() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading, isRAGEnabled, toggleRAG } = useChatStore();
  const { sendMessage } = useSendMessage();

  const canSubmit = input.trim().length > 0 && !isLoading;

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-bar">
      <div className="input-container">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className="input-field"
          placeholder="Ask about skills, projects, availability…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
          aria-label="Chat input"
        />

        {/* Actions */}
        <div className="input-actions">
          {/* RAG toggle */}
          <button
            className={`rag-btn ${isRAGEnabled ? "active" : ""}`}
            onClick={toggleRAG}
            title={isRAGEnabled ? "RAG enabled — AI reads knowledge files" : "RAG disabled — general mode"}
            aria-pressed={isRAGEnabled}
          >
            {isRAGEnabled ? <DatabaseZap size={15} /> : <Database size={15} />}
          </button>

          {/* Send */}
          <button
            className={`send-btn ${canSubmit ? "ready" : ""}`}
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="input-footer">
        <span className="footer-hint font-mono">
          {isRAGEnabled ? "⚡ RAG enabled" : "○ RAG off"} · Enter to send · Shift+Enter for newline
        </span>
        {input.length > 0 && (
          <span className="char-count font-mono">{input.length}</span>
        )}
      </div>

      <style jsx>{`
        .chat-input-bar {
          padding: 16px 20px 12px;
          max-width: 780px;
          margin: 0 auto;
          width: 100%;
        }
        .input-container {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 10px 12px;
          box-shadow: var(--shadow-sm);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-container:focus-within {
          border-color: rgba(37,99,235,0.4);
          box-shadow: var(--shadow-glow);
        }
        .input-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.9rem;
          color: var(--text-primary);
          line-height: 1.55;
          min-height: 22px;
          max-height: 160px;
          overflow-y: auto;
        }
        .input-field::placeholder {
          color: var(--text-muted);
        }
        .input-field:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .input-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .rag-btn {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .rag-btn:hover {
          background: var(--bg);
          color: var(--text-primary);
        }
        .rag-btn.active {
          background: rgba(37,99,235,0.08);
          border-color: rgba(37,99,235,0.3);
          color: var(--accent);
        }
        .send-btn {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          border: none;
          background: var(--border);
          color: var(--text-muted);
          cursor: not-allowed;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.18s;
          flex-shrink: 0;
        }
        .send-btn.ready {
          background: var(--accent);
          color: white;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(37,99,235,0.35);
        }
        .send-btn.ready:hover {
          background: #1d4ed8;
          transform: scale(1.05);
        }
        .send-btn.ready:active { transform: scale(0.97); }
        .input-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
          padding: 0 4px;
        }
        .footer-hint {
          font-size: 0.68rem;
          color: var(--text-muted);
          letter-spacing: 0.01em;
        }
        .char-count {
          font-size: 0.68rem;
          color: var(--text-muted);
        }
        @media (max-width: 640px) {
          .chat-input-bar { padding: 12px 12px 10px; }
          .footer-hint { display: none; }
        }
      `}</style>
    </div>
  );
}