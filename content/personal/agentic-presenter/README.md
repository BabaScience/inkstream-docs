# Agentic Presenter — Documentation

> Documentation hub for the Multimodal AI Presentation System. Use these docs to understand, maintain, and extend the project.

**Structure:** Follows `docs/AGENTS.md` (InkStreamCLI + folder layout). See `.cursor/rules/documentation.mdc` for conventions.

---

## Documentation Index

### Architecture (`docs/architecture/`)

| Document | Purpose |
|----------|---------|
| [**high-level.md**](./architecture/high-level.md) | System design, components, data flow, sync engine, trade-offs |
| [**diagram-visuals.md**](./architecture/diagram-visuals.md) | How diagram visuals work — data model, agent selection, pipeline, Konva rendering |
| [**missing-features.md**](./architecture/missing-features.md) | **Gaps from MISSION.md** — implemented vs. planned, Phase 2+ roadmap |

### Workflows (`docs/workflows/`)

| Document | Purpose |
|----------|---------|
| [**dev-setup.md**](./workflows/dev-setup.md) | Dev setup, build order, conventions, debugging |

### API (`docs/api/`)

| Document | Purpose |
|----------|---------|
| [**service-endpoints.md**](./api/service-endpoints.md) | REST endpoints, WebSocket protocol, message types |

### Notes (`docs/notes/`)

Exploratory notes, design spikes, investigations.

### Decisions (`docs/decisions/`)

Architecture decision records (ADR style). Format: `YYYY-MM-DD-short-title.md`.

---

## Quick Links

- **MISSION.md** (project root) — Original product vision and technical spec
- **README.md** (project root) — Quick start and user-facing overview
- **AGENTS.md** — InkStreamCLI rules and docs folder structure

---

## Project Status at a Glance

| Area | Status |
|------|--------|
| Core presentation flow | ✅ Working |
| Claude orchestration | ✅ Working (fallback plan when no API key) |
| ElevenLabs TTS | ✅ Working (browser TTS fallback) |
| Konva.js diagram sync | ✅ Working |
| Breakpoints & branching | ✅ Working |
| Cognitive profile | ✅ Working |
| MediaPipe FaceMesh | ⚠️ Stub only (Phase 3) |
| D3.js diagram generation | ❌ Not used (Konva only) |
| Whisper.cpp STT | ⚠️ Stubbed (Web Speech API fallback) |
| OpenVoice TTS | ⚠️ Stubbed (Phase 2) |

See [missing-features.md](./architecture/missing-features.md) for full details.
