# Architecture

System design, data flow, and component responsibilities for the Agentic Presentation System.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React 18 + Vite)                          │
│                                                                              │
│  TopicInput ──► useWebSocket ──► usePresentationSync ──► PresentationCanvas │
│       │                │                    │                     │          │
│       │                │                    ├──► VoiceOrchestrator          │
│       │                │                    ├──► BranchingUI                 │
│       │                │                    ├──► CognitiveHUD                │
│       │                │                    └──► EngagementCamera            │
│       │                │                                                      │
│       └────────────────┴────────────────── WebSocket ───────────────────────┘
└─────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Node.js + Express)                        │
│                                                                              │
│  presentationSocket ──► claudeOrchestrator ──► syncEngine                    │
│         │                       │                    │                      │
│         │                       │                    ├──► elevenLabsService │
│         │                       │                    ├──► cognitiveProfiler  │
│         │                       │                    └──► diagramComposer    │
│         │                       │                                              │
│         └───────────────────────┴──► PostgreSQL, Redis                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Start Presentation

1. **User** types or speaks topic → `TopicInput` → `send({ type: 'START_PRESENTATION', topic })`
2. **WebSocket** receives message → `presentationSocket.ts` creates session, fetches profile
3. **Claude Orchestrator** generates `PresentationPlan` (or uses `k8sFallbackPlan` if no API key)
4. **Sync Engine** creates session, pre-warms TTS for first 2 segments
5. **Sync Engine** sends `PRESENTATION_START` → frontend enters `presenting` state
6. **Sync Engine** sends `SEGMENT_START` with segment, audio URL (or empty for streaming), diagram steps
7. **Frontend** `usePresentationSync` plays audio, schedules diagram steps by `trigger_offset_ms`
8. **Frontend** applies diagram steps as audio progresses (sync loop anchored to `audio.currentTime`)

---

## Data Flow: Breakpoint & Branch

1. **Sync Engine** detects breakpoint at segment end → sends `BREAKPOINT`
2. **Frontend** pauses audio, shows `BranchingUI` modal with countdown ring
3. **User** selects option → `send({ type: 'BRANCH_CHOICE', ... })`
4. **Backend** records interaction, updates profile
5. If **deeper**: Claude generates new plan, `replacePlanFromIndex` merges and continues
6. If **continue** or **skip**: `resumeAfterBreakpoint` continues from next segment

---

## Key Components

### Frontend

| Component | Responsibility |
|-----------|----------------|
| **TopicInput** | Text/voice input, submit topic, connection status |
| **useWebSocket** | WebSocket connection, reconnect, send/receive |
| **usePresentationSync** | Core sync: maps WS messages → audio playback + diagram steps. Anchors diagram timing to `audio.currentTime` |
| **PresentationCanvas** | Konva.js stage, renders nodes/arrows/labels with fade/scale/draw animations |
| **VoiceOrchestrator** | Pause, resume, replay controls |
| **BranchingUI** | Breakpoint modal, countdown ring, depth choice buttons |
| **CognitiveHUD** | Dev overlay: live profile scores, segment index |
| **EngagementCamera** | Camera feed + stub signal logger (Phase 3: MediaPipe) |

### Backend

| Component | Responsibility |
|-----------|----------------|
| **presentationSocket** | WebSocket handler, routes messages to sync engine and profiler |
| **claudeOrchestrator** | Calls Claude for `PresentationPlan`, adapts to cognitive profile |
| **syncEngine** | Orchestrates segment playback, TTS pre-warming, breakpoints, timing |
| **elevenLabsService** | TTS generation (non-streaming + streaming), Redis cache, pre-warm |
| **cognitiveProfiler** | Records interactions, updates profile scores after session |
| **diagramComposer** | Validates and enriches `DiagramStep[]` |
| **k8sFallbackPlan** | Hardcoded K8s networking plan when no Claude API key |

---

## Sync Engine Details

### Backend (`syncEngine.ts`)

- **Pre-warm TTS**: Fetches audio for segments N+1, N+2 while N plays
- **Segment timing**: Uses `estimated_duration_ms` to schedule `SEGMENT_COMPLETE` and next segment
- **Breakpoints**: After segment ends, sends `BREAKPOINT`, sets `isPaused`, waits for `BRANCH_CHOICE`
- **Streaming**: When ElevenLabs key present, sends `TTS_CHUNK` messages; frontend assembles and plays

### Frontend (`usePresentationSync.ts`)

- **Diagram step timing**: Steps with `trigger_offset_ms > 0` are scheduled via `requestAnimationFrame` loop
- **Sync anchor**: `elapsedMs = audio.currentTime * 1000` (or `Date.now() - segmentStartTime` for browser TTS)
- **TTS chunks**: Accumulates `TTS_CHUNK` until `is_final`, then plays combined audio
- **Fallback**: If no audio URL and no chunks within ~3s, uses `SpeechSynthesis` (browser TTS)

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | User records (default user for Phase 1) |
| `sessions` | Presentation sessions, topic, `presentation_plan` JSONB |
| `concept_interactions` | Events: segment_start, replay, deeper, skip, etc. |
| `cognitive_profiles` | Per-user: visual_verbal_score, sequential_exploratory_score, abstract_concrete_score, avg_comprehension_speed_ms, preferred_analogy_domains |

---

## Redis Usage

- **TTS cache**: Audio chunks keyed by `segment.id` to avoid re-generating
- **Session state**: In-flight presentation state (if needed for scaling)

---

## Shared Types (`packages/shared/types/presentation.ts`)

Canonical contract between frontend, backend, and Claude:

- `PresentationPlan`, `NarrationSegment`, `DiagramStep`, `Breakpoint`
- `CognitiveProfile`, `ConceptInteraction`
- `WSMessageServer`, `WSMessageClient` (discriminated unions)
