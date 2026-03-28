"use client";

import { useEffect } from "react";
import { X, Github, Linkedin, Facebook, Globe, Database, Trash2, BookOpen, Zap } from "lucide-react";
import { SOCIAL_LINKS, OWNER_NAME, OWNER_TITLE, OWNER_TAGLINE } from "@/data/social";
import { useChatStore } from "@/hooks/useChatStore";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  github: <Github size={15} />,
  linkedin: <Linkedin size={15} />,
  facebook: <Facebook size={15} />,
  globe: <Globe size={15} />,
};

const KNOWLEDGE_FILES = [
  { label: "About Me", file: "about.md", emoji: "👤" },
  { label: "Skills", file: "skills.md", emoji: "⚡" },
  { label: "Projects", file: "projects.md", emoji: "🚀" },
  { label: "Experience", file: "experience.md", emoji: "📋" },
  { label: "Availability", file: "availability.md", emoji: "💼" },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { isRAGEnabled, toggleRAG, clearMessages, messages } = useChatStore();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* ── Header ───────────────── */}
        <div className="sidebar-header">
          <div className="avatar-wrapper animate-float">
            <div className="avatar">
              <span className="avatar-initials font-display">
                {OWNER_NAME.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
              <div className="avatar-ring" />
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close sidebar">
            <X size={16} />
          </button>
        </div>

        {/* ── Identity ─────────────── */}
        <div className="identity">
          <h2 className="identity-name font-display">{OWNER_NAME}</h2>
          <p className="identity-title">{OWNER_TITLE}</p>
          <p className="identity-tagline">{OWNER_TAGLINE}</p>
          <div className="available-badge">
            <span className="avail-dot" />
            Open to opportunities
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* ── Knowledge Base ────────── */}
        <div className="sidebar-section">
          <div className="section-label">
            <Database size={12} />
            <span>Knowledge Base</span>
            <span className={`rag-badge ${isRAGEnabled ? "on" : "off"}`}>
              {isRAGEnabled ? "RAG ON" : "RAG OFF"}
            </span>
          </div>
          <div className="knowledge-list">
            {KNOWLEDGE_FILES.map((kf) => (
              <div key={kf.file} className="knowledge-item">
                <span className="knowledge-emoji">{kf.emoji}</span>
                <div className="knowledge-meta">
                  <span className="knowledge-label">{kf.label}</span>
                  <span className="knowledge-file font-mono">{kf.file}</span>
                </div>
                <div className="knowledge-dot indexed" title="Indexed" />
              </div>
            ))}
          </div>

          <button
            className={`rag-toggle ${isRAGEnabled ? "active" : ""}`}
            onClick={toggleRAG}
          >
            <Zap size={13} />
            {isRAGEnabled ? "Disable RAG" : "Enable RAG"}
          </button>
        </div>

        <div className="sidebar-divider" />

        {/* ── Social Links ──────────── */}
        <div className="sidebar-section">
          <div className="section-label">
            <Globe size={12} />
            <span>Connect</span>
          </div>
          <div className="social-list">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <span className="social-icon">{ICON_MAP[link.icon]}</span>
                <div className="social-meta">
                  <span className="social-name">{link.name}</span>
                  <span className="social-username font-mono">{link.username}</span>
                </div>
                <Globe size={11} className="social-external" />
              </a>
            ))}
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* ── Actions ──────────────── */}
        <div className="sidebar-section">
          <div className="section-label">
            <BookOpen size={12} />
            <span>Session</span>
          </div>
          <div className="session-info">
            <span>{messages.length} messages</span>
          </div>
          {messages.length > 0 && (
            <button className="clear-btn" onClick={clearMessages}>
              <Trash2 size={13} />
              Clear conversation
            </button>
          )}
        </div>

        {/* ── Footer ───────────────── */}
        <div className="sidebar-footer">
          <p className="footer-note font-mono">
            Powered by Ollama + RAG
          </p>
        </div>
      </aside>

      <style jsx>{`
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(4px);
          z-index: 40;
        }
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 300px;
          background: var(--bg-2);
          border-right: 1px solid var(--border);
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .sidebar.open {
          transform: translateX(0);
          box-shadow: var(--shadow-lg);
        }
        .sidebar-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 24px 20px 16px;
          flex-shrink: 0;
        }
        .avatar-wrapper {
          display: inline-block;
        }
        .avatar {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-initials {
          color: white;
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .avatar-ring {
          position: absolute;
          inset: -3px;
          border-radius: 20px;
          border: 1.5px solid rgba(37,99,235,0.25);
        }
        .close-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .close-btn:hover {
          background: var(--bg);
          color: var(--text-primary);
        }
        .identity {
          padding: 0 20px 20px;
          flex-shrink: 0;
        }
        .identity-name {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .identity-title {
          font-size: 0.8rem;
          color: var(--accent);
          font-weight: 500;
          margin-top: 3px;
        }
        .identity-tagline {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 6px;
          line-height: 1.5;
        }
        .available-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--green);
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2);
          padding: 4px 10px;
          border-radius: 999px;
        }
        .avail-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--green);
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        .sidebar-divider {
          height: 1px;
          background: var(--border);
          margin: 0 20px;
          flex-shrink: 0;
        }
        .sidebar-section {
          padding: 16px 20px;
          flex-shrink: 0;
        }
        .section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .rag-badge {
          margin-left: auto;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 999px;
        }
        .rag-badge.on {
          background: rgba(37,99,235,0.1);
          color: var(--accent);
          border: 1px solid rgba(37,99,235,0.2);
        }
        .rag-badge.off {
          background: var(--bg);
          color: var(--text-muted);
          border: 1px solid var(--border);
        }
        .knowledge-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 10px;
        }
        .knowledge-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          background: var(--bg);
          border-radius: 9px;
          border: 1px solid var(--border);
        }
        .knowledge-emoji { font-size: 0.85rem; }
        .knowledge-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .knowledge-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        .knowledge-file {
          font-size: 0.68rem;
          color: var(--text-muted);
        }
        .knowledge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .knowledge-dot.indexed {
          background: var(--green);
          box-shadow: 0 0 0 2px rgba(16,185,129,0.15);
        }
        .rag-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 7px;
          justify-content: center;
          padding: 8px;
          border-radius: 9px;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          margin-top: 4px;
        }
        .rag-toggle.active {
          background: rgba(37,99,235,0.07);
          border-color: rgba(37,99,235,0.25);
          color: var(--accent);
        }
        .rag-toggle:hover {
          background: var(--bg);
        }
        .social-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .social-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 11px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: transparent;
          text-decoration: none;
          transition: all 0.15s;
          color: var(--text-primary);
        }
        .social-link:hover {
          background: var(--accent-glow);
          border-color: rgba(37,99,235,0.3);
          color: var(--accent);
        }
        .social-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          transition: all 0.15s;
        }
        .social-link:hover .social-icon {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
        .social-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .social-name {
          font-size: 0.8rem;
          font-weight: 500;
        }
        .social-username {
          font-size: 0.68rem;
          color: var(--text-muted);
        }
        .social-external {
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.15s;
          flex-shrink: 0;
        }
        .social-link:hover .social-external { opacity: 1; }
        .session-info {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .clear-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border-radius: 9px;
          font-size: 0.78rem;
          font-weight: 500;
          color: #ef4444;
          background: rgba(239,68,68,0.05);
          border: 1px solid rgba(239,68,68,0.15);
          cursor: pointer;
          transition: all 0.15s;
          width: 100%;
          justify-content: center;
        }
        .clear-btn:hover {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.3);
        }
        .sidebar-footer {
          margin-top: auto;
          padding: 16px 20px;
          border-top: 1px solid var(--border);
        }
        .footer-note {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
          letter-spacing: 0.02em;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      {/* </aside > */}

    </>);
}