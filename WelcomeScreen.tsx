"use client";

import { SUGGESTED_PROMPTS } from "@/types";
import { OWNER_NAME, OWNER_TITLE } from "@/data/social";
import { useSendMessage } from "@/hooks/useChatStore";
import { Sparkles, ArrowRight } from "lucide-react";

export function WelcomeScreen() {
  const { sendMessage } = useSendMessage();

  return (
    <div className="welcome">
      {/* ── Decorative Background ── */}
      <div className="bg-dots" aria-hidden="true" />
      <div className="bg-glow-1" aria-hidden="true" />
      <div className="bg-glow-2" aria-hidden="true" />

      {/* ── Hero ───────────────── */}
      <div className="hero animate-fade-up">
        <div className="hero-badge">
          <Sparkles size={12} />
          <span>AI-Powered Portfolio</span>
        </div>

        <div className="avatar-hero animate-float">
          <div className="avatar-inner font-display">
            {OWNER_NAME.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="avatar-glow" />
        </div>

        <h1 className="hero-name font-display">{OWNER_NAME}</h1>
        <p className="hero-title">{OWNER_TITLE}</p>

        <p className="hero-desc">
          Ask me anything — skills, projects, availability, or just say hello.
          <br />
          I&apos;m powered by{" "}
          <span className="inline-badge">Ollama</span> +{" "}
          <span className="inline-badge">RAG</span> and know everything about {OWNER_NAME.split(" ")[0]}.
        </p>

        {/* Divider */}
        <div className="section-divider">
          <span>Try a prompt</span>
        </div>
      </div>

      {/* ── Suggested Prompts ──── */}
      <div className="prompts-grid animate-fade-up stagger-2">
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            className="prompt-card"
            onClick={() => sendMessage(prompt.text)}
          >
            <span className="prompt-icon">{prompt.icon}</span>
            <span className="prompt-text">{prompt.text}</span>
            <ArrowRight size={13} className="prompt-arrow" />
          </button>
        ))}
      </div>

      {/* ── Footer hint ────────── */}
      <p className="hint animate-fade-in stagger-4 font-mono">
        ↑ click a prompt or type your own question below
      </p>

      <style jsx>{`
        .welcome {
          position: relative;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 48px 24px 32px;
          overflow: hidden;
        }
        .bg-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(37,99,235,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .bg-glow-1 {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .bg-glow-2 {
          position: absolute;
          bottom: 0;
          right: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 65%);
          pointer-events: none;
        }
        .hero {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 560px;
          width: 100%;
          gap: 12px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--accent);
          background: rgba(37,99,235,0.07);
          border: 1px solid rgba(37,99,235,0.18);
          padding: 5px 12px;
          border-radius: 999px;
        }
        .avatar-hero {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 4px 0;
        }
        .avatar-inner {
          width: 80px;
          height: 80px;
          border-radius: 22px;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.03em;
          position: relative;
          z-index: 1;
        }
        .avatar-glow {
          position: absolute;
          inset: -6px;
          border-radius: 26px;
          background: linear-gradient(135deg, rgba(37,99,235,0.25), rgba(124,58,237,0.25));
          filter: blur(12px);
          z-index: 0;
        }
        .hero-name {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin-top: 4px;
        }
        .hero-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: 0.01em;
        }
        .hero-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-top: 4px;
        }
        .inline-badge {
          display: inline-block;
          font-family: 'DM Mono', monospace;
          font-size: 0.78em;
          background: rgba(37,99,235,0.07);
          color: var(--accent);
          border: 1px solid rgba(37,99,235,0.15);
          padding: 0.1em 0.45em;
          border-radius: 5px;
        }
        .section-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          margin: 8px 0 0;
        }
        .section-divider::before,
        .section-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .section-divider span {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }
        .prompts-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          width: 100%;
          max-width: 660px;
          margin-top: 4px;
        }
        .prompt-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          cursor: pointer;
          text-align: left;
          transition: all 0.18s;
          box-shadow: var(--shadow-sm);
        }
        .prompt-card:hover {
          background: var(--bg-card-hover);
          border-color: rgba(37,99,235,0.3);
          box-shadow: var(--shadow-glow);
          transform: translateY(-2px);
        }
        .prompt-icon {
          font-size: 1rem;
          flex-shrink: 0;
          line-height: 1.4;
        }
        .prompt-text {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.45;
          flex: 1;
          font-weight: 400;
        }
        .prompt-card:hover .prompt-text { color: var(--text-primary); }
        .prompt-arrow {
          color: var(--text-muted);
          flex-shrink: 0;
          margin-top: 2px;
          opacity: 0;
          transition: opacity 0.15s, transform 0.15s;
        }
        .prompt-card:hover .prompt-arrow {
          opacity: 1;
          transform: translateX(2px);
          color: var(--accent);
        }
        .hint {
          position: relative;
          z-index: 1;
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 20px;
          letter-spacing: 0.02em;
        }
        @media (max-width: 540px) {
          .welcome { padding: 32px 16px 24px; }
          .hero-name { font-size: 1.7rem; }
          .prompts-grid { grid-template-columns: 1fr; }
          .avatar-hero, .avatar-inner { width: 66px; height: 66px; border-radius: 18px; }
          .avatar-inner { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}
