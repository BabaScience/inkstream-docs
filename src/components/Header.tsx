"use client";

import Link from "next/link";
import { Search } from "./Search";
import { useSidebar } from "./SidebarContext";
import type { SearchDoc } from "@/lib/search";

interface HeaderProps {
  searchIndex: SearchDoc[];
}

export function Header({ searchIndex }: HeaderProps) {
  const { toggle } = useSidebar();

  return (
    <header className="header">
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={toggle}
        aria-label="Toggle navigation menu"
      >
        <span />
        <span />
        <span />
      </button>
      <Link href="/" className="header-logo">
        Ink<span>Stream</span> Docs
      </Link>
      <Search index={searchIndex} />
    </header>
  );
}
