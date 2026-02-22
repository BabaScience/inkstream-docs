# Missing Features & Gaps from MISSION.md

## Overview

This document tracks what is **implemented** vs. **planned** according to MISSION.md, so maintainers can prioritize and avoid scope creep.

## Summary Table

| Feature | MISSION.md Spec | Current Status | Phase |
|---------|-----------------|----------------|-------|
| D3.js for diagram generation | "D3.js for SVG diagram data generation / visual composition JSON" | ❌ Not used — Konva.js only | 1 |
| MediaPipe FaceMesh | "Phase 1: stub the signal processor, wire the camera feed, log signals to console" | ⚠️ Camera wired, dummy signals only — no @mediapipe/face_mesh | 1 |
| MediaPipe engagement algorithm | "Full adaptive algorithm" | ❌ Not implemented | 3 |
| Whisper.cpp STT | "Expose as local HTTP endpoint, document setup in README" | ⚠️ Service exists, not fully wired; README lacks setup | 1 |
| OpenVoice v2 TTS | "Self-hosted fallback — stub the endpoint" | ✅ Stubbed | 2 |
| Character-by-character label | "Labels appear after arrow completes" / "character-by-character label" | ❌ Labels fade in, not character-by-character | 1 |
| Struggle signal adaptation | "Agent adapts if struggle signals detected" | ❌ Not implemented | 3 |
| Voice questions mid-presentation | "User asking questions via voice mid-presentation" | ❌ VOICE_INPUT logged but not processed | 2 |
| Latency targets | Voice-to-visual <200ms, UI <50ms, TTS initiation <500ms | ⚠️ Not measured or validated | 1 |
| Pause after sentence boundary | "Breakpoints: pause after sentence boundary" | ⚠️ Pause at segment end, not mid-sentence | 1 |
| TTS streaming pipeline | "Pipeline pre-warming (fetch segment N+1 while N plays)" | ✅ Implemented | 1 |
| SSE fallback | "SSE as fallback for depth-choice branching UI" | ✅ Implemented | 1 |
| WebSocket message protocol | "Typed discriminated union covering every possible message" | ✅ Implemented | 1 |
| Konva.js animations | "fade-in, stroke-dashoffset arrow draw, pulse highlight" | ✅ Fade, scale, drawProgress for arrows | 1 |
| Branching UI countdown | "Countdown ring, no diagram reset" | ✅ Implemented | 1 |
| Cognitive HUD | "Dev overlay for demo validation" | ✅ Implemented | 1 |
| Database migrations | Exact tables from MISSION | ✅ Implemented | 1 |
| .env.example | "All secrets, feature flags, provider switches" | ✅ Implemented | 1 |

## Detailed Gaps

### 1. D3.js — Not Used

**MISSION.md:** "D3.js for SVG diagram data generation / visual composition JSON"

**Current:** Diagram structure comes from Claude (or `k8sFallbackPlan`). `diagramComposer.ts` validates and enriches `DiagramStep[]`. Rendering is Konva.js (canvas), not D3 (SVG).

**Impact:** Low. Konva handles layout and animation. D3 was specified for "visual composition JSON" — could mean layout algorithms (force-directed, etc.). For Phase 1 K8s demo, fixed positions work.

**Action:** Add `// TODO: Phase 2` if D3 layout algorithms are desired for dynamic diagrams.

### 2. MediaPipe FaceMesh — Stub Only

**MISSION.md:** "Phase 1: stub the signal processor, wire the camera feed, log signals to console"

**Current:** `EngagementCamera` wires camera, logs dummy `{ gaze_on_screen, engagement_score }` every 5s. No `@mediapipe/face_mesh` dependency.

**Action:** Phase 1 spec says "stub" — current state is acceptable. Phase 3: integrate MediaPipe for real engagement detection.

### 3. Whisper.cpp — Incomplete Integration

**MISSION.md:** "Whisper.cpp edge model for low-latency STT — expose as local HTTP endpoint, document setup in README"

**Current:** `whisperService.ts` has `transcribeAudio()` and `isWhisperAvailable()`. Topic input uses Web Speech API. No backend route that accepts audio and returns transcript. README does not document Whisper.cpp setup.

**Action:**

- Add README section: "Optional: Whisper.cpp for STT" with install/setup steps
- Wire `VOICE_INPUT` to optionally use Whisper when endpoint available (Phase 2)

### 4. Character-by-Character Label Animation

**MISSION.md:** "character-by-character label", "labels appear after arrow completes"

**Current:** Labels fade in with opacity/scale. Arrows use `drawProgress` (stroke-dashoffset-like). No character-by-character reveal.

**Action:** `// TODO: Phase 2` — add character-by-character label animation in `PresentationCanvas` for labels.

### 5. Struggle Signal Adaptation (Phase 3)

**MISSION.md:** "Agent adapts if struggle signals detected (slow response, repeated questions → slows down, adds analogy)"

**Current:** No struggle detection. Cognitive profiler updates from replays, breakpoint choices, etc., but does not feed back into live presentation pacing.

**Action:** Phase 3 — wire engagement/struggle signals to sync engine and Claude context.

### 6. Voice Questions Mid-Presentation

**MISSION.md:** "User asking questions via voice mid-presentation → note the segment that triggered it"

**Current:** `VOICE_INPUT` message is received and logged. No processing, no segment context, no Claude follow-up.

**Action:** Phase 2 — handle `VOICE_INPUT`, pass transcript + current segment to Claude, inject response into flow.

### 7. Latency Targets — Not Validated

**MISSION.md:** Voice-to-visual <200ms, UI <50ms, TTS initiation <500ms

**Current:** No instrumentation or benchmarks.

**Action:** Add latency logging; document in `docs/workflows/dev-setup.md` how to measure.

### 8. Breakpoint: Pause After Sentence Boundary

**MISSION.md:** "At key breakpoints, agent PAUSES" — implies natural pause point.

**Current:** Breakpoints fire at segment end. If segment is long, pause may feel mid-thought.

**Action:** Ensure Claude generates segments so breakpoints align with sentence boundaries. No code change if prompt is sufficient.

## Explicitly Out of Scope (Phase 2+)

From MISSION.md and README — do **not** implement without explicit scope change:

- Multi-user concurrent sessions
- Full MediaPipe engagement algorithm (Phase 3)
- OpenVoice v2 self-hosted TTS (Phase 2)
- Custom topic generation beyond K8s (Phase 2)
- Presentation replay from stored plans
- Mobile responsive layout
- Authentication / user accounts

## Acceptance Criteria Checklist (Phase 1)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | User types "Explain Kubernetes networking" → presentation starts | ✅ |
| 2 | Claude (or fallback) generates PresentationPlan | ✅ |
| 3 | Voice narration plays segment by segment | ✅ |
| 4 | Konva.js diagram builds progressively, synced to narration | ✅ |
| 5 | Diagram elements animate in (fade, scale) — not instant | ✅ |
| 6 | Breakpoints pause and show depth-choice modal | ✅ |
| 7 | User choice resumes on selected branch | ✅ |
| 8 | Cognitive HUD shows live profile scores | ✅ |
| 9 | Concept interactions recorded to database | ✅ |
| 10 | Profile updates after session | ✅ |
| 11 | WebSocket reconnects automatically | ✅ |
| 12 | System works without API keys (fallback + browser TTS) | ✅ |

## Recommended Next Steps

1. Document Whisper.cpp setup in README for optional STT.
2. Add latency instrumentation for sync and TTS.
3. Phase 2 planning: Voice questions, character-by-character labels, D3 layout (if needed).
4. Phase 3 planning: MediaPipe integration, struggle signal adaptation.
