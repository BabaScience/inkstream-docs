import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPages, buildNavTree } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

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
      <Header searchIndex={searchIndex} />
      <Sidebar tree={tree} />

      <main className="main-content">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href={`/${workspace}`}>{workspace}</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{humanize(project)}</span>
        </nav>

        <div className="section-header">
          <div className="section-tag">Workspace</div>
          <h2>{humanize(project)}</h2>
          <p className="section-desc">
            Workspace: <strong style={{ color: "var(--cyan)" }}>{workspace}</strong>
          </p>
        </div>

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
                    color: "var(--cyan)",
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
