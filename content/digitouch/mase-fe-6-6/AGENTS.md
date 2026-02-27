# InkStream Documentation Agent
# Workspace: digitouch | Project: mase-fe-6-6
# ─────────────────────────────────────────────────────────────────────────────
#
# This file provides folder-specific guidance for AI agents working inside
# the docs/ directory. It complements the project-level .cursorrules.

## Context

This folder (\`docs/\`) is managed by **InkStreamCLI**.
Files written here are synced to a central documentation site at:
  content/digitouch/mase-fe-6-6/

The agent MUST:
  - Only create Markdown (.md) files in this directory.
  - Follow the subfolder convention: architecture/, workflows/, api/, notes/, decisions/, features/.
  - Use kebab-case filenames.
  - Include YAML frontmatter (title, description, date, tags).
  - Generate a paired HTML file in \`docs-html/\` for every .md file created here.

## Subfolder Reference

| Folder         | Purpose                                    | Example                          |
|---------------|--------------------------------------------|----------------------------------|
| architecture/ | System design, component diagrams          | high-level.md, data-flow.md     |
| workflows/    | Dev workflows, CI/CD, deployment           | local-development.md            |
| api/          | API reference, endpoints, SDK              | auth-endpoints.md               |
| notes/        | General notes, config, env vars            | env-variables-reference.md      |
| decisions/    | ADRs with date prefix                      | 2026-02-20-auth-strategy.md     |
| features/     | Feature documentation and specs            | user-dashboard.md               |

## HTML Output

Every .md file you create here MUST have a matching .html file at:
  \`docs-html/<same-relative-path>.html\`

The HTML MUST use the InkStream documentation theme with:
  - Gold accent color scheme (#C9A84C primary)
  - Fixed sidebar navigation with section labels and active states
  - Responsive layout (sidebar collapses to horizontal nav on mobile ≤ 900px)
  - Mermaid.js support for diagrams
  - Styled tables, code blocks, cards, badges, and lead paragraphs
  - Google Fonts: Literata (headings), DM Sans (body), JetBrains Mono (code)

See the project .cursorrules for the full HTML template.

## Do NOT

  - Create .mdx, .txt, or .rst files.
  - Write docs outside of the recognized subfolders listed above.
  - Modify the central docs repo directly.
  - Skip the HTML generation step.
