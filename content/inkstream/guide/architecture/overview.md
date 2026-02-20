# InkStream: System Overview

## Overview

InkStream is a documentation aggregation system consisting of two parts:

1. **InkStream CLI** — A command-line tool that syncs markdown documentation from individual projects into a central docs repository.
2. **InkStream Docs Site** — A Next.js 14 web application that renders the aggregated documentation with search, navigation, and Mermaid diagram support.

Projects keep their docs in a `docs/` folder (or custom path). The CLI copies these files into the docs repo under `content/[workspace]/[project]/[category]/[slug].md`. The docs site reads from `content/` and serves pages at `/[workspace]/[project]/[category]/[slug]`.

---

## Components

| Component | Purpose |
|-----------|---------|
| **inkstream-cli** | Init, workspace/project management, sync, watch, status, open |
| **inkstream-docs** | Next.js site; reads `content/` at build time; deployed to Vercel |
| **~/.inkstream/** | Global config and workspace configs |
| **content/** | Synced markdown; structure: `[workspace]/[project]/[category]/[slug].md` |

---

## Workspace and Project Hierarchy

- **Workspace** — A logical grouping (e.g. `personal`, `digitouch`, `client-x`). Each workspace has a config file at `~/.inkstream/workspaces/<slug>.json`.
- **Project** — A single codebase with its own `docs/` folder. Projects are registered under a workspace and map to one or more local paths (for different machines).
- **Category** — A subfolder under the project docs: `architecture`, `workflows`, `api`, `notes`, `decisions`, `features`.
- **Slug** — The filename without `.md` (e.g. `high-level`, `getting-started`).

---

## Sync Flow

```
project/docs/**/*.md  →  inkstream sync  →  content/[workspace]/[project]/[category]/[slug].md
```

1. You run `inkstream sync` from inside a registered project.
2. The CLI resolves the current git root to a workspace/project.
3. It pulls the latest docs repo, diffs source vs target, copies new/modified files, deletes removed files.
4. It commits and pushes to the docs repo.
5. The docs site (or Vercel) rebuilds and serves the updated content.

---

## URL Structure

Pages are served at:

```
/[workspace]/[project]/[category]/[slug]
```

Examples:

- `/digitouch/txm-ui/architecture/high-level`
- `/inkstream/guide/workflows/getting-started`
- `/personal/my-app/api/overview`

---

## Supported Categories

| Category | Typical Use |
|----------|-------------|
| `architecture` | System design, components, data flow, trade-offs |
| `workflows` | Step-by-step guides, setup, development |
| `api` | API references, CLI commands, service docs |
| `notes` | Reference material, env vars, indexes |
| `decisions` | ADRs (Architecture Decision Records) |
| `features` | Feature-specific docs (routing, permissions, etc.) |

---

## Trade-offs

- **Git-based sync** — Docs are versioned in the docs repo. No separate CMS; changes require `inkstream sync` and a push.
- **Single docs repo** — All workspaces and projects share one repo. Simplifies deployment but requires coordination for multi-team setups.
- **Local path resolution** — Projects are matched by git root. Same project on different machines needs `localPaths` to include each path.
- **Markdown only** — Only `.md` files are synced. Images and other assets must be handled separately or embedded.
