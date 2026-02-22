# Agentic Presenter — Documentation

> Documentation hub for the Multimodal AI Presentation System. Use these docs to understand, maintain, and extend the project.

---

## Documentation Index

| Document | Purpose |
|----------|---------|
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | System design, data flow, sync engine, and component responsibilities |
| [**MISSING_FEATURES.md**](./MISSING_FEATURES.md) | **Gaps from MISSION.md** — implemented vs. planned features, Phase 2+ roadmap |
| [**DEVELOPMENT.md**](./DEVELOPMENT.md) | Dev setup, build order, conventions, and contributing |
| [**API_REFERENCE.md**](./API_REFERENCE.md) | REST endpoints, WebSocket protocol, and message types |

---

## Quick Links

- **MISSION.md** (project root) — Original product vision and technical spec
- **README.md** (project root) — Quick start and user-facing overview

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

See [MISSING_FEATURES.md](./MISSING_FEATURES.md) for full details.
