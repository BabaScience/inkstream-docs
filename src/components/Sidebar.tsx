"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import type { NavTree } from "@/lib/content";

interface SidebarProps {
  tree: NavTree;
}

/** Small inline SVG chevron — no external deps */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`nav-chevron${open ? " open" : ""}`}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 2.5L7.5 6 4 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sidebar({ tree }: SidebarProps) {
  const pathname = usePathname();
  const { open, toggle } = useSidebar();

  // Derive which workspace/project contain the active page
  const activeSegments = pathname.split("/").filter(Boolean);
  const activeWorkspace = activeSegments[0] ?? "";
  const activeProject = activeSegments[1] ?? "";

  // Build initial open-state: expand the workspace and project that contain
  // the current page; collapse everything else.
  const initWorkspaces = useCallback(() => {
    const state: Record<string, boolean> = {};
    for (const ws of Object.keys(tree)) {
      state[ws] = ws === activeWorkspace;
    }
    return state;
  }, [tree, activeWorkspace]);

  const initProjects = useCallback(() => {
    const state: Record<string, boolean> = {};
    for (const [ws, projects] of Object.entries(tree)) {
      for (const proj of Object.keys(projects)) {
        state[`${ws}/${proj}`] = ws === activeWorkspace && proj === activeProject;
      }
    }
    return state;
  }, [tree, activeWorkspace, activeProject]);

  const [wsOpen, setWsOpen] = useState<Record<string, boolean>>(initWorkspaces);
  const [projOpen, setProjOpen] = useState<Record<string, boolean>>(initProjects);

  function toggleWorkspace(ws: string) {
    setWsOpen((prev) => ({ ...prev, [ws]: !prev[ws] }));
  }

  function toggleProject(ws: string, proj: string) {
    const key = `${ws}/${proj}`;
    setProjOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      <div
        className={`sidebar-overlay${open ? " visible" : ""}`}
        onClick={toggle}
        aria-hidden="true"
      />
      <nav
        className={`sidebar${open ? " open" : ""}`}
        aria-label="Documentation navigation"
      >
        {Object.entries(tree).map(([workspace, projects]) => {
          const isWsOpen = wsOpen[workspace] ?? false;

          return (
            <div key={workspace} className="nav-workspace">
              {/* Workspace toggle button */}
              <button
                className="nav-toggle nav-workspace-label"
                onClick={() => toggleWorkspace(workspace)}
                aria-expanded={isWsOpen}
              >
                <Chevron open={isWsOpen} />
                {workspace}
              </button>

              <div className={`nav-children${isWsOpen ? " expanded" : " collapsed"}`}>
                {Object.entries(projects).map(([project, categories]) => {
                  const projKey = `${workspace}/${project}`;
                  const isProjOpen = projOpen[projKey] ?? false;

                  return (
                    <div key={project} className="nav-project">
                      {/* Project toggle button */}
                      <button
                        className="nav-toggle nav-project-label"
                        onClick={() => toggleProject(workspace, project)}
                        aria-expanded={isProjOpen}
                      >
                        <Chevron open={isProjOpen} />
                        {humanize(project)}
                      </button>

                      <div className={`nav-children${isProjOpen ? " expanded" : " collapsed"}`}>
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
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </>
  );
}

function humanize(str: string): string {
  return str
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
