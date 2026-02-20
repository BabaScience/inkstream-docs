# inkstream-docs

> The centralized documentation site for all InkStream-synced projects.

## Tech Stack

- **Framework**: Next.js 14 (App Router, server components)
- **Content**: Markdown files in `content/` (synced by `inkstream-cli`)
- **Search**: Client-side full-text search via Fuse.js
- **Rendering**: `marked` for Markdown → HTML
- **Deployment**: Vercel

## Local Development

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Content Structure

All documentation lives in `content/` following this hierarchy:

```
content/
  <workspace>/
    <project>/
      <category>/
        <slug>.md
```

**Example:**
```
content/personal/inkstream/architecture/high-level.md
content/personal/inkstream/workflows/docs-pipeline.md
content/work/sample-project/architecture/overview.md
```

These map to URLs:
```
/personal/inkstream/architecture/high-level
/personal/inkstream/workflows/docs-pipeline
/work/sample-project/architecture/overview
```

Pages are **auto-discovered** — just add a `.md` file and it appears in the sidebar and search.

## Markdown Front-Matter

Each markdown file can include optional YAML front-matter:

```markdown
---
title: My Custom Title
---

# Content goes here
```

If no `title` is provided, the first H1 or the humanized slug is used.

## Build

```bash
npm run build
```

This generates a production-optimized Next.js build using static rendering for all discovered pages.

## Deploying to Vercel

1. Push this repo (or the `inkstream/` monorepo) to GitHub.
2. Create a new Vercel project and point it to the `inkstream-docs/` directory.
3. Set **Root Directory** to `inkstream-docs` in Vercel settings.
4. Vercel will automatically run `npm run build` and deploy.

Every `git push` from `inkstream sync` will trigger a new Vercel deployment.

### Vercel Environment Variables

No environment variables are required for the base setup. The docs site reads content from the filesystem at build time.

## Navigation

The sidebar is automatically generated from the `content/` folder hierarchy:
- Workspaces as top-level sections
- Projects as subsections
- Categories as nav groups
- Pages as nav links (with active state highlighting)
