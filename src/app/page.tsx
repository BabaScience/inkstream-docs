import Link from "next/link";
import { getAllPages, buildNavTree } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

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
      <Header searchIndex={searchIndex} />
      <Sidebar tree={tree} />

      <main className="main-content">
        <div className="home-hero">
          <div className="hero-version">Documentation Hub</div>
          <h1>
            InkStream <em>Docs</em>
          </h1>
          <p className="hero-sub">
            Aggregated documentation across all workspaces and projects —
            synced automatically by the InkStream CLI.
          </p>
        </div>

        <section className="get-started-section">
          <div className="section-header">
            <div className="section-tag">Quick Start</div>
            <h2>How to <em>Get Started</em></h2>
            <p className="section-desc">
              Install the CLI, configure your workspace, and sync docs from your projects.
            </p>
          </div>

          <div className="get-started-steps">
            <div className="get-started-block">
              <div className="get-started-label">CLI</div>
              <pre><code>{`cd inkstream/inkstream-cli
npm install
npm run build     # Compiles TypeScript → dist/
npm link          # Makes \`inkstream\` available globally

inkstream --help  # Verify installation`}</code></pre>
            </div>

            <div className="get-started-block">
              <div className="get-started-label">First-time setup</div>
              <pre><code>{`inkstream init    # Prompts for git URL + local path; clones docs repo

inkstream workspace add personal --name "Personal"
inkstream workspace use personal

cd ~/dev/my-project
inkstream project init --workspace personal --slug my-project
inkstream sync            # Push docs immediately
inkstream sync --dry-run  # Preview without writing

inkstream watch           # Auto-sync on file changes (Ctrl-C to stop)`}</code></pre>
            </div>

            <div className="get-started-block">
              <div className="get-started-label">Docs Site</div>
              <pre><code>{`cd inkstream/inkstream-docs
npm install
npm run dev     # → http://localhost:3000
npm run build   # Production build (what Vercel runs)`}</code></pre>
            </div>
          </div>
        </section>

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
