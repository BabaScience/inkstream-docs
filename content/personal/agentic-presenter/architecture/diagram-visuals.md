# Diagram Visuals (Illustrations)

## Overview

The presentation system uses **programmatically generated diagrams**, not pre-made images or stock illustrations. Visuals are built from a JSON specification that describes nodes, arrows, labels, and containers. The agent (Claude) produces this specification; the frontend renders it with Konva.js on a canvas.

This document explains how diagram visuals work end-to-end: data model, agent selection logic, pipeline, and rendering.

## Terminology

| Term | Meaning |
|------|---------|
| **Diagram** | The full visual built during a presentation — nodes, arrows, labels, containers. |
| **DiagramStep** | A single instruction to add, highlight, fade, connect, or label an element. |
| **DiagramElement** | The abstract description of one visual element (type, label, position, style). |
| **CanvasElement** | The frontend representation after applying a step (pixel coordinates, animation state). |

## Data Model

### DiagramStep

Each diagram step is triggered by a narration segment at a specific offset.

```ts
interface DiagramStep {
  id: string;
  trigger_segment_id: string;   // Which narration segment triggers this
  trigger_offset_ms: number;    // ms into the segment (0 = segment start)
  action: DiagramAction;        // add | highlight | fade | connect | label | group
  element: DiagramElement;
}
```

### DiagramElement

```ts
interface DiagramElement {
  id: string;
  type: ElementType;            // node | arrow | label | container
  label: string;
  position: { x: number; y: number };  // Normalized 0–1 (0,0 = top-left)
  style?: {
    color?: string;
    size?: number;
    shape?: ElementShape;       // circle | rect | diamond | hexagon
    strokeColor?: string;
    fontSize?: number;
  };
  connects_to?: string[];        // Element IDs for arrows (source, ...targets)
}
```

### Element Types and Shapes

| Type | Purpose | Shapes (nodes only) | Example |
|------|---------|---------------------|---------|
| `node` | Concept or entity | `circle`, `rect`, `diamond`, `hexagon` | Pod, Service, kube-proxy |
| `arrow` | Relationship or flow | — | "routes to", "maps to pods" |
| `label` | Text overlay | — | IP addresses, DNS names |
| `container` | Grouping (e.g. Node) | `rect` (dashed) | Node 1, CNI Overlay Network |

**Shape semantics (K8s demo):**

- `rect` — Pods, Endpoints
- `diamond` — kube-proxy, NetworkPolicy
- `hexagon` — Service
- `circle` — Generic node fallback

## How the Agent Picks Visuals

There is **no image search or image library**. The agent outputs a JSON structure; the frontend renders it as Konva shapes.

### Source: Claude or Fallback

- **Claude** (`claudeOrchestrator.ts`): When `ANTHROPIC_API_KEY` is set, Claude generates a `PresentationPlan` with `diagram_sequence`.
- **Fallback** (`k8sFallbackPlan.ts`): When no API key, a hardcoded K8s networking plan is used.

### Selection Logic

Claude decides what to show based on:

1. **Topic and concept order** — For K8s networking: Pod → Pod IP → Node → kube-proxy → Service → ClusterIP → Endpoints → CNI → Network Policy.
2. **Cognitive profile** — Injected into the system prompt:
   - **Visual-first** (`visual_verbal_score > 0.5`): More diagram steps, fewer words per segment.
   - **Verbal-first** (`visual_verbal_score < -0.5`): Richer narration, fewer but more meaningful diagram steps.
   - **Balanced**: Mix diagram steps and narration evenly.
3. **Preferred analogy domains** — e.g. `["docker", "linux-networking"]` — influences labels and analogies.
4. **Timing** — Each step has `trigger_offset_ms` so visuals appear in sync with narration.

### Example (from k8sFallbackPlan)

```ts
// Segment 2: Pod + Pod IP
{
  id: 'ds-2',
  trigger_segment_id: 'seg-2',
  trigger_offset_ms: 0,
  action: 'add',
  element: {
    id: 'pod-1',
    type: 'node',
    label: 'Pod A',
    position: { x: 0.2, y: 0.35 },
    style: { color: '#3b82f6', shape: 'rect', size: 60 }
  }
}
```

## Pipeline

```
Claude / k8sFallbackPlan
        │
        ▼
  PresentationPlan (diagram_sequence: DiagramStep[])
        │
        ▼
  diagramComposer.ts — validate, enrich (defaults for color/size)
        │
        ▼
  syncEngine.ts — filter steps per segment, send via WebSocket
        │
        ▼
  usePresentationSync.ts — applyDiagramStep (DiagramStep → CanvasElement)
        │
        ▼
  PresentationCanvas — Konva.js render (nodes, arrows, labels, containers)
```

### diagramComposer

- **enrichDiagramStep**: Applies default colors and sizes when missing.
- **validateDiagramSequence**: Ensures `trigger_segment_id` exists, positions are normalized (0–1).
- **composeDiagramForSegment**: Filters steps for a segment, sorts by `trigger_offset_ms`.

### usePresentationSync — applyDiagramStep

Converts `DiagramStep` into `CanvasElement` and updates the elements map:

| Action | Behavior |
|--------|----------|
| `add` / `group` | Create element with `opacity: 0`, `scale: 0.8`; animate to `opacity: 1`, `scale: 1`; character-by-character label reveal (50ms/char). |
| `highlight` | Set `highlighted: true`, `strokeColor`; triggers pulse animation. |
| `fade` | Set `opacity: 0.3` on existing element. |
| `connect` | Create arrow with `drawProgress: 0`; animate to `drawProgress: 1` (stroke-dashoffset effect). |
| `label` | Add standalone label with character-by-character reveal. |

**Position denormalization:** `(x, y)` in 0–1 range → pixel coordinates: `(x * canvasWidth, y * canvasHeight)`.

### PresentationCanvas — Rendering

| Element Type | Konva Component | Notes |
|--------------|-----------------|-------|
| `node` | `Rect`, `Circle`, `Line` (diamond/hexagon) | Shape from `element.style.shape` |
| `container` | `Rect` (dashed stroke) + `Text` | Semi-transparent, groups nodes |
| `label` | `Text` | Monospace font, centered |
| `arrow` | `Arrow` | Connects source/target by `connectsTo`; `drawProgress` animates line length |

**Animations:**

- **Fade-in**: Opacity 0 → 1, scale 0.8 → 1 (requestAnimationFrame loop).
- **Character-by-character**: `visibleLabelLength` increments over time.
- **Arrow draw**: `drawProgress` 0 → 1 over ~300ms.
- **Pulse**: Highlighted elements use `0.8 + 0.2 * sin(t)` for stroke opacity (1.5s period).

## Trade-offs

- **No pre-made images**: Diagrams are always generated from JSON. Extending to image assets would require new types and a selection/generation pipeline.
- **Fixed positions**: Phase 1 uses explicit 0–1 coordinates. D3.js layout algorithms (force-directed, etc.) are deferred to Phase 2.
- **Konva vs D3**: Konva (canvas) used for rendering; MISSION.md specified D3 for "visual composition JSON." Fixed positions suffice for the K8s demo.

## Future Improvements

- D3.js layout algorithms for dynamic diagram composition (Phase 2).
- Optional image assets (e.g. icons, diagrams) with agent-driven selection or generation.
- More element types or shapes for richer visual vocabulary.
