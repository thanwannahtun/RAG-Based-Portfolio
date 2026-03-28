# 🤖 AI Portfolio — Fullstack Developer

A clean, futuristic AI-powered portfolio website. Hiring teams, developers, and visitors can ask an AI **anything** about you. The AI reads your knowledge files using **RAG (Retrieval Augmented Generation)** and answers with full context.

Built with **Next.js 15**, **React 19**, **TypeScript**, **Ollama Cloud + Local**, and a custom **TF-IDF RAG engine**.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 AI Chat | Streaming chat powered by Ollama (cloud or local) |
| 📚 RAG System | TF-IDF vector search over your markdown knowledge files |
| 🎯 Smart Routing | Detects question type (skills / projects / availability / etc.) |
| 🌊 Streaming | Real-time token streaming with SSE |
| 🔄 Model Switching | Cloud models (gpt-oss:120b, llama3.3:70b) + local Ollama |
| 💡 Suggested Prompts | 10 pre-built prompts for hiring teams |
| 🔗 Social Links | GitHub, LinkedIn, Facebook, Portfolio |
| 📱 Responsive | Mobile-first, works on all screens |

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Required: Your Ollama Cloud API key
OLLAMA_API_KEY=your_key_here
OLLAMA_HOST=https://ollama.com
OLLAMA_MODEL=gpt-oss:120b

# Optional: Local Ollama (run `ollama serve` locally)
# OLLAMA_LOCAL_HOST=http://localhost:11434

# Your info (shown in the UI)
NEXT_PUBLIC_OWNER_NAME="Your Full Name"
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourusername
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/in/yourusername
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/yourusername
NEXT_PUBLIC_PORTFOLIO_URL=https://yoursite.com
```

### 3. Fill Your Knowledge Files

Edit the files in `public/knowledge/` with **your real information**:

```
public/knowledge/
  about.md         ← Personal info, personality, fun facts
  skills.md        ← Tech stack, frameworks, tools
  projects.md      ← Projects you've built
  experience.md    ← Work history, education, certifications
  availability.md  ← Hiring info, preferences, contact
```

The RAG engine automatically indexes all `.md` and `.txt` files in this folder. **You can add more files** — they'll be picked up automatically.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
  app/
    api/
      chat/route.ts        ← Streaming chat API with RAG
      models/route.ts      ← Available models endpoint
    page.tsx               ← Root page
    layout.tsx             ← App layout + fonts
    globals.css            ← Global styles + theme variables

  components/
    layout/
      PortfolioShell.tsx   ← Main layout shell
      TopBar.tsx           ← Navigation bar
      Sidebar.tsx          ← Profile, social links, settings
    chat/
      ChatPanel.tsx        ← Chat container + scroll
      WelcomeScreen.tsx    ← Landing with suggested prompts
      MessageBubble.tsx    ← Message rendering (markdown, sources)
      ChatInput.tsx        ← Input bar with RAG toggle
      ModelSelector.tsx    ← Dropdown model switcher

  lib/
    rag/engine.ts          ← TF-IDF RAG: load → chunk → index → retrieve
    ollama/client.ts       ← Ollama streaming client (cloud + local)

  hooks/
    useChatStore.ts        ← Zustand store + useSendMessage hook

  types/index.ts           ← All TypeScript types + model configs
  data/social.ts           ← Social links + owner info

public/
  knowledge/               ← YOUR INFO GOES HERE (markdown files)
```

---

## 🧠 How RAG Works

1. **On first request**: The server reads all files in `public/knowledge/`
2. **Chunking**: Splits markdown by sections (##, ###), then by size
3. **Indexing**: Builds a TF-IDF index (lightweight, no external vector DB needed)
4. **Retrieval**: On each user message, finds the top 5-6 most relevant chunks using cosine similarity
5. **Augmentation**: Injects retrieved context into the system prompt
6. **Generation**: Ollama streams the response token by token
7. **Sources**: The UI shows which knowledge files were used (with similarity scores)

### Upgrading to pgvector / Qdrant

The RAG engine is designed for easy swap-out. Replace `retrieveRelevantChunks()` in `src/lib/rag/engine.ts` with your preferred vector store client — the rest of the pipeline stays the same.

---

## 🤖 Adding Models

Edit `src/types/index.ts` → `AVAILABLE_MODELS` array:

```typescript
{
  name: "your-model-name",
  provider: "ollama-cloud", // or "ollama-local"
  label: "Display Name",
  description: "Short description",
  contextWindow: 128000,
  supportsStreaming: true,
}
```

---

## 📝 Adding Knowledge Files

Just drop any `.md` or `.txt` file into `public/knowledge/`. The RAG engine auto-discovers all files at startup.

Recommended structure for each file:
- Use `##` headers to separate sections
- Keep sections focused on one topic
- The more specific and detailed, the better the AI answers

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard. The streaming API route uses Node.js runtime (configured in `route.ts`).

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## ⚙️ Tech Stack

- **Next.js 15.1.6** with App Router
- **React 19.0.0**
- **TypeScript 5.7**
- **Ollama SDK** for LLM streaming
- **Zustand 5** for state management
- **React Markdown** + remark-gfm for message rendering
- **Tailwind CSS 3** for styling
- **Framer Motion** (optional, for enhanced animations)
- **DM Mono + Space Grotesk + Syne** fonts

---

## 📄 License

MIT — use freely for your personal portfolio.
