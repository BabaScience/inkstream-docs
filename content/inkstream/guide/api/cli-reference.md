# InkStream CLI Reference

## Overview

The InkStream CLI syncs project documentation into a central docs repository. All commands (except `init` and `workspace`) require a registered project — run them from inside a project directory that has been registered with `inkstream project init`.

---

## Commands

### init

First-time setup: prompts for docs repo git URL and local path, clones the repo if needed.

```bash
inkstream init
```

Creates `~/.inkstream/config.json` and clones the docs repo to the specified path.

---

### workspace add

Create a new workspace.

```bash
inkstream workspace add <slug> --name <name>
```

| Argument | Description |
|----------|-------------|
| `slug` | URL-safe identifier (e.g. `personal`, `digitouch`) |
| `--name` | Human-readable name (required) |

Example:

```bash
inkstream workspace add personal --name "Personal"
```

---

### workspace use

Set the active workspace.

```bash
inkstream workspace use <slug>
```

Example:

```bash
inkstream workspace use personal
```

---

### workspace list

List all registered workspaces. The active workspace is marked with an arrow.

```bash
inkstream workspace list
```

---

### project init

Register the current project with a workspace. Must be run from inside a git repository.

```bash
inkstream project init --workspace <slug> --slug <projectSlug> [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--workspace` | Workspace slug | (required) |
| `--slug` | Project slug (URL-safe) | (required) |
| `--name` | Human-readable project name | (slug) |
| `--docs-root` | Relative path to docs folder | `docs` |

Example:

```bash
inkstream project init --workspace personal --slug my-app --name "My App"
```

If the project is already registered, adds the current git root to `localPaths` if it is not already there.

---

### project list

List projects registered in a workspace.

```bash
inkstream project list --workspace <slug>
```

Example:

```bash
inkstream project list --workspace personal
```

---

### sync

Sync docs from the current project into the central docs repo.

```bash
inkstream sync [--dry-run]
```

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes without modifying files or git |

Process:

1. Pull latest docs repo
2. Diff source vs target
3. Copy new/modified files, delete removed files
4. Commit and push (unless `--dry-run`)

---

### watch

Watch the project's docs folder and auto-sync on changes. Runs until Ctrl-C.

```bash
inkstream watch
```

Uses a 2-second debounce to batch rapid edits before syncing.

---

### status

Show sync status for the current project.

```bash
inkstream status
```

Output:

- Workspace and project
- Source and target paths
- Docs URL pattern
- Whether the docs repo is behind remote

---

### open

Open the docs site for the current project in the default browser.

```bash
inkstream open [--base <url>]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--base` | Base URL of the docs site | `http://localhost:3000` |

Example (production URL):

```bash
inkstream open --base https://docs.example.com
```

---

## Command Summary

| Command | Description |
|---------|-------------|
| `inkstream init` | First-time setup: git URL, local path, clone docs repo |
| `inkstream workspace add <slug> --name <name>` | Create workspace |
| `inkstream workspace use <slug>` | Set active workspace |
| `inkstream workspace list` | List workspaces |
| `inkstream project init --workspace <ws> --slug <proj> [--docs-root <path>]` | Register project |
| `inkstream project list --workspace <ws>` | List projects |
| `inkstream sync [--dry-run]` | Sync docs to central repo |
| `inkstream watch` | Auto-sync on file changes |
| `inkstream status` | Show current project + sync status |
| `inkstream open [--base <url>]` | Open project docs in browser |
