import fs from "fs";
import matter from "gray-matter";
import { getAllPages, type PageMeta } from "./content";

export interface SearchDoc {
  workspace: string;
  project: string;
  category: string;
  slug: string;
  title: string;
  body: string;
  url: string;
}

/** Build a flat search index from all pages for client-side Fuse.js search. */
export function buildSearchIndex(): SearchDoc[] {
  const pages = getAllPages();

  return pages.map((page: PageMeta) => {
    let body = "";
    try {
      const raw = fs.readFileSync(page.filePath, "utf-8");
      const { content } = matter(raw);
      // Strip markdown syntax for cleaner search
      body = content
        .replace(/#{1,6}\s/g, "")
        .replace(/\*\*/g, "")
        .replace(/`/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .trim();
    } catch {
      // ignore
    }

    return {
      workspace: page.workspace,
      project: page.project,
      category: page.category,
      slug: page.slug,
      title: page.title,
      body,
      url: `/${page.workspace}/${page.project}/${page.category}/${page.slug}`,
    };
  });
}
