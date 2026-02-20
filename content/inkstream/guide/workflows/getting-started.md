# Getting Started with InkStream

## Prerequisites

- **Node.js** — LTS version (e.g. 18.x or 20.x)
- **npm** — Comes with Node
- **Git** — For project resolution and docs repo sync
- **SSH access** — To clone and push to the docs repo (or HTTPS with credentials)
- **InkStream CLI** — Installed and linked (see below)

---

## Step 1: Install the CLI

From the inkstream-cli directory:

```bash
cd inkstream/inkstream-cli
npm install
npm run build     # Compiles TypeScript → dist/
npm link          # Makes `inkstream` available globally
```

Verify:

```bash
inkstream --help
```

---

## Step 2: Initialize InkStream

Run the first-time setup:

```bash
inkstream init
```

You will be prompted for:

1. **Docs repo git URL** — e.g. `git@github.com:your-org/inkstream-docs.git`
2. **Local path to clone into** — e.g. `~/dev/inkstream-docs` or `C:\dev\inkstream-docs`

The CLI will create `~/.inkstream/config.json` and clone the docs repo if it does not exist.

---

## Step 3: Add a Workspace

Create a workspace to group your projects:

```bash
inkstream workspace add personal --name "Personal"
```

Activate it:

```bash
inkstream workspace use personal
```

List workspaces:

```bash
inkstream workspace list
```

---

## Step 4: Register Your Project

Navigate to your project (must be inside a git repository):

```bash
cd ~/dev/my-project
```

Register it with the active workspace:

```bash
inkstream project init --workspace personal --slug my-project
```

Options:

- `--name "My Project"` — Human-readable name (defaults to slug)
- `--docs-root docs` — Path to docs folder inside project (default: `docs`)

If your docs live in `documentation/` instead of `docs/`:

```bash
inkstream project init --workspace personal --slug my-project --docs-root documentation
```

---

## Step 5: Create Docs and Sync

Create a `docs/` folder in your project with markdown files:

```
my-project/
  docs/
    architecture/
      overview.md
    workflows/
      setup.md
```

Then sync:

```bash
inkstream sync
```

Preview without writing:

```bash
inkstream sync --dry-run
```

---

## Step 6: Verify

1. **Status** — Run `inkstream status` to see workspace, project, source, and target paths.
2. **Open** — Run `inkstream open` (with the docs site running locally) to open your project docs in the browser.
3. **Watch** — Run `inkstream watch` to auto-sync on file changes (Ctrl-C to stop).

---

## Expected Results

- Docs appear at `/[workspace]/[project]/[category]/[slug]` on the docs site.
- Example: `http://localhost:3000/personal/my-project/architecture/overview`
- After pushing to the docs repo, Vercel (or your deployment) will rebuild and serve the updated content.
