"use client";

import { useEffect, useRef, useState } from "react";

interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  /** The selector for the article/prose container to scan for headings */
  contentSelector?: string;
}

export function TableOfContents({ contentSelector = ".prose" }: TableOfContentsProps) {
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract headings from the rendered content after mount
  useEffect(() => {
    const container = document.querySelector(contentSelector);
    if (!container) return;

    const headings = Array.from(
      container.querySelectorAll<HTMLElement>("h2, h3")
    );

    const extracted: TocEntry[] = headings.map((el) => {
      // Ensure each heading has an id for anchor linking
      if (!el.id) {
        el.id = slugify(el.textContent ?? "");
      }
      return {
        id: el.id,
        text: el.textContent ?? "",
        level: el.tagName === "H2" ? 2 : 3,
      };
    });

    setEntries(extracted);
  }, [contentSelector]);

  // Track which heading is currently visible via IntersectionObserver
  useEffect(() => {
    if (entries.length === 0) return;

    observerRef.current?.disconnect();

    const headingEls = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingEls.length === 0) return;

    // Keep a map of which headings are intersecting
    const intersecting: Record<string, boolean> = {};

    observerRef.current = new IntersectionObserver(
      (obs) => {
        obs.forEach((entry) => {
          intersecting[entry.target.id] = entry.isIntersecting;
        });

        // The active heading is the first one currently visible;
        // if none are visible, keep the last known active.
        const firstVisible = headingEls.find((el) => intersecting[el.id]);
        if (firstVisible) {
          setActiveId(firstVisible.id);
        }
      },
      {
        // Fire when the top of a heading crosses the top 20% of the viewport
        rootMargin: "0px 0px -80% 0px",
        threshold: 0,
      }
    );

    headingEls.forEach((el) => observerRef.current!.observe(el));

    return () => observerRef.current?.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <aside className="toc-container" aria-label="Table of contents">
      <p className="toc-title">On this page</p>
      <nav>
        <ul className="toc-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                className={[
                  "toc-item",
                  entry.level === 3 ? "toc-h3" : "",
                  activeId === entry.id ? "active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(entry.id);
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                    // Update URL hash without jumping
                    window.history.replaceState(null, "", `#${entry.id}`);
                    setActiveId(entry.id);
                  }
                }}
              >
                {entry.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
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
