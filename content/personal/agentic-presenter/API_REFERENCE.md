# API Reference

REST endpoints, WebSocket protocol, and message types.

---

## Base URLs

| Environment | Backend | Frontend |
|-------------|---------|----------|
| Development | `http://localhost:3001` | `http://localhost:5173` |
| WebSocket | `ws://localhost:3001/ws` | — |

---

## REST Endpoints

### Health

```
GET /health
```

Returns `{ status: "ok", timestamp: "..." }`.

---

### Sessions

```
POST /api/sessions
Body: { user_id?: string, topic: string }
```

Creates a session. Returns `{ id, user_id, topic, started_at }`.

---

### Presentation (REST fallback)

```
POST /api/present
Body: { topic: string, user_id?: string }
```

Generates a presentation plan. Returns `{ plan: PresentationPlan, session_id }`.

---

### Presentation Events (SSE)

```
GET /api/presentation/events/:sessionId
```

Server-Sent Events stream for presentation events (e.g. `BREAKPOINT`). Use when WebSocket is unavailable.

```
POST /api/presentation/branch
Body: { sessionId, breakpoint_id, option_index, chosen_topic }
```

Submit branch choice when using SSE fallback.

---

### Profile

```
GET /api/profile/:userId
```

Returns cognitive profile for user.

```
PATCH /api/profile/:userId
Body: Partial<CognitiveProfile>
```

Updates profile (admin/debug).

---

### TTS

```
POST /api/tts/stream
Body: { segment: NarrationSegment }
```

Generates TTS for a segment. Returns audio stream or base64 URL. Used internally; primary path is WebSocket + `TTS_CHUNK`.

---

## WebSocket Protocol

Connect to `ws://localhost:3001/ws`. All messages are JSON.

### Server → Client

| Type | Payload | Description |
|------|---------|-------------|
| `PRESENTATION_START` | `plan_title`, `total_segments`, `session_id?` | Presentation began |
| `SEGMENT_START` | `segment_id`, `segment`, `audio_url`, `diagram_steps` | New segment; play audio, schedule diagram steps |
| `SEGMENT_COMPLETE` | `segment_id` | Segment finished |
| `DIAGRAM_STEP` | `step: DiagramStep` | Apply diagram step (can be sent separately) |
| `TTS_CHUNK` | `segment_id`, `chunk`, `is_final` | Streaming TTS chunk (base64) |
| `BREAKPOINT` | `breakpoint: Breakpoint` | Pause for user choice |
| `PRESENTATION_COMPLETE` | `session_id` | All segments done |
| `ERROR` | `message`, `code?` | Error |
| `PROFILE_UPDATE` | `profile: Partial<CognitiveProfile>` | Profile changed |

### Client → Server

| Type | Payload | Description |
|------|---------|-------------|
| `START_PRESENTATION` | `topic`, `user_id?` | Request new presentation |
| `BRANCH_CHOICE` | `breakpoint_id`, `option_index`, `chosen_topic` | User selected branch |
| `SEGMENT_EVENT` | `segment_id`, `event_type`, `duration_ms?` | Interaction event |
| `REPLAY_SEGMENT` | `segment_id` | Replay segment |
| `PAUSE` | — | Pause playback |
| `RESUME` | — | Resume playback |
| `VOICE_INPUT` | `transcript` | Voice question (Phase 2) |

---

## Type Definitions (Key)

### PresentationPlan

```ts
interface PresentationPlan {
  title: string;
  total_duration_ms: number;
  narration_segments: NarrationSegment[];
  diagram_sequence: DiagramStep[];
  breakpoints: Breakpoint[];
}
```

### NarrationSegment

```ts
interface NarrationSegment {
  id: string;
  text: string;
  estimated_duration_ms: number;
  emotion: "warm" | "neutral" | "encouraging" | "excited";
  speaking_pace: "slow" | "normal" | "fast";
  analogy_anchor?: string;
}
```

### DiagramStep

```ts
interface DiagramStep {
  id: string;
  trigger_segment_id: string;
  trigger_offset_ms: number;
  action: "add" | "highlight" | "fade" | "connect" | "label" | "group";
  element: DiagramElement;
}
```

### Breakpoint

```ts
interface Breakpoint {
  id: string;
  trigger_segment_id: string;
  question: string;
  options: { label: string; next_topic: string; depth: "deeper" | "continue" | "skip" }[];
}
```

### CognitiveProfile

```ts
interface CognitiveProfile {
  user_id: string;
  visual_verbal_score: number;      // -1 to 1
  sequential_exploratory_score: number;
  abstract_concrete_score: number;
  avg_comprehension_speed_ms: number;
  preferred_analogy_domains: string[];
  session_count: number;
  updated_at: string;
}
```

Full definitions: `packages/shared/types/presentation.ts`.
