"use client";

import { Menu, Cpu, Circle } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { OWNER_NAME } from "@/data/social";
import { ModelSelector } from "../chat/ModelSelector";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { isLoading } = useChatStore();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="brand">
          <div className="brand-icon">
            <Cpu size={14} strokeWidth={1.5} />
          </div>
          <span className="brand-name font-display">{OWNER_NAME}</span>
          <span className="brand-sep">/</span>
          <span className="brand-sub">AI Portfolio</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Status indicator */}
        <div className="status-badge">
          <Circle
            size={7}
            className={isLoading ? "status-dot thinking" : "status-dot online"}
            fill="currentColor"
          />
          <span>{isLoading ? "Thinking…" : "Online"}</span>
        </div>

        {/* Model selector */}
        <ModelSelector />
      </div>

      <style jsx>{`
        .topbar {
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          background: var(--bg-2);
          border-bottom: 1px solid var(--border);
          position: relative;
          z-index: 50;
          flex-shrink: 0;
        }
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s;
        }
        .menu-btn:hover {
          background: var(--bg);
          color: var(--text-primary);
          border-color: rgba(37,99,235,0.3);
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
        }
        .brand-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .brand-name {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-primary);
        }
        .brand-sep {
          color: var(--border);
          font-weight: 300;
        }
        .brand-sub {
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 400;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: var(--text-muted);
          padding: 4px 10px;
          border-radius: 999px;
          background: var(--bg);
          border: 1px solid var(--border);
        }
        .status-dot {
          flex-shrink: 0;
        }
        .status-dot.online {
          color: var(--green);
        }
        .status-dot.thinking {
          color: var(--accent);
          animation: pulse-dot 0.8s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @media (max-width: 640px) {
          .brand-sub { display: none; }
          .brand-sep { display: none; }
          .status-badge span { display: none; }
        }
      `}</style>
    </header>
  );
}