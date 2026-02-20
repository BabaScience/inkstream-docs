---
title: Docs Pipeline
---

# Docs Pipeline

The full pipeline from writing documentation to having it live on the web.

## Writing Docs

Docs are written in Markdown inside the `docs/` folder of each project.

```
my-project/
  src/
  docs/
    architecture/
      high-level.md
    workflows/
      local-dev.md
    api/
      auth.md
    decisions/
      2026-02-20-viewport-centering.md
```

You can use any tool to write them: Cursor, VS Code, vim, or raw markdown.

## Manual Sync

Run `inkstream sync` from the project root:

```bash
cd ~/dev/personal/my-project
inkstream sync
```

The CLI will:
1. Resolve your project from the git root
2. Pull the latest docs repo
3. Copy changed files to `content/<workspace>/<project>/`
4. Commit and push

## Automatic Sync via Watch Mode

For continuous documentation as you code:

```bash
inkstream watch
```

Leave this running in a terminal. Every time you save a `.md` file, the CLI batches changes and syncs within ~2 seconds.

## Vercel Deployment

The docs repo is connected to Vercel. Every `git push` to `main` triggers a new deployment.

```
inkstream sync
    ↓
git push origin main
    ↓
Vercel webhook
    ↓
next build
    ↓
Live at https://your-docs.vercel.app
```

## Commit Message Format

InkStream generates descriptive commit messages automatically:

```
docs(personal/inkstream): sync docs (+2 added, ~1 updated)
docs(work/engine): sync docs (-1 deleted)
```
