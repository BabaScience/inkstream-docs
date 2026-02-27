import { notFound } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import { getAllPages, buildNavTree, getPageContent } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MermaidInit } from "@/components/Mermaid";
import { TableOfContents } from "@/components/TableOfContents";

interface PageParams {
  workspace: string;
  project: string;
  category: string;
  slug: string;
}

export async function generateStaticParams(): Promise<PageParams[]> {
  return getAllPages().map((p) => ({
    workspace: p.workspace,
    project: p.project,
    category: p.category,
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: { params: PageParams }) {
  const page = getPageContent(
    params.workspace,
    params.project,
    params.category,
    params.slug
  );
  return {
    title: page ? `${page.title} — InkStream Docs` : "InkStream Docs",
  };
}

/** Convert heading text to a URL-safe id slug */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export default function DocPage({ params }: { params: PageParams }) {
  const { workspace, project, category, slug } = params;

  const page = getPageContent(workspace, project, category, slug);
  if (!page) notFound();

  const allPages = getAllPages();
  const tree = buildNavTree(allPages);
  const searchIndex = buildSearchIndex();

  // Configure marked with a custom renderer that adds id attributes to headings
  const renderer = new marked.Renderer();

  renderer.heading = function (text: string, level: number): string {
    const id = slugify(text);
    return `<h${level} id="${id}">${text}</h${level}>\n`;
  };

  const html = marked.parse(page.content, { renderer }) as string;

  return (
    <div className="app-shell">
      <Header searchIndex={searchIndex} />
      <Sidebar tree={tree} />

      <main className="main-content has-toc">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href={`/${workspace}`}>{workspace}</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href={`/${workspace}/${project}`}>{project}</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href={`/${workspace}/${project}/${category}`}>{category}</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{page.title}</span>
        </nav>

        <MermaidInit docKey={`${workspace}/${project}/${category}/${slug}`}>
          <article
            className="prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </MermaidInit>
      </main>

      {/* Sticky right-side Table of Contents (hidden below 1200px via CSS) */}
      <TableOfContents contentSelector=".prose" />
    </div>
  );
}
