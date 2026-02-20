import { notFound } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import { getAllPages, buildNavTree, getPageContent } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MermaidInit } from "@/components/Mermaid";

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

export default function DocPage({ params }: { params: PageParams }) {
  const { workspace, project, category, slug } = params;

  const page = getPageContent(workspace, project, category, slug);
  if (!page) notFound();

  const allPages = getAllPages();
  const tree = buildNavTree(allPages);
  const searchIndex = buildSearchIndex();

  const html = marked.parse(page.content) as string;

  return (
    <div className="app-shell">
      <Header searchIndex={searchIndex} />
      <Sidebar tree={tree} />

      <main className="main-content">
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
    </div>
  );
}
