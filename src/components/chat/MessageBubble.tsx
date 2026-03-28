"use client";

import { ChatMessage, ResponseType, KnowledgeChunk } from "@/types";
import { OWNER_NAME } from "@/data/social";
import { User, Cpu, ChevronDown, ChevronUp, Database } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
    message: ChatMessage;
    isLast: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
    const isUser = message.role === "user";
    const isAssistant = message.role === "assistant";
    const [showSources, setShowSources] = useState(false);
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 30);
        return () => clearTimeout(timer);
    }, []);

    const hasSources = message.sources && message.sources.length > 0;

    if (isUser) {
        return (
            <div
                ref={ref}
                className={`msg-row user ${visible ? "visible" : ""}`}
            >
                <div className="user-bubble">
                    <p className="user-text">{message.content}</p>
                </div>
                <div className="user-avatar">
                    <User size={14} />
                </div>

                <style jsx>{`
          .msg-row {
            display: flex;
            gap: 10px;
            align-items: flex-end;
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 0.25s ease, transform 0.25s ease;
          }
          .msg-row.visible { opacity: 1; transform: translateY(0); }
          .msg-row.user { justify-content: flex-end; }
          .user-bubble {
            max-width: 68%;
            background: var(--accent);
            color: white;
            padding: 12px 16px;
            border-radius: 18px 18px 4px 18px;
            box-shadow: 0 2px 12px rgba(37,99,235,0.25);
          }
          .user-text {
            font-size: 0.9rem;
            line-height: 1.55;
            white-space: pre-wrap;
          }
          .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 10px;
            background: var(--bg);
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            flex-shrink: 0;
          }
        `}</style>
            </div>
        );
    }

    if (isAssistant) {
        return (
            <div
                ref={ref}
                className={`msg-row assistant ${visible ? "visible" : ""}`}
            >
                {/* Avatar */}
                <div className="ai-avatar">
                    <Cpu size={14} strokeWidth={1.5} />
                </div>

                <div className="ai-body">
                    {/* Header */}
                    <div className="ai-header">
                        <span className="ai-name font-mono">{OWNER_NAME.split(" ")[0]}.ai</span>
                        {message.responseType && (
                            <ResponseTypeBadge type={message.responseType} />
                        )}
                        {message.isStreaming && <StreamingIndicator />}
                    </div>

                    {/* Content */}
                    <div className="ai-content-wrapper">
                        {message.content ? (
                            <div className="prose-ai">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {message.content}
                                </ReactMarkdown>
                                {message.isStreaming && (
                                    <span className="cursor animate-blink">▋</span>
                                )}
                            </div>
                        ) : (
                            <ThinkingIndicator />
                        )}
                    </div>

                    {/* Sources */}
                    {hasSources && !message.isStreaming && (
                        <div className="sources-section">
                            <button
                                className="sources-toggle"
                                onClick={() => setShowSources((v) => !v)}
                            >
                                <Database size={11} />
                                <span>{message.sources!.length} knowledge sources used</span>
                                {showSources ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            </button>

                            {showSources && (
                                <div className="sources-list">
                                    {message.sources!.map((src, i) => (
                                        <SourceChip key={i} chunk={src} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <style jsx>{`
          .msg-row {
            display: flex;
            gap: 10px;
            align-items: flex-start;
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 0.25s ease, transform 0.25s ease;
          }
          .msg-row.visible { opacity: 1; transform: translateY(0); }
          .msg-row.assistant { justify-content: flex-start; }
          .ai-avatar {
            width: 32px;
            height: 32px;
            border-radius: 10px;
            background: linear-gradient(135deg, var(--accent), var(--accent-2));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
            margin-top: 2px;
            box-shadow: 0 2px 8px rgba(37,99,235,0.25);
          }
          .ai-body {
            flex: 1;
            min-width: 0;
            max-width: 85%;
          }
          .ai-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
          }
          .ai-name {
            font-size: 0.72rem;
            font-weight: 500;
            color: var(--accent);
          }
          .ai-content-wrapper {
            background: var(--bg-2);
            border: 1px solid var(--border);
            border-radius: 4px 18px 18px 18px;
            padding: 16px 18px;
            box-shadow: var(--shadow-sm);
          }
          .cursor {
            display: inline-block;
            color: var(--accent);
            font-size: 0.9rem;
            margin-left: 2px;
            vertical-align: text-bottom;
          }
          .sources-section {
            margin-top: 8px;
          }
          .sources-toggle {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.72rem;
            color: var(--text-muted);
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px 0;
            transition: color 0.15s;
          }
          .sources-toggle:hover { color: var(--accent); }
          .sources-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 6px;
          }
        `}</style>
            </div>
        );
    }

    return null;
}

// ─── Sub-components ───────────────────────────

function ResponseTypeBadge({ type }: { type: ResponseType }) {
    const map: Record<ResponseType, { label: string; color: string }> = {
        skills: { label: "Skills", color: "#7c3aed" },
        projects: { label: "Projects", color: "#0891b2" },
        experience: { label: "Experience", color: "#b45309" },
        availability: { label: "Availability", color: "#059669" },
        contact: { label: "Contact", color: "#db2777" },
        about: { label: "About", color: "#2563eb" },
        general: { label: "General", color: "#64748b" },
        code: { label: "Code", color: "#1d4ed8" },
    };

    const info = map[type] || map.general;

    return (
        <span
            style={{
                fontSize: "0.66rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: info.color,
                background: `${info.color}12`,
                border: `1px solid ${info.color}25`,
                padding: "2px 7px",
                borderRadius: "999px",
            }}
        >
            {info.label}
        </span>
    );
}

function StreamingIndicator() {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                marginLeft: "4px",
            }}
        >
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: "var(--accent)",
                        animation: `bounce-dot 1s ease-in-out ${i * 0.15}s infinite`,
                    }}
                />
            ))}
            <style jsx global>{`
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
}

function ThinkingIndicator() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 0" }}>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "var(--accent)",
                        animation: `bounce-dot 1s ease-in-out ${i * 0.2}s infinite`,
                    }}
                />
            ))}
        </div>
    );
}

function SourceChip({ chunk }: { chunk: KnowledgeChunk }) {
    return (
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.68rem",
                color: "var(--text-muted)",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                padding: "3px 9px",
                borderRadius: "999px",
                fontFamily: "'DM Mono', monospace",
            }}
        >
            <span style={{ color: "var(--accent)", fontSize: "0.65rem" }}>
                {chunk.metadata.category}
            </span>
            <span>·</span>
            <span>{chunk.metadata.source}</span>
            {chunk.score !== undefined && (
                <>
                    <span>·</span>
                    <span style={{ color: "var(--green)" }}>
                        {Math.round(chunk.score * 100)}%
                    </span>
                </>
            )}
        </div>
    );
}