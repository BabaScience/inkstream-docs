import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const CONTENT_DIR = path.join(process.cwd(), "content");

export interface PageMeta {
  workspace: string;
  project: string;
  category: string;
  slug: string;
  title: string;
  /** Full filesystem path */
  filePath: string;
}

export interface NavTree {
  [workspace: string]: {
    [project: string]: {
      [category: string]: PageMeta[];
    };
  };
}

/** Recursively read all .md files under content/ and return their metadata. */
export function getAllPages(): PageMeta[] {
  const pages: PageMeta[] = [];

  if (!fs.existsSync(CONTENT_DIR)) return pages;

  const workspaces = readdirSafe(CONTENT_DIR);

  for (const workspace of workspaces) {
    const wsPath = path.join(CONTENT_DIR, workspace);
    if (!fs.statSync(wsPath).isDirectory()) continue;

    const projects = readdirSafe(wsPath);
    for (const project of projects) {
      const projPath = path.join(wsPath, project);
      if (!fs.statSync(projPath).isDirectory()) continue;

      const categories = readdirSafe(projPath);
      for (const category of categories) {
        const catPath = path.join(projPath, category);
        if (!fs.statSync(catPath).isDirectory()) continue;

        const files = readdirSafe(catPath).filter((f) => f.endsWith(".md"));
        for (const file of files) {
          const slug = file.replace(/\.md$/, "");
          const filePath = path.join(catPath, file);
          const title = extractTitle(filePath, slug);

          pages.push({ workspace, project, category, slug, title, filePath });
        }
      }
    }
  }

  return pages;
}

/** Build a nested nav tree from all pages. */
export function buildNavTree(pages: PageMeta[]): NavTree {
  const tree: NavTree = {};

  for (const page of pages) {
    if (!tree[page.workspace]) tree[page.workspace] = {};
    if (!tree[page.workspace][page.project])
      tree[page.workspace][page.project] = {};
    if (!tree[page.workspace][page.project][page.category])
      tree[page.workspace][page.project][page.category] = [];

    tree[page.workspace][page.project][page.category].push(page);
  }

  return tree;
}

/** Read and parse a single markdown page, returning front-matter + content. */
export function getPageContent(
  workspace: string,
  project: string,
  category: string,
  slug: string
): { title: string; content: string; data: Record<string, unknown> } | null {
  const filePath = path.join(
    CONTENT_DIR,
    workspace,
    project,
    category,
    `${slug}.md`
  );

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const title =
    (data.title as string | undefined) ||
    extractTitle(filePath, slug);

  return { title, content, data };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function readdirSafe(dir: string): string[] {
  try {
    return fs.readdirSync(dir).sort();
  } catch {
    return [];
  }
}

function extractTitle(filePath: string, fallback: string): string {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    if (data.title) return String(data.title);
    // Extract first H1
    const match = content.match(/^#\s+(.+)$/m);
    if (match) return match[1].trim();
  } catch {
    // ignore
  }
  // Humanize slug
  return fallback
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
