---
title: High-Level Architecture
---

# High-Level Architecture

InkStream is a documentation aggregation system. It solves the problem of documentation fragmentation across multiple codebases, machines, and contexts.

## System Components

| Component | Role |
|---|---|
| `inkstream-cli` | Reads project `docs/`, syncs to central docs repo |
| `inkstream-docs` | Next.js site that renders all synced markdown |
| Docs Git Repo | Single source of truth, `content/` folder |
| Vercel | Hosts the docs site, auto-deploys on push |

## Data Flow

```
[Project Repo]          [CLI]           [Docs Repo]         [Vercel]
docs/
  architecture/    →  inkstream sync →  content/          →  Site
  workflows/                             personal/
  api/                                     inkstream/
                                             architecture/
                                             workflows/
                                             api/
```

## Content Organization

All documentation is organized by a 4-level hierarchy:

1. **Workspace** — the organizational context (personal, work, client-x)
2. **Project** — individual codebase or product
3. **Category** — documentation type (architecture, workflows, api, decisions)
4. **Slug** — individual document identifier

This maps directly to URL paths:
```
/<workspace>/<project>/<category>/<slug>
```

## Key Design Decisions

### Global CLI Config

The CLI stores all configuration in `~/.inkstream/` rather than per-project config files. This means:
- No config pollution in individual repos
- Works across machines by appending to `localPaths`
- Single `inkstream init` sets up everything

### Git-Based Sync

The docs repo is a normal Git repository. The CLI syncs by:
1. Pulling latest changes
2. Copying/deleting files
3. Committing with a descriptive message
4. Pushing to trigger Vercel deployment

### Debounced Watch Mode

File watching uses a 2-second debounce to batch rapid changes (e.g., saving multiple files quickly) into a single commit, keeping the git history clean.
