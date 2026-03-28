"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Cloud, Monitor, Check } from "lucide-react";
import { AVAILABLE_MODELS, ModelConfig } from "@/types";
import { useChatStore } from "@/hooks/useChatStore";

export function ModelSelector() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { selectedModel, setModel } = useChatStore();

    const currentModel = AVAILABLE_MODELS.find((m) => m.name === selectedModel.model)
        || AVAILABLE_MODELS[0];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelect = (model: typeof AVAILABLE_MODELS[0]) => {
        const newConfig: ModelConfig = {
            // provider: model.provider,
            model: model.name,
            host:
                model.provider === "ollama-cloud"
                    ? process.env.NEXT_PUBLIC_OLLAMA_HOST || "https://ollama.com"
                    : process.env.NEXT_PUBLIC_OLLAMA_LOCAL_HOST || "http://localhost:11434",
            apiKey:
                model.provider === "ollama-cloud"
                    ? process.env.NEXT_PUBLIC_OLLAMA_API_KEY
                    : undefined,
            temperature: 0.7,
        };
        setModel(newConfig);
        setOpen(false);
    };

    const cloudModels = AVAILABLE_MODELS.filter((m) => m.provider === "ollama-cloud");
    const localModels = AVAILABLE_MODELS.filter((m) => m.provider === "ollama-local");

    return (
        <div className="model-selector" ref={ref}>
            <button
                className="selector-trigger"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="listbox"
            >
                <span className="model-provider-icon">
                    {currentModel.provider === "ollama-cloud" ? (
                        <Cloud size={11} />
                    ) : (
                        <Monitor size={11} />
                    )}
                </span>
                <span className="model-name font-mono">{currentModel.name}</span>
                <ChevronDown size={12} className={`chevron ${open ? "rotated" : ""}`} />
            </button>

            {open && (
                <div className="dropdown animate-scale-in" role="listbox">
                    {/* Cloud models */}
                    <div className="dropdown-group">
                        <div className="group-label">
                            <Cloud size={11} />
                            Ollama Cloud
                        </div>
                        {cloudModels.map((model) => (
                            <button
                                key={model.name}
                                className={`dropdown-item ${model.name === selectedModel.model ? "active" : ""}`}
                                onClick={() => handleSelect(model)}
                                role="option"
                                aria-selected={model.name === selectedModel.model}
                            >
                                <div className="item-left">
                                    <span className="item-label">{model.label}</span>
                                    <span className="item-desc font-mono">{model.description}</span>
                                </div>
                                {model.name === selectedModel.model && (
                                    <Check size={12} className="item-check" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="dropdown-sep" />

                    {/* Local models */}
                    <div className="dropdown-group">
                        <div className="group-label">
                            <Monitor size={11} />
                            Local Ollama
                        </div>
                        {localModels.map((model) => (
                            <button
                                key={model.name}
                                className={`dropdown-item ${model.name === selectedModel.model ? "active" : ""}`}
                                onClick={() => handleSelect(model)}
                                role="option"
                                aria-selected={model.name === selectedModel.model}
                            >
                                <div className="item-left">
                                    <span className="item-label">{model.label}</span>
                                    <span className="item-desc font-mono">{model.description}</span>
                                </div>
                                {model.name === selectedModel.model && (
                                    <Check size={12} className="item-check" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="dropdown-footer">
                        Local models require Ollama running at localhost:11434
                    </div>
                </div>
            )}

            <style jsx>{`
        .model-selector {
          position: relative;
        }
        .selector-trigger {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 11px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.78rem;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .selector-trigger:hover {
          border-color: rgba(37,99,235,0.3);
          color: var(--text-primary);
        }
        .model-provider-icon {
          color: var(--accent);
          display: flex;
        }
        .model-name {
          font-size: 0.73rem;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chevron {
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .chevron.rotated { transform: rotate(180deg); }
        .dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 280px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-lg);
          z-index: 200;
          overflow: hidden;
        }
        .dropdown-group {
          padding: 10px;
        }
        .group-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          padding: 4px 6px 8px;
        }
        .dropdown-sep {
          height: 1px;
          background: var(--border);
          margin: 0 10px;
        }
        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: background 0.1s;
          gap: 8px;
        }
        .dropdown-item:hover { background: var(--bg); }
        .dropdown-item.active {
          background: var(--accent-glow);
          color: var(--accent);
        }
        .item-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }
        .item-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dropdown-item.active .item-label { color: var(--accent); }
        .item-desc {
          font-size: 0.68rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .item-check { color: var(--accent); flex-shrink: 0; }
        .dropdown-footer {
          padding: 8px 16px 10px;
          font-size: 0.68rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border);
          font-family: 'DM Mono', monospace;
        }
      `}</style>
        </div>
    );
}