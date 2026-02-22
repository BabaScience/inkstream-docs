# High-Level Architecture

## Overview

System design for the Agentic Presentation System — a multimodal AI presentation app where Claude acts as a cognitive architect, delivering synchronized voice narration with progressively-built Konva.js diagrams tailored to each learner's cognitive profile.

For a deeper dive into how diagram visuals (illustrations) work — data model, agent selection, pipeline, and rendering — see [diagram-visuals.md](./diagram-visuals.md).

## Components

### Frontend (`packages/frontend/`)

| Component | Path | Responsibility |
|-----------|------|----------------|
| TopicInput | `components/TopicInput/` | Text/voice input, submit topic, connection status |
| useWebSocket | `hooks/useWebSocket.ts` | WebSocket connection, reconnect, send/receive |
| usePresentationSync | `hooks/usePresentationSync.ts` | Core sync: maps WS messages → audio playback + diagram steps. Anchors diagram timing to `audio.currentTime` |
| PresentationCanvas | `components/PresentationCanvas/` | Konva.js stage, renders nodes/arrows/labels with fade/scale/draw animations |
| VoiceOrchestrator | `components/VoiceOrchestrator/` | Pause, resume, replay controls |
| BranchingUI | `components/BranchingUI/` | Breakpoint modal, countdown ring, depth choice buttons |
| CognitiveHUD | `components/CognitiveHUD/` | Dev overlay: live profile scores, segment index |
| EngagementCamera | `components/EngagementCamera/` | Camera feed + stub signal logger (Phase 3: MediaPipe) |

### Backend (`packages/backend/`)

| Component | Path | Responsibility |
|-----------|------|----------------|
| presentationSocket | `websocket/presentationSocket.ts` | WebSocket handler, routes messages to sync engine and profiler |
| claudeOrchestrator | `services/claudeOrchestrator.ts` | Calls Claude for `PresentationPlan`, adapts to cognitive profile |
| syncEngine | `services/syncEngine.ts` | Orchestrates segment playback, TTS pre-warming, breakpoints, timing |
| elevenLabsService | `services/elevenLabsService.ts` | TTS generation (non-streaming + streaming), Redis cache, pre-warm |
| cognitiveProfiler | `services/cognitiveProfiler.ts` | Records interactions, updates profile scores after session |
| diagramComposer | `services/diagramComposer.ts` | Validates and enriches `DiagramStep[]` |
| k8sFallbackPlan | `services/k8sFallbackPlan.ts` | Hardcoded K8s networking plan when no Claude API key |

### External Systems

- **PostgreSQL** — users, sessions, concept_interactions, cognitive_profiles
- **Redis** — TTS audio chunk cache, session state
- **Anthropic Claude** — PresentationPlan generation (optional; fallback plan when no key)
- **ElevenLabs** — TTS streaming (optional; browser Speech Synthesis fallback)

## Data Flow

### Start Presentation

1. User types or speaks topic → `TopicInput` → `send({ type: 'START_PRESENTATION', topic })`
2. WebSocket receives → `presentationSocket.ts` creates session, fetches profile
3. Claude Orchestrator generates `PresentationPlan` (or uses `k8sFallbackPlan` if no API key)
4. Sync Engine creates session, pre-warms TTS for first 2 segments
5. Sync Engine sends `PRESENTATION_START` → frontend enters `presenting` state
6. Sync Engine sends `SEGMENT_START` with segment, audio URL (or empty for streaming), diagram steps
7. Frontend `usePresentationSync` plays audio, schedules diagram steps by `trigger_offset_ms`
8. Frontend applies diagram steps as audio progresses (sync loop anchored to `audio.currentTime`)

### Breakpoint & Branch

1. Sync Engine detects breakpoint at segment end → sends `BREAKPOINT`
2. Frontend pauses audio, shows `BranchingUI` modal with countdown ring
3. User selects option → `send({ type: 'BRANCH_CHOICE', ... })`
4. Backend records interaction, updates profile
5. If **deeper**: Claude generates new plan, `replacePlanFromIndex` merges and continues
6. If **continue** or **skip**: `resumeAfterBreakpoint` continues from next segment

### Sync Engine Details

**Backend (`syncEngine.ts`):**

- Pre-warm TTS: fetches audio for segments N+1, N+2 while N plays
- Segment timing: uses `estimated_duration_ms` to schedule `SEGMENT_COMPLETE` and next segment
- Breakpoints: after segment ends, sends `BREAKPOINT`, sets `isPaused`, waits for `BRANCH_CHOICE`
- Streaming: when ElevenLabs key present, sends `TTS_CHUNK` messages; frontend assembles and plays

**Frontend (`usePresentationSync.ts`):**

- Diagram step timing: steps with `trigger_offset_ms > 0` scheduled via `requestAnimationFrame` loop
- Sync anchor: `elapsedMs = audio.currentTime * 1000` (or `Date.now() - segmentStartTime` for browser TTS)
- TTS chunks: accumulates `TTS_CHUNK` until `is_final`, then plays combined audio
- Fallback: if no audio URL and no chunks within ~3s, uses `SpeechSynthesis` (browser TTS)

## Trade-offs

- **Konva vs D3:** Konva (canvas) used for rendering; MISSION.md specified D3 for "visual composition JSON." Fixed positions work for Phase 1 K8s demo; D3 layout algorithms deferred to Phase 2.
- **Browser TTS fallback:** When ElevenLabs unavailable, browser Speech Synthesis used. Quality varies by browser; no emotion/pace control.
- **Segment timing:** Backend uses `estimated_duration_ms`; no real-time audio duration feedback. Can drift on slow TTS.

## Future Improvements

- Integrate MediaPipe FaceMesh for engagement signals (Phase 3)
- Add latency instrumentation (voice-to-visual <200ms target)
- Character-by-character label animation (Phase 2)
- Whisper.cpp for low-latency STT (Phase 2)
