# Performance Investigation — Memory and Speed

## Overview

This document summarizes findings from a performance investigation of the Agentic Presenter system, covering both backend (Node.js/Express) and frontend (React/Vite). It identifies bottlenecks and proposes improvements for memory usage and latency.

---

## 1. Backend — Memory

### 1.1 In-Memory Session Storage (`syncEngine.ts`)

**Finding:** `activeSessions` is a `Map` holding full `PresentationPlan` objects, WebSocket references, and timer arrays per session. Plans can be large (narration segments, diagram steps, breakpoints).

| Risk | Impact |
|------|--------|
| Unbounded growth | If sessions are not cleaned up (e.g. client disconnect not handled), memory grows indefinitely |
| Plan size | Each plan holds full JSON; merged plans in `replacePlanFromIndex` can grow significantly |

**Recommendations:**
- Add session TTL / heartbeat to detect stale connections and call `cleanupSession`
- Consider storing only segment indices and fetching plan from DB/Redis when needed (if plan caching is introduced)
- Add metrics (e.g. `activeSessions.size`) for monitoring

### 1.2 Redis TTS Cache — Base64 Audio

**Finding:** TTS audio is cached in Redis as full base64 data URLs (`data:audio/mpeg;base64,...`). Each segment can be 50–200 KB+ depending on length.

| Risk | Impact |
|------|--------|
| Redis memory | Many segments × many sessions = significant Redis RAM |
| Duplicate storage | Same segment text can be requested multiple times across sessions; cache key is `segment.id` (unique per plan), so identical text in different plans is cached separately |

**Recommendations:**
- Cache by content hash (e.g. `sha256(text + emotion + speaking_pace)`) instead of `segment.id` to deduplicate across plans
- Set conservative TTL (e.g. 1 hour) for TTS cache; current 3600s is reasonable
- Add Redis `INFO memory` monitoring in health check

### 1.3 Unused Redis APIs

**Finding:** `cache.setSessionState`, `cache.getSessionState`, `cache.setPresentationPlan`, `cache.getPresentationPlan` exist but are never used. Sync state and plans live only in `activeSessions`.

**Recommendation:** Either remove dead code or use Redis for session/plan caching to support horizontal scaling and reduce in-process memory.

### 1.4 Postgres Connection Pool

**Finding:** Default `pg.Pool` with no explicit `max`; Node-postgres default is 10 connections.

**Recommendation:** Explicitly set `max: 10` (or based on load) and consider `idleTimeoutMillis` to release idle connections.

---

## 2. Backend — Speed

### 2.1 Cold Start: Plan Generation

**Finding:** On `START_PRESENTATION`, the flow is sequential:
1. `ensureDefaultUser` (DB)
2. `getProfile` (DB)
3. `INSERT sessions` (DB)
4. `generatePresentationPlan` (Claude API — **slowest**, ~2–8s)
5. `UPDATE sessions` with plan (DB)
6. `createSyncSession` + `startPresentation`
7. `prewarmTTS` (2 segments) — blocks before first segment plays

**Recommendations:**
- Run `ensureDefaultUser` and `getProfile` in parallel where possible
- Consider caching presentation plans by `(topic, profile_hash)` in Redis for repeated topics
- `prewarmTTS` already runs in background for segments 1–2; ensure it does not block `playSegment(0)`

### 2.2 TTS Latency

**Finding:**
- Non-streaming path: `generateTTSAudio` blocks until full audio is ready → high time-to-first-byte
- Streaming path: `streamTTS` with `optimize_streaming_latency=3` is used when ElevenLabs is available — good
- Cache is checked first; cache hits are fast

**Recommendations:**
- Ensure streaming is default when ElevenLabs is configured
- Consider increasing `prewarmTTS` count (e.g. 3 segments) for longer segments
- Add `optimize_streaming_latency=4` (max) if latency is critical and quality is acceptable

### 2.3 Cognitive Profiler — DB Round-Trips

**Finding:** `updateProfile` is called on:
- Branch choice (breakpoint)
- Replay segment
- Disconnect

Each call runs:
1. `SELECT * FROM cognitive_profiles WHERE user_id = $1`
2. `SELECT * FROM concept_interactions WHERE session_id = $1 ORDER BY timestamp`
3. `UPDATE cognitive_profiles SET ...`

**Recommendations:**
- Batch `recordInteraction` inserts if multiple events arrive close together (e.g. debounce 500ms)
- Consider materializing profile updates in a background job on disconnect instead of inline
- Add index on `concept_interactions(session_id, timestamp)` if not already covered

### 2.4 WebSocket Message Handling

**Finding:** `handleMessage` is async; each message is processed sequentially. `JSON.parse(raw.toString())` on every message is fine for typical payload sizes.

**Recommendation:** No blocking work found; ensure `recordInteraction` and `updateProfile` do not block the event loop. Consider `setImmediate` for non-critical DB writes if needed.

---

## 3. Frontend — Memory

### 3.1 `usePresentationSync` — State and Refs

**Finding:**
- `elements` is a `Map<string, CanvasElement>` — grows with each diagram step
- `applyDiagramStep` creates new Maps on every update (`setElements(prev => { const next = new Map(prev); ... })`)
- Character-by-character label reveal creates multiple `setTimeout` callbacks per element (e.g. 10 chars = 10 timers)

**Recommendations:**
- Use `useMemo` or `React.memo` for child components that receive `elements` to avoid unnecessary re-renders
- Batch label reveal updates (e.g. every 2–3 chars) instead of every character to reduce timer count and state updates
- Consider `requestAnimationFrame`-based batching for rapid diagram updates

### 3.2 `PresentationCanvas` — Animation Loop

**Finding:**
- `useEffect` runs on every `elements` change and starts a `requestAnimationFrame` loop
- Loop runs until `needsUpdate` is false for all elements; for highlighted elements, `pulsePhase` changes every frame → loop never stops while any element is highlighted
- `setAnimated(prev => ...)` creates a new Map every frame

**Recommendations:**
- Throttle pulse updates (e.g. 60fps is enough; avoid redundant work)
- Use `useRef` for animation state and a single RAF loop that reads from refs, updating React state only when necessary (e.g. on user interaction)
- Consider CSS animations for pulse effect instead of JS-driven RAF

### 3.3 Grid Lines

**Finding:** `Array.from({ length: Math.floor(width/40) })` and similar for height — creates many `Line` components (e.g. 32×18 = 576 lines for 1280×720).

**Recommendation:** Use a single canvas or SVG pattern for the grid instead of hundreds of Konva `Line` components, or increase grid spacing (e.g. 80px) to reduce count.

### 3.4 `onMessage` Handler Registration

**Finding:** `onMessage(handler)` adds to `handlersRef.current` but never removes. If `useEffect` in App re-runs (e.g. `sync.handleMessage` identity changes), multiple handlers can accumulate.

**Recommendation:** Return an unregister function from `onMessage` and call it in the `useEffect` cleanup.

---

## 4. Frontend — Speed

### 4.1 `getElementsArray()` on Every Render

**Finding:** `App` passes `sync.getElementsArray()` to `PresentationCanvas`. `getElementsArray` returns `Array.from(elements.values())` — a new array every time. This can trigger re-renders when `elements` changes, and the array is recreated even when not needed.

**Recommendation:** Memoize: `const elementsArray = useMemo(() => Array.from(elements.values()), [elements])` or have `PresentationCanvas` accept `Map` and derive the array internally with `useMemo`.

### 4.2 `usePresentationSync` Dependencies

**Finding:** `handleMessage` depends on `[playAudio, playBrowserTTS, clearTimers, applyDiagramStep]`. `applyDiagramStep` depends on `[canvasWidth, canvasHeight]`. If parent re-renders with new dimensions, `applyDiagramStep` changes → `handleMessage` changes → `useEffect` in App re-runs.

**Recommendation:** Stabilize callbacks with `useCallback` and avoid unnecessary dependency changes. Use refs for dimensions if they don't need to trigger handler updates.

### 4.3 Engagement Camera

**Finding:** `setInterval` logs every 5s when camera is active. Low impact but unnecessary in production.

**Recommendation:** Remove or guard with `process.env.NODE_ENV === 'development'`.

---

## 5. Summary — Priority Matrix

| Area | Issue | Impact | Effort | Priority |
|------|-------|--------|--------|----------|
| Backend | Session cleanup / TTL | Memory leak risk | Low | High |
| Backend | Plan caching (Redis) for repeated topics | Speed | Medium | Medium |
| Backend | TTS cache by content hash | Memory (Redis) | Low | Medium |
| Frontend | Grid as pattern vs many Lines | Memory, render cost | Medium | High |
| Frontend | Animation loop for pulse | CPU, battery | Medium | High |
| Frontend | `onMessage` handler cleanup | Memory leak | Low | High |
| Frontend | `getElementsArray` memoization | Re-renders | Low | Medium |
| Frontend | Label reveal batching | Timers, state updates | Low | Medium |

---

## 6. Next Steps

1. **Immediate:** Fix handler cleanup in `useWebSocket`, add session heartbeat/cleanup
2. **Short-term:** Optimize PresentationCanvas (grid, animation loop)
3. **Medium-term:** Redis plan caching, TTS cache key by content hash
4. **Monitoring:** Add `/health` memory stats, Redis memory, active session count
