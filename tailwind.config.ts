import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    black: "#030712",
                    dark: "#0a0f1e",
                    card: "#0d1428",
                    border: "#1a2744",
                    blue: "#00d4ff",
                    cyan: "#00ffcc",
                    purple: "#7c3aed",
                    pink: "#ff0080",
                    green: "#00ff88",
                    yellow: "#ffcc00",
                    text: "#c8d8f0",
                    muted: "#4a6080",
                },
            },
            fontFamily: {
                mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
                display: ["'Orbitron'", "monospace"],
                body: ["'IBM Plex Sans'", "sans-serif"],
            },
            animation: {
                "scan-line": "scanLine 4s linear infinite",
                "pulse-glow": "pulseGlow 2s ease-in-out infinite",
                "type-cursor": "typeCursor 1s step-end infinite",
                "grid-move": "gridMove 20s linear infinite",
                "float": "float 6s ease-in-out infinite",
                "shimmer": "shimmer 2s linear infinite",
                "glitch": "glitch 3s infinite",
            },
            keyframes: {
                scanLine: {
                    "0%": { top: "-5%" },
                    "100%": { top: "105%" },
                },
                pulseGlow: {
                    "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(0, 212, 255, 0.4)" },
                    "50%": { opacity: "0.7", boxShadow: "0 0 40px rgba(0, 212, 255, 0.8)" },
                },
                typeCursor: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0" },
                },
                gridMove: {
                    "0%": { backgroundPosition: "0 0" },
                    "100%": { backgroundPosition: "60px 60px" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-12px)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                glitch: {
                    "0%, 90%, 100%": { transform: "translate(0)" },
                    "92%": { transform: "translate(-2px, 1px)" },
                    "94%": { transform: "translate(2px, -1px)" },
                    "96%": { transform: "translate(-1px, 2px)" },
                },
            },
            backgroundImage: {
                "cyber-grid": `linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px)`,
                "cyber-gradient": "linear-gradient(135deg, #030712 0%, #0a0f1e 50%, #0d1a2e 100%)",
                "glow-blue": "radial-gradient(ellipse at center, rgba(0, 212, 255, 0.15) 0%, transparent 70%)",
                "glow-cyan": "radial-gradient(ellipse at center, rgba(0, 255, 204, 0.1) 0%, transparent 70%)",
            },
        },
    },
    plugins: [],
};

export default config;