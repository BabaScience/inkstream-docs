import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPages, buildNavTree } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search";
import { Sidebar } from "@/components/Sidebar";
import { Search } from "@/components/Search";

interface PageParams {
  workspace: string;
  project: string;
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const pages = getAllPages();
  const seen = new Set<string>();
  const params: PageParams[] = [];

  for (const p of pages) {
    const key = `${p.workspace}/${p.project}`;
    if (!seen.has(key)) {
      seen.add(key);
      params.push({ workspace: p.workspace, project: p.project });
    }
  }

  return params;
}

export default function ProjectPage({ params }: { params: PageParams }) {
  const { workspace, project } = params;

  const allPages = getAllPages();
  const tree = buildNavTree(allPages);
  const searchIndex = buildSearchIndex();

  const projectData = tree[workspace]?.[project];
  if (!projectData) notFound();

  const humanize = (s: string) =>
    s.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="app-shell">
      <header className="header">
        <Link href="/" className="header-logo">
          Ink<span>Stream</span> Docs
        </Link>
        <Search index={searchIndex} />
      </header>

      <Sidebar tree={tree} />

      <main className="main-content">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href={`/${workspace}`}>{workspace}</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{humanize(project)}</span>
        </nav>

        <h1 style={{ color: "var(--text-heading)", marginBottom: "0.5rem" }}>
          {humanize(project)}
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Workspace: <strong style={{ color: "var(--accent)" }}>{workspace}</strong>
        </p>

        <div className="home-grid">
          {Object.entries(projectData).map(([category, pages]) => (
            <div key={category} className="home-card" style={{ cursor: "default" }}>
              <div className="home-card-ws">{category}</div>
              {pages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/${workspace}/${project}/${category}/${page.slug}`}
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    color: "var(--link)",
                    textDecoration: "none",
                    marginTop: "0.3rem",
                  }}
                >
                  {page.title}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
