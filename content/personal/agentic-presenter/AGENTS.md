```markdown
# InkStreamCLI Project Rules (.cursorrules)

You are working in a codebase that uses **InkStreamCLI** (`inkstream-cli`) to
sync documentation to a central docs site deployed from a separate repo.

Your primary responsibilities here are:
- Write and maintain high‑quality documentation in `docs/`.
- Optionally trigger `inkstream` to sync docs after meaningful changes.
- Avoid touching the central docs repo directly from this project.

---

## 1. File locations and structure

All project documentation MUST live under the `docs/` directory at the project root.

Use these subfolders and naming conventions:

- `docs/architecture/<slug>.md`
  - High-level system overviews, module breakdowns, data flows, deployment views.
  - Examples: `high-level.md`, `data-flow.md`, `deployment.md`.

- `docs/workflows/<slug>.md`
  - Step-by-step flows, operational runbooks, automation pipelines, onboarding flows.
  - Examples: `docs-pipeline.md`, `onboarding-flow.md`.

- `docs/api/<slug>.md`
  - API contracts (HTTP, CLI, internal services), request/response shapes, examples.
  - Examples: `cli-commands.md`, `service-endpoints.md`.

- `docs/notes/<slug>.md`
  - Exploratory notes, design spikes, investigations, scratch docs.

- `docs/decisions/<date>-<short-title>.md`
  - Architecture decision records (ADR style).
  - Use `YYYY-MM-DD` for the date and kebab-case for the title.
  - Example: `2026-02-20-viewport-centering.md`.

Rules:

- `<slug>` MUST be **kebab-case**: lowercase letters, numbers, and hyphens only.
- Use `.md` **only** for docs; do NOT create `.mdx`, `.txt`, or other extensions.
- Do NOT write documentation files outside `docs/`.

---

## 2. Working with files

When I give you a specific path, such as `docs/architecture/high-level.md`:

- If the file exists:
  - Read it.
  - Rewrite it entirely with a clearer, better-structured version that preserves
    all important information (unless it is clearly obsolete or duplicated).
- If the file does not exist:
  - Create it at that exact path and populate it with a complete, coherent doc.

General rules:

- Prefer editing existing docs rather than creating near-duplicates.
- Do not rename files or move them between categories unless I explicitly ask.
- Do not change non-doc files (code, configs, etc.) unless I explicitly ask.

---

## 3. Content style and structure

### 3.1. General style

For all docs:

- Use clear headings with `#`, `##`, `###` (no deeper than `####` unless needed).
- Prefer short paragraphs (1–4 sentences).
- Use bullet lists or numbered lists for sequences or key points.
- When possible, start with a brief summary at the top.

Every substantive doc should, where it makes sense, include:

- **Context**: what this doc is about and why it matters.
- **Structure / Flow**: components, steps, or sections.
- **Key decisions / trade-offs**.
- **Consequences**: impact, limitations, and future work.

### 3.2. Architecture docs (`docs/architecture/*.md`)

Default structure:

```markdown
# <Title>

## Overview

## Components

## Data Flow

## Trade-offs

## Future Improvements
```

- Reference important internal modules by path when useful.
- Describe how this project integrates with external systems and services.
- Keep diagrams textual (lists, ASCII, or explained flows); no images.

### 3.3. Workflow docs (`docs/workflows/*.md`)

Default structure:

```markdown
# <Title>

## Overview

## Pre-requisites

## Steps

## Verification

## Notes
```

- Use numbered steps under **Steps**.
- Make it runnable as a playbook: someone should be able to follow it and succeed.

### 3.4. API docs (`docs/api/*.md`)

Default structure:

```markdown
# <Title>

## Overview

## Endpoints / Commands

## Parameters

## Examples

## Error Handling
```

- For CLI commands, document:
  - Command syntax.
  - Options/flags.
  - Example invocations and outputs.
- For HTTP or service APIs, document endpoints, request/response schemas, and examples.

### 3.5. Decision docs (`docs/decisions/*.md`)

Use ADR style:

```markdown
# <Short Decision Title>

## Context

## Decision

## Consequences

## Alternatives Considered
```

- Preserve filename date and slug; do not rename the file unless explicitly told.
- Be explicit about what changed and why.

---

## 4. InkStreamCLI integration

This project uses **InkStreamCLI** (`inkstream-cli`) to sync docs to a central
documentation site. You are allowed to suggest or execute sync commands.

### 4.1. When to sync

- Whenever you finish a substantial series of edits to one or more files under `docs/`,
  you SHOULD propose syncing the documentation.
- When I explicitly say things like:
  - "Sync docs"
  - "Publish docs"
  - "Ship documentation"
  - "Update the docs site"
  you MUST sync using InkStreamCLI.

### 4.2. How to sync

- You MUST run sync commands from the **project root** (where `package.json` lives).
- Prefer this command, which works even if the CLI is not installed globally:

```bash
npx inkstream-cli sync
```

- If I mention that `inkstream-cli` is installed globally and I’m okay with it, you may use:

```bash
inkstream sync
```

Sync procedure:

1. Ensure all documentation edits under `docs/` are saved.
2. Run `npx inkstream-cli sync` from the project root in the terminal.
3. Show me the output and any errors.

If syncing fails:

- Do NOT retry in a loop.
- Show the exact error and wait for further instructions.

---

## 5. Safe operations and boundaries

- Default assumption: I want **documentation changes only** unless I explicitly
  ask you to modify code or configuration.
- Do NOT:
  - Edit git remotes or CI/CD configs.
  - Change InkStreamCLI internal behavior from this project unless asked.
  - Touch the central docs repo directly; you only ever write to `docs/` here.
- Before making large structural changes to docs (moving many files, renaming), you
  should:
  - Explain the proposed change.
  - Wait for my confirmation if the change is risky.

---

## 6. Collaboration with other project-level rules

- If any other rules in this repository conflict with these rules, treat these
  `.cursorrules` instructions as authoritative for documentation and InkStreamCLI
  behavior.
- Always prefer consistency with:
  - `docs/AGENTS.md` for folder-specific documentation behavior.
  - These `.cursorrules` for project-wide conventions and sync behavior.

```