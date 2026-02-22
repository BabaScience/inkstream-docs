# Development Guide

Setup, build order, conventions, and how to contribute.

---

## Prerequisites

- **Node.js 20+** and **npm 10+**
- **Docker** and **Docker Compose** (PostgreSQL, Redis)
- **Optional:** Anthropic API key, ElevenLabs API key (for full experience)

---

## Setup

```bash
# 1. Copy environment config
cp .env.example .env

# 2. (Optional) Add API keys to .env
# ANTHROPIC_API_KEY=sk-ant-...
# ELEVENLABS_API_KEY=...

# 3. Start PostgreSQL + Redis
docker compose up -d

# 4. Install dependencies
npm run install:all

# 5. Run migrations
npm run db:migrate

# 6. Start dev servers
npm run dev
```

**One-liner:** `npm run setup && npm run dev`

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts backend + frontend concurrently |
| `npm run dev:backend` | Backend only (tsx watch) |
| `npm run dev:frontend` | Frontend only (Vite) |
| `npm run db:start` | `docker compose up -d` |
| `npm run db:stop` | `docker compose down` |
| `npm run db:migrate` | Run PostgreSQL migrations |
| `npm run build` | Build backend + frontend |
| `npm run setup` | Copy .env, install all, db:start, db:migrate |

---

## Project Layout

```
agentic-presenter/
├── packages/
│   ├── shared/           # Types shared by frontend + backend
│   │   └── types/presentation.ts
│   ├── backend/          # Node.js + Express + TypeScript
│   │   └── src/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── websocket/
│   │       └── db/
│   └── frontend/         # React 18 + Vite + Konva
│       └── src/
│           ├── components/
│           ├── hooks/
│           └── types/
├── docs/                 # Documentation
├── docker-compose.yml
├── .env.example
└── MISSION.md
```

---

## Build Order (from MISSION.md)

Recommended order when building from scratch or integrating new subsystems:

1. **Scaffolding** — monorepo, shared types, docker-compose
2. **Database** — migrations, postgres client, redis client
3. **Backend core** — Express, routes, health check
4. **Claude orchestrator** — system prompt, structured output, fallback plan
5. **TTS service** — ElevenLabs, cache, pre-warm
6. **Sync engine** — segment playback, timing, breakpoints
7. **WebSocket** — presentationSocket, message routing
8. **Frontend shell** — React app, TopicInput, useWebSocket
9. **PresentationCanvas** — Konva stage, node/arrow/label rendering
10. **Diagram animations** — fade, scale, drawProgress
11. **VoiceOrchestrator** — audio playback, browser TTS fallback
12. **usePresentationSync** — wire WS → audio + diagram (binding layer)
13. **BranchingUI** — breakpoint modal, countdown
14. **CognitiveHUD** — dev overlay
15. **EngagementCamera** — camera feed, stub signals
16. **End-to-end test** — full K8s demo flow

---

## Conventions

- **TypeScript strict mode** — both frontend and backend
- **Shared types** — `packages/shared/types/presentation.ts` is canonical; frontend re-exports
- **WebSocket protocol** — typed discriminated unions in shared types
- **Env vars** — all in `.env.example` with comments
- **Phase markers** — use `// TODO: Phase N` for out-of-scope work

---

## Optional: Whisper.cpp for STT

For low-latency speech-to-text (instead of Web Speech API):

1. **Build Whisper.cpp** with HTTP server support:
   ```bash
   git clone https://github.com/ggerganov/whisper.cpp
   cd whisper.cpp
   make server
   ./server -m models/ggml-base.en.bin --port 8178
   ```

2. **Set env:**
   ```
   WHISPER_ENDPOINT=http://localhost:8178/inference
   ```

3. **Note:** Backend `whisperService.ts` exists but voice input currently uses Web Speech API in the browser. Full Whisper integration is Phase 2.

---

## Debugging

- **Cognitive HUD:** Press `H` to toggle — shows live profile scores
- **Engagement signals:** Enable camera (bottom-right), check console for `[Engagement] Signal:`
- **WebSocket:** Check browser DevTools → Network → WS
- **Backend logs:** `[TTS]`, `[WS]`, `[DB]` prefixes

---

## Adding a New Component

1. Create component in `packages/frontend/src/components/`
2. Add types to `packages/shared/types/` if shared
3. Wire in `App.tsx` and pass props from `usePresentationSync` or `useWebSocket`
4. Document in ARCHITECTURE.md

---

## Adding a New Backend Service

1. Create in `packages/backend/src/services/`
2. Export from index or route
3. Add env vars to `.env.example` if needed
4. Document in ARCHITECTURE.md and API_REFERENCE.md
