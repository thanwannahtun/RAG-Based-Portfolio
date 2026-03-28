"use client";

import { useState } from "react";
import { TopBar } from "./TopBar";
import { ChatPanel } from "../chat/Chatpanel";
import { Sidebar } from "./Sidebar";

export function PortfolioShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="portfolio-shell" >
      {/* ── Top Navigation Bar ─────────────── */}
      < TopBar onMenuClick={() => setSidebarOpen((v) => !v)
      } />

      < div className="shell-body" >
        {/* ── Left Sidebar ───────────────────── */}
        < Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* ── Main Chat Area ─────────────────── */}
        <main className="shell-main" >
          <ChatPanel />
        </main>
      </div>

      < style jsx > {`
        .portfolio-shell {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          height: 100vh;
          overflow: hidden;
          background: var(--bg);
        }
        .shell-body {
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        .shell-main {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}