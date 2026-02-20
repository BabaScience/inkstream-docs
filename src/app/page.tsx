import Link from "next/link";
import { getAllPages, buildNavTree } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search";
import { Sidebar } from "@/components/Sidebar";
import { Search } from "@/components/Search";

export default function HomePage() {
  const pages = getAllPages();
  const tree = buildNavTree(pages);
  const searchIndex = buildSearchIndex();

  // Collect unique workspace/project combos for the home grid
  const projectCards: { workspace: string; project: string; pageCount: number }[] = [];
  for (const [workspace, projects] of Object.entries(tree)) {
    for (const [project, categories] of Object.entries(projects)) {
      const pageCount = Object.values(categories).flat().length;
      projectCards.push({ workspace, project, pageCount });
    }
  }

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
        <div className="home-hero">
          <h1>InkStream Docs</h1>
          <p>
            Aggregated documentation across all workspaces and projects —
            synced automatically by the InkStream CLI.
          </p>
        </div>

        {projectCards.length === 0 ? (
          <div className="not-found">
            <h1>No docs yet</h1>
            <p>
              Run <code>inkstream sync</code> from a registered project to
              publish docs here.
            </p>
          </div>
        ) : (
          <div className="home-grid">
            {projectCards.map(({ workspace, project, pageCount }) => (
              <Link
                key={`${workspace}/${project}`}
                href={`/${workspace}/${project}`}
                className="home-card"
              >
                <div className="home-card-ws">{workspace}</div>
                <div className="home-card-title">{humanize(project)}</div>
                <div className="home-card-sub">
                  {pageCount} page{pageCount !== 1 ? "s" : ""}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function humanize(str: string): string {
  return str
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
