# InkStream Configuration Reference

## Overview

InkStream uses JSON config files stored under `~/.inkstream/`. Configuration is split into global and workspace levels.

---

## Global Config

**Path:** `~/.inkstream/config.json`

**Purpose:** Central docs repo location and workspace registry.

| Field | Type | Description |
|-------|------|-------------|
| `docsRepo.gitUrl` | string | Remote git URL (e.g. `git@github.com:org/inkstream-docs.git`) |
| `docsRepo.localPath` | string | Absolute path where the docs repo is cloned |
| `currentWorkspace` | string? | Slug of the active workspace |
| `workspaces` | array | List of workspace references |

Example:

```json
{
  "docsRepo": {
    "gitUrl": "git@github.com:myorg/inkstream-docs.git",
    "localPath": "C:\\Users\\me\\dev\\inkstream-docs"
  },
  "currentWorkspace": "personal",
  "workspaces": [
    {
      "slug": "personal",
      "name": "Personal",
      "configPath": "C:\\Users\\me\\.inkstream\\workspaces\\personal.json"
    }
  ]
}
```

---

## Workspace Config

**Path:** `~/.inkstream/workspaces/<slug>.json`

**Purpose:** Projects registered under a workspace.

| Field | Type | Description |
|-------|------|-------------|
| `slug` | string | Workspace slug |
| `name` | string | Human-readable name |
| `projects` | object | Map of project slug → project config |

Example:

```json
{
  "slug": "personal",
  "name": "Personal",
  "projects": {
    "my-app": {
      "name": "My App",
      "localPaths": [
        "C:\\Users\\me\\dev\\my-app",
        "D:\\projects\\my-app"
      ],
      "docsRoot": "docs"
    }
  }
}
```

---

## Project Config

**Location:** Inside `workspaces/<slug>.json` under `projects[projectSlug]`

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Human-readable project name |
| `localPaths` | string[] | Absolute paths to project roots (for different machines) |
| `docsRoot` | string | Relative path to docs folder inside project (default: `docs`) |

**localPaths:** The CLI matches the current git root against these paths. If you use the same project on multiple machines, add each path when running `inkstream project init` from that machine.

**docsRoot:** Default is `docs`. Use `--docs-root <path>` when registering if your docs live elsewhere (e.g. `documentation`, `docs-src`).

---

## Path Resolution

When you run `inkstream sync` (or `watch`, `status`, `open`):

1. CLI gets git root via `git rev-parse --show-toplevel`
2. Iterates over all workspaces and their projects
3. Matches git root against each project's `localPaths`
4. Returns exactly one match or errors

Target path in docs repo:

```
<docsRepo.localPath>/content/<workspaceSlug>/<projectSlug>/
```

Example: `C:\dev\inkstream-docs\content\personal\my-app\`
