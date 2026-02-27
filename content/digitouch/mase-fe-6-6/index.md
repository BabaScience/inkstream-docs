---
title: "Documentation Index"
description: "Entry point for mase-fe-6-6 project documentation"
date: 2026-02-27
tags: [documentation, index]
---

# mase-fe-6-6 Documentation

Welcome to the documentation for **mase-fe-6-6**, the MASE Wildfire Management Portal microfrontend.

## Quick Links

| Section | Description |
|---------|-------------|
| [High-Level Architecture](architecture/high-level.md) | System design, Single-SPA integration, routing, state management |
| [Local Development](workflows/local-development.md) | Setup, mock mode, testing, build, troubleshooting |
| [Feature Overview](features/feature-overview.md) | Map visualization, documents, calculation tools, algorithms |
| [Env & Config Reference](notes/env-variables-reference.md) | Configuration options, API base URLs, MVP flags |

## Documentation Structure

```
docs/
├── architecture/   # System design, component diagrams
├── workflows/      # Dev workflows, CI/CD, deployment
├── api/            # API reference, endpoints
├── notes/          # Config, env vars, general notes
├── decisions/      # ADRs (Architecture Decision Records)
└── features/       # Feature specs and documentation
```

## Syncing to InkStream

Documentation is synced to the central docs site via InkStreamCLI:

```bash
npx inkstream-cli sync
```
