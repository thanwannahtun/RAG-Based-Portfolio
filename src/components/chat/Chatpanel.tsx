"use client";

import { useRef, useEffect } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import { WelcomeScreen } from "./Welcomescreen";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./Chatinput";

export function ChatPanel() {
    const { messages } = useChatStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const hasMessages = messages.length > 0;

    return (
        <div className="chat-panel">
            {/* ── Message Area ───────── */}
            <div className="messages-area" ref={scrollRef}>
                {!hasMessages ? (
                    <WelcomeScreen />
                ) : (
                    <div className="messages-list">
                        {messages.map((msg, i) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isLast={i === messages.length - 1}
                            />
                        ))}
                        {/* Bottom padding */}
                        <div style={{ height: "32px" }} />
                    </div>
                )}
            </div>

            {/* ── Input Bar ──────────── */}
            <div className="input-wrapper">
                <ChatInput />
            </div>

            <style jsx>{`
        .chat-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          position: relative;
        }
        .messages-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }
        .messages-list {
          max-width: 780px;
          margin: 0 auto;
          padding: 24px 24px 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-wrapper {
          flex-shrink: 0;
          border-top: 1px solid var(--border);
          background: var(--bg-2);
        }
        @media (max-width: 640px) {
          .messages-list { padding: 16px 12px 0; }
        }
      `}</style>
        </div>
    );
}