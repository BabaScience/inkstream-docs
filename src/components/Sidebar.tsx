"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavTree } from "@/lib/content";

interface SidebarProps {
  tree: NavTree;
}

export function Sidebar({ tree }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="sidebar" aria-label="Documentation navigation">
      {Object.entries(tree).map(([workspace, projects]) => (
        <div key={workspace} className="nav-workspace">
          <div className="nav-workspace-label">{workspace}</div>

          {Object.entries(projects).map(([project, categories]) => (
            <div key={project} className="nav-project">
              <div className="nav-project-label">
                {humanize(project)}
              </div>

              {Object.entries(categories).map(([category, pages]) => (
                <div key={category} className="nav-category">
                  <div className="nav-category-label">{humanize(category)}</div>

                  {pages.map((page) => {
                    const href = `/${workspace}/${project}/${category}/${page.slug}`;
                    const active = pathname === href;
                    return (
                      <Link
                        key={page.slug}
                        href={href}
                        className={`nav-link${active ? " active" : ""}`}
                      >
                        {page.title}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
}

function humanize(str: string): string {
  return str
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
