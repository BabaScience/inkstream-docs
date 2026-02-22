# Test Coverage — Living Documentation

> **Living doc:** Update this file whenever you add, remove, or change tests. Keep the test inventory in sync with the codebase. Last verified: 2026-02-22.

---

## Overview

Tests ensure implemented features work correctly and catch regressions when code changes. The project uses **Vitest** for both backend and frontend. This document is the canonical reference for what is tested and what is not.

---

## How to Keep This Doc Updated

| When | Action |
|------|--------|
| Add a new test file | Add a row to the relevant table and a section under "Detailed Test Inventory". |
| Add/remove a test case | Update the test list in the relevant section. |
| Change what a test covers | Update the description and any assertions listed. |
| Add a new package or test type | Add a new top-level section and update the summary. |
| Tests fail or are skipped | Note in "Known Gaps" or fix and remove the note. |

**Quick check:** Run `npm run test` and compare the output (test count, file names) against this doc.

---

## Running Tests

```bash
# All tests (backend + frontend)
npm run test

# Backend only
cd packages/backend && npm run test

# Frontend only
cd packages/frontend && npm run test

# Watch mode (re-run on file changes)
cd packages/backend && npm run test:watch
cd packages/frontend && npm run test:watch

# With coverage report
npm run test:coverage
```

---

## Summary

| Package | Test Files | Test Count | Coverage Focus |
|---------|------------|------------|----------------|
| Backend | 6 | 35 | Services, routes, sync engine |
| Frontend | 1 | 6 | Presentation sync hook |
| **Total** | **7** | **41** | Unit + integration |

---

## Detailed Test Inventory

### Backend — Diagram Composer

**Source:** `packages/backend/src/services/diagramComposer.ts`  
**Tests:** `packages/backend/src/services/diagramComposer.test.ts`

| # | Test Case | What It Verifies |
|---|-----------|------------------|
| 1 | `enrichDiagramStep` — applies default color and size when style is missing | Node gets `#3b82f6`, size 60; missing `element.style` is filled. |
| 2 | `enrichDiagramStep` — preserves existing style values | Custom `color` and `size` are not overwritten. |
| 3 | `enrichDiagramStep` — applies type-specific defaults for arrow and label | Arrow: `#64748b`, size 2; label: `#e2e8f0`, size 14. |
| 4 | `validateDiagramSequence` — returns empty array when all steps are valid | No errors when `trigger_segment_id` exists and positions are normalized. |
| 5 | `validateDiagramSequence` — reports unknown trigger_segment_id | Error when step references non-existent segment. |
| 6 | `validateDiagramSequence` — reports non-normalized position (x > 1) | Error when `position.x` > 1. |
| 7 | `validateDiagramSequence` — reports non-normalized position (y < 0) | Error when `position.y` < 0. |
| 8 | `composeDiagramForSegment` — filters steps by segment and sorts by trigger_offset_ms | Only steps for given segment; sorted by offset. |
| 9 | `composeDiagramForSegment` — enriches each step with defaults | Output steps have default styles applied. |

---

### Backend — K8s Fallback Plan

**Source:** `packages/backend/src/services/k8sFallbackPlan.ts`  
**Tests:** `packages/backend/src/services/k8sFallbackPlan.test.ts`

| # | Test Case | What It Verifies |
|---|-----------|------------------|
| 1 | Returns a valid PresentationPlan | Has `title`, `total_duration_ms`, `narration_segments`, `diagram_sequence`, `breakpoints`. |
| 2 | Has narration segments with required fields | Each segment has `id`, `text`, `estimated_duration_ms`, valid `emotion`, valid `speaking_pace`. |
| 3 | Has diagram steps with valid trigger_segment_id references | All steps reference existing segments; positions in 0–1 range. |
| 4 | Has breakpoints that reference existing segments | Breakpoints reference real segments; options have `label`, `next_topic`, valid `depth`. |
| 5 | Covers K8s networking concepts in order | Narration text mentions pod, node, kube-proxy, service, CNI, network policy. |

---

### Backend — Claude Orchestrator

**Source:** `packages/backend/src/services/claudeOrchestrator.ts`  
**Tests:** `packages/backend/src/services/claudeOrchestrator.test.ts`

| # | Test Case | What It Verifies |
|---|-----------|------------------|
| 1 | Returns K8s fallback plan when ANTHROPIC_API_KEY is not set | No API key → uses `getK8sFallbackPlan()`; plan has segments, diagram steps, breakpoints. |
| 2 | Returns K8s fallback plan when ANTHROPIC_API_KEY is whitespace-only | Empty/whitespace key → fallback path. |
| 3 | Returns valid plan with priorContext | `priorContext` is passed to prompt; plan is returned. |

**Note:** Claude API success path is not unit-tested (would require mocking Anthropic SDK). Integration/E2E can cover that.

---

### Backend — Sync Engine

**Source:** `packages/backend/src/services/syncEngine.ts`  
**Tests:** `packages/backend/src/services/syncEngine.test.ts`

| # | Test Case | What It Verifies |
|---|-----------|------------------|
| 1 | Creates session and sends PRESENTATION_START | `createSyncSession` returns syncId; WebSocket receives `PRESENTATION_START` with `total_segments`. |
| 2 | Returns session after createSyncSession | `getActiveSession` returns plan, `currentSegmentIndex` 0. |
| 3 | Sends SEGMENT_START for first segment | `startPresentation` sends `SEGMENT_START` with first segment id and diagram steps. |
| 4 | Pauses and clears timers | `pausePresentation` sets `isPaused`, clears timers. |
| 5 | Resumes from current segment | `resumePresentation` clears pause and continues. |
| 6 | Continues to next segment when depth is continue | `resumeAfterBreakpoint` with `depth: 'continue'` advances playback. |
| 7 | Replays segment by id | `replaySegment` sends `SEGMENT_START` for the requested segment. |
| 8 | Merges new plan and continues from index | `replacePlanFromIndex` merges old + new segments; `priorContext` updated. |

**Mocks:** ElevenLabs TTS (empty audio), `presentationEvents.broadcastBreakpoint`, fake WebSocket with `OPEN: 1`.

---

### Backend — Cognitive Profiler

**Source:** `packages/backend/src/services/cognitiveProfiler.ts`  
**Tests:** `packages/backend/src/services/cognitiveProfiler.test.ts`

| # | Test Case | What It Verifies |
|---|-----------|------------------|
| 1 | `recordInteraction` — inserts a concept interaction with all fields | INSERT with `session_id`, `concept_id`, `event_type`, `duration_ms`, `user_action`. |
| 2 | `recordInteraction` — passes user_action when provided | `user_action` included in query params. |
| 3 | `getProfile` — returns null when no profile exists | Empty rows → null. |
| 4 | `getProfile` — returns profile when it exists | Row returned as profile object. |
| 5 | `updateProfile` — returns null when user has no profile | No profile row → null. |
| 6 | `updateProfile` — updates profile and sends UPDATE query when profile exists | Returns updated profile; `session_count` incremented; UPDATE called with correct params. |
| 7 | `updateProfile` — does not increment session_count when incrementSessionCount is false | `session_count` unchanged when flag is false. |

**Mocks:** `db.query` via `vi.mock('../db/postgres')`. Use `mockReset()` in `beforeEach` to avoid cross-test leakage.

---

### Backend — Presentation API

**Source:** `packages/backend/src/routes/presentation.ts`  
**Tests:** `packages/backend/src/routes/presentation.test.ts`

| # | Test Case | What It Verifies |
|---|-----------|------------------|
| 1 | Returns 400 when topic is missing | POST without `topic` → 400, `success: false`, error message. |
| 2 | Returns 200 with plan when topic is provided | POST with `topic` → 200, `success: true`, `data` with plan. |
| 3 | Accepts user_id in body | POST with `user_id` → 200. |

**Mocks:** `claudeOrchestrator.generatePresentationPlan`, `cognitiveProfiler.getProfile`, `db.ensureDefaultUser`.

---

### Frontend — usePresentationSync

**Source:** `packages/frontend/src/hooks/usePresentationSync.ts`  
**Tests:** `packages/frontend/src/hooks/usePresentationSync.test.tsx`

| # | Test Case | What It Verifies |
|---|-----------|------------------|
| 1 | Starts in idle state | Initial `state` is `'idle'`; `elements` empty; `totalSegments` 0. |
| 2 | Transitions to presenting on PRESENTATION_START | `state` → `'presenting'`; `title`, `totalSegments` set. |
| 3 | Applies diagram steps on SEGMENT_START | `handleMessage(SEGMENT_START)` adds elements; `getElementsArray()` includes new node. |
| 4 | Transitions to breakpoint on BREAKPOINT message | `state` → `'breakpoint'`; `breakpoint.question` set. |
| 5 | Transitions to complete on PRESENTATION_COMPLETE | `state` → `'complete'`; `narrationText` includes completion message. |
| 6 | Computes progress from currentSegmentIndex and totalSegments | `progress` updates when segments advance. |

**Mocks:** `window.speechSynthesis`, `requestAnimationFrame` / `cancelAnimationFrame` (see `src/test/setup.ts`).

---

## Mocking Strategy

| Dependency | Where Mocked | Behavior |
|------------|--------------|----------|
| **Postgres (`db`)** | `cognitiveProfiler.test.ts` | `vi.mock('../db/postgres')`; use `mockReset()` in `beforeEach` when using `mockResolvedValueOnce`. |
| **ElevenLabs TTS** | `syncEngine.test.ts` | Returns empty audio; `isElevenLabsAvailable` false. |
| **WebSocket** | `syncEngine.test.ts` | Fake object: `send`, `readyState: 1`, `OPEN: 1`. |
| **Claude API** | Not mocked | Tests use fallback path (no `ANTHROPIC_API_KEY`). |
| **Speech Synthesis** | `frontend/src/test/setup.ts` | `speak`, `cancel`, `pause`, `getVoices` stubbed. |
| **requestAnimationFrame** | `frontend/src/test/setup.ts` | Wrapped with `setTimeout` / `clearTimeout`. |

---

## Known Gaps (Not Yet Tested)

| Area | Description | Suggested Approach |
|------|-------------|--------------------|
| **Profile API** | GET/PATCH `/api/profile/:userId` | Add `routes/profile.test.ts` with mocked DB. |
| **Session API** | GET `/api/sessions/:userId`, GET `/api/sessions/detail/:sessionId` | Add route tests. |
| **WebSocket handler** | `presentationSocket.ts` message handling | Integration test with real WS client or mock server. |
| **TTS service** | `elevenLabsService` (cache, streaming, errors) | Unit test with mocked `fetch` and Redis. |
| **Whisper service** | `whisperService` | Unit test with mocked HTTP. |
| **PresentationCanvas** | Konva rendering, animations | Component test with `@testing-library/react` + canvas mock. |
| **BranchingUI** | Modal, countdown, options | Component test. |
| **CognitiveHUD** | Profile display | Component test. |
| **TopicInput** | User input, submit | Component test. |
| **VoiceOrchestrator** | Audio playback, TTS chunks | Hook/component test with mocked Audio. |
| **EngagementCamera** | Camera feed, dummy signals | Component test with mocked `navigator.mediaDevices`. |
| **E2E** | Full flow: type topic → presentation → breakpoint → branch | Playwright or Cypress. |

---

## Phase 1 Acceptance Criteria → Test Mapping

| # | Criterion | Test Location |
|---|-----------|---------------|
| 1 | User types topic → presentation starts | `presentation.test.ts`, `syncEngine.test.ts` |
| 2 | Claude/fallback generates PresentationPlan | `claudeOrchestrator.test.ts`, `k8sFallbackPlan.test.ts` |
| 3 | Voice narration plays segment by segment | `syncEngine.test.ts` (SEGMENT_START) |
| 4 | Diagram builds progressively | `usePresentationSync.test.tsx` (diagram steps) |
| 5 | Diagram elements animate | `usePresentationSync.test.tsx` (elements applied) |
| 6 | Breakpoints pause and show modal | `usePresentationSync.test.tsx` (BREAKPOINT) |
| 7 | User choice resumes on branch | `syncEngine.test.ts` (resumeAfterBreakpoint, replacePlanFromIndex) |
| 8 | Cognitive HUD shows profile | Not yet tested |
| 9 | Concept interactions recorded | `cognitiveProfiler.test.ts` |
| 10 | Profile updates after session | `cognitiveProfiler.test.ts` |
| 11 | WebSocket reconnects | E2E / manual |
| 12 | Works without API keys | `claudeOrchestrator.test.ts`, `presentation.test.ts` |

---

## Adding New Tests

1. **Backend:** Create `*.test.ts` next to the source (e.g. `services/foo.test.ts`).
2. **Frontend:** Create `*.test.tsx` next to the component/hook.
3. **Mock external deps:** Use `vi.mock('module')` at the top of the test file.
4. **Reset mocks:** Call `mockReset()` in `beforeEach` when using `mockResolvedValueOnce`.
5. **Update this doc:** Add the test file and cases to the relevant section above.

---

## CI Integration

```yaml
- run: npm run test
```

For coverage:

```yaml
- run: npm run test:coverage
```
