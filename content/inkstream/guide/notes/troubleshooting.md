# InkStream Troubleshooting

## Overview

Common errors and how to resolve them.

---

## No registered project found

**Error:** `No registered project found for git root: /path/to/project`

**Cause:** The current directory is not inside a git repo, or the project has not been registered.

**Fix:**

1. Ensure you are inside a git repository: `git status` should work.
2. Register the project: `inkstream project init --workspace <slug> --slug <project>`
3. If you cloned the repo to a different path, run `inkstream project init` again from that path — it will add the new path to `localPaths`.

---

## Multiple projects match

**Error:** `Multiple projects match git root /path/to/project`

**Cause:** The same git root is registered under multiple workspace/project combinations.

**Fix:** Edit the workspace configs at `~/.inkstream/workspaces/*.json` and remove the duplicate `localPaths` entry from one of the projects. Keep only one workspace/project per git root.

---

## Global config not found

**Error:** `Global config not found at ~/.inkstream/config.json. Run "inkstream init" to set it up.`

**Cause:** InkStream has not been initialized.

**Fix:** Run `inkstream init` and follow the prompts.

---

## Docs repo clone fails

**Error:** `Could not clone docs repo: ...`

**Cause:** Invalid git URL, SSH keys not set up, or network issues.

**Fix:**

1. Verify the git URL: `git ls-remote <gitUrl>` should work.
2. For SSH: ensure `ssh -T git@github.com` works (or your host).
3. For HTTPS: ensure credentials are configured.
4. Check that the local path is writable and not already a non-git directory.

---

## Docs source directory not found

**Error:** `Docs source directory not found: /path/to/project/docs`

**Cause:** The project has no `docs/` folder (or the path in `docsRoot` does not exist).

**Fix:**

1. Create the docs folder: `mkdir docs` (or your custom `docsRoot`).
2. Add at least one `.md` file.
3. Run `inkstream sync` again.

---

## Docs repo is behind remote

**Message:** `Docs repo is N commit(s) behind remote. Run "inkstream sync" to update.`

**Cause:** Someone else pushed to the docs repo; your local clone is stale.

**Fix:** Run `inkstream sync`. The sync process pulls the latest before applying changes. If you have local edits in the docs repo itself, resolve any merge conflicts after the pull.

---

## Sync: nothing to commit

**Message:** `No changes to sync for workspace/project`

**Cause:** Source and target are identical. No files were added, modified, or deleted.

**Fix:** This is normal. Edit a file in your project's `docs/` folder and run `inkstream sync` again.

---

## Path exists but is not a git repository

**Error:** `Path ... exists but is not a git repository. Please remove it or choose a different path.`

**Cause:** The `docsRepo.localPath` points to a directory that is not a git repo.

**Fix:** Either remove the directory and run `inkstream init` again to clone, or run `git init` in that directory and add the remote. Prefer re-running `inkstream init` with a correct path.

---

## Not inside a git repository

**Error:** `Not inside a git repository (cwd: ...)`

**Cause:** You ran `inkstream project init`, `sync`, `watch`, `status`, or `open` from a directory that is not inside a git repo.

**Fix:** `cd` into your project directory (where `.git` exists) and run the command again.
