# Local Development: InkStream Docs Site

## Overview

This document describes how to run, build, and deploy the InkStream docs site locally and in production.

---

## Prerequisites

- **Node.js** — LTS version (e.g. 18.x or 20.x)
- **npm** — Comes with Node

---

## Setup

### 1. Install dependencies

```bash
cd inkstream-docs
npm install
```

---

## Run

### Development server

```bash
npm run dev
```

Opens [http://localhost:3000](http://localhost:3000). Uses hot reload for code changes. Content changes in `content/` may require a refresh.

---

## Build

### Production build

```bash
npm run build
```

Output in `.next/`. This is what Vercel runs on deploy.

### Start production server

```bash
npm run start
```

Serves the built site locally (typically after `npm run build`).

---

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run Next.js lint |

---

## Content Structure

Content lives under `content/`:

```
content/
  [workspace]/
    [project]/
      [category]/
        [slug].md
```

Example: `content/digitouch/txm-ui/architecture/high-level.md` → `/digitouch/txm-ui/architecture/high-level`

**Note:** Content for projects is synced via the InkStream CLI from source projects. Do not edit `content/[workspace]/[project]/` manually for project docs — edits will be overwritten on the next sync. The `content/inkstream/guide/` section (this guide) can be edited directly in the docs repo.

---

## Deployment (Vercel)

The docs site is typically deployed to Vercel:

1. Connect the docs repo to Vercel.
2. Set build command: `npm run build`
3. Set output directory: `.next` (or use Vercel's Next.js preset)
4. On each push to `main`, Vercel rebuilds and deploys.

Content pushed by `inkstream sync` triggers a new deployment when the docs repo is updated.

---

## Verification

1. Run `npm run dev` and open http://localhost:3000.
2. Navigate to a workspace/project (e.g. `/digitouch/txm-ui`).
3. Use the sidebar to browse categories and pages.
4. Use the search (if enabled) to find content.
5. Verify Mermaid diagrams render correctly.
