# Development Setup

## Overview

Step-by-step guide to set up the Agentic Presenter development environment, run the app, and contribute.

## Pre-requisites

- **Node.js 20+** and **npm 10+**
- **Docker** and **Docker Compose** (PostgreSQL, Redis)
- **Optional:** Anthropic API key, ElevenLabs API key (for full experience)

## Steps

1. **Copy environment config**
   ```bash
   cp .env.example .env
   ```

2. **(Optional) Add API keys to `.env`**
   - `ANTHROPIC_API_KEY` — enables Claude-generated presentations
   - `ELEVENLABS_API_KEY` — enables high-quality voice narration
   - Without these keys: hardcoded K8s demo plan + browser TTS fallback

3. **Start PostgreSQL + Redis**
   ```bash
   docker compose up -d
   ```

4. **Install dependencies**
   ```bash
   npm run install:all
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```

**One-liner:** `npm run setup && npm run dev`

## Verification

- **Frontend:** Open `http://localhost:5173` — TopicInput screen appears
- **Backend:** `http://localhost:3001/health` returns `{ status: "ok" }`
- **WebSocket:** Connect to `ws://localhost:3001/ws` — connection succeeds
- **Full flow:** Type "Explain Kubernetes networking" → presentation starts, diagram builds, breakpoints appear

## Notes

### Scripts

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

### Project Layout

```
agentic-presenter/
├── packages/
│   ├── shared/           # Types shared by frontend + backend
│   ├── backend/           # Node.js + Express + TypeScript
│   └── frontend/          # React 18 + Vite + Konva
├── docs/                  # Documentation
├── docker-compose.yml
├── .env.example
└── MISSION.md
```

### Build Order (from MISSION.md)

1. Scaffolding — monorepo, shared types, docker-compose
2. Database — migrations, postgres client, redis client
3. Backend core — Express, routes, health check
4. Claude orchestrator — system prompt, structured output, fallback plan
5. TTS service — ElevenLabs, cache, pre-warm
6. Sync engine — segment playback, timing, breakpoints
7. WebSocket — presentationSocket, message routing
8. Frontend shell — React app, TopicInput, useWebSocket
9. PresentationCanvas — Konva stage, node/arrow/label rendering
10. Diagram animations — fade, scale, drawProgress
11. VoiceOrchestrator — audio playback, browser TTS fallback
12. usePresentationSync — wire WS → audio + diagram (binding layer)
13. BranchingUI — breakpoint modal, countdown
14. CognitiveHUD — dev overlay
15. EngagementCamera — camera feed, stub signals
16. End-to-end test — full K8s demo flow

### Optional: Whisper.cpp for STT

1. Build Whisper.cpp with HTTP server:
   ```bash
   git clone https://github.com/ggerganov/whisper.cpp
   cd whisper.cpp
   make server
   ./server -m models/ggml-base.en.bin --port 8178
   ```

2. Set env: `WHISPER_ENDPOINT=http://localhost:8178/inference`

3. Note: Backend `whisperService.ts` exists but voice input currently uses Web Speech API. Full Whisper integration is Phase 2.

### Debugging

- **Cognitive HUD:** Press `H` to toggle — shows live profile scores
- **Engagement signals:** Enable camera (bottom-right), check console for `[Engagement] Signal:`
- **WebSocket:** Browser DevTools → Network → WS
- **Backend logs:** `[TTS]`, `[WS]`, `[DB]`, `[Latency]` prefixes

### Latency Measurement

The system logs latency metrics to help validate MISSION.md targets:

- **Voice-to-visual:** <200ms from narration segment start to diagram step trigger
- **UI response:** <50ms
- **TTS initiation:** <500ms from user request

**Backend (terminal):** Look for `[Latency]` logs:
- `SEGMENT_START segment_id=X elapsed_ms=Y` — time to prepare and send segment (TTS + sync)
- `TTS segment_id=X elapsed_ms=Y` — ElevenLabs non-streaming: time to generate full audio
- `TTS first_chunk segment_id=X elapsed_ms=Y` — ElevenLabs streaming: time to first audio chunk

**Frontend (browser console):** Look for `[Latency] voice-to-visual` — time from message receipt to `playAudio` call.

To measure: run a presentation, filter logs by `[Latency]`, and compare against targets.

### Conventions

- TypeScript strict mode — both frontend and backend
- Shared types — `packages/shared/types/presentation.ts` is canonical
- WebSocket protocol — typed discriminated unions in shared types
- Env vars — all in `.env.example` with comments
- Phase markers — use `// TODO: Phase N` for out-of-scope work

### Adding a New Component

1. Create component in `packages/frontend/src/components/`
2. Add types to `packages/shared/types/` if shared
3. Wire in `App.tsx` and pass props from `usePresentationSync` or `useWebSocket`
4. Document in `docs/architecture/high-level.md`

### Adding a New Backend Service

1. Create in `packages/backend/src/services/`
2. Export from index or route
3. Add env vars to `.env.example` if needed
4. Document in `docs/architecture/high-level.md` and `docs/api/service-endpoints.md`
