"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { SearchDoc } from "@/lib/search";

interface SearchProps {
  index: SearchDoc[];
}

export function Search({ index }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchDoc[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fuse = useRef(
    new Fuse(index, {
      keys: [
        { name: "title", weight: 0.7 },
        { name: "body", weight: 0.3 },
      ],
      threshold: 0.35,
      minMatchCharLength: 2,
    })
  );

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const hits = fuse.current.search(query).slice(0, 8).map((r) => r.item);
    setResults(hits);
    setOpen(hits.length > 0);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="header-search" ref={containerRef}>
      <input
        type="search"
        placeholder="Search docs…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />

      {open && (
        <div className="search-results">
          {results.map((doc) => (
            <Link
              key={doc.url}
              href={doc.url}
              className="search-result-item"
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
            >
              <div className="search-result-title">{doc.title}</div>
              <div className="search-result-path">{doc.url}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
