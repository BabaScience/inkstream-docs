# InkStream Docs

Central documentation site that aggregates markdown from multiple projects via the InkStream CLI.

## Prerequisites

- Node.js (LTS, e.g. 18.x or 20.x)
- npm

## Quick Start

```bash
npm install
npm run dev
```

Opens http://localhost:3000.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run Next.js lint |

## Content Structure

Content lives under `content/` with the structure:

```
content/[workspace]/[project]/[category]/[slug].md
```

Example: `content/digitouch/txm-ui/architecture/high-level.md` → `/digitouch/txm-ui/architecture/high-level`

**Note:** Content for projects is synced via the InkStream CLI from source projects. Do not edit `content/[workspace]/[project]/` manually for project docs — edits will be overwritten on the next sync.

## Full Documentation

For the complete InkStream guide (CLI setup, writing docs, configuration, troubleshooting), run the docs site locally and navigate to:

- **Local:** http://localhost:3000/inkstream/guide/notes/documentation-index
- Or browse: `/inkstream/guide/` → Architecture, Workflows, API, Notes
