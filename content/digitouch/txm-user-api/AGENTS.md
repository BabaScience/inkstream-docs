# Agents: Documentation Folder Behavior

This `AGENTS.md` applies to everything under the `docs/` folder.

## Scope

- You are **only** editing documentation files here.
- Assume these files will be synced by InkStreamCLI to a central docs site
  with URL structure:

  `/[workspace]/[project]/[category]/[slug]`

where `category` is the subfolder (e.g. `architecture`, `workflows`, `api`, `notes`, `decisions`).

## File organization

- Keep the existing folder structure under `docs/`.
- When creating new files, prefer using existing categories:
  - `architecture/`
  - `workflows/`
  - `api/`
  - `notes/`
  - `decisions/`

If a category clearly does not fit, ask for a category suggestion in the file content, but still place the file under one of the existing folders.

## Architecture docs

When writing in `docs/architecture/*.md`:

- Always include sections like:
  - `# Overview`
  - `## Components`
  - `## Data Flow`
  - `## Trade-offs`
- Describe how this project integrates with external systems.
- Reference important internal modules by path when useful.

## Workflow docs

When writing in `docs/workflows/*.md`:

- Use numbered steps where possible.
- Include:
  - Pre-requisites
  - Step-by-step process
  - Expected results / verification

## Decision docs (ADR style)

When writing in `docs/decisions/*.md`:

- Use this structure:

  ```markdown
  # <Short Decision Title>

  ## Context

  ## Decision

  ## Consequences

  ## Alternatives Considered
