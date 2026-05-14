"use client";

import { useState } from "react";
import { Search, Plus, X, Zap } from "lucide-react";

interface NavbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  onAddClick: () => void;
  linkCount: number;
}

export function Navbar({
  query,
  onQueryChange,
  onAddClick,
  linkCount,
}: NavbarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/[0.06]">
      <div className="flex items-center gap-4 px-4 md:px-6 h-14">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="font-display text-sm font-bold tracking-tight hidden sm:block">
            Dev<span className="text-indigo-400">Vault</span>
          </span>
        </a>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-auto">
          <div
            className={`relative flex items-center rounded-lg border transition-all duration-200 ${
              focused
                ? "border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.12]"
            }`}
          >
            <Search className="w-3.5 h-3.5 text-zinc-500 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search links, tags, categories..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none font-mono"
            />
            {query && (
              <button
                onClick={() => onQueryChange("")}
                className="mr-2 p-0.5 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3 text-zinc-500" />
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-zinc-600 font-mono hidden md:block">
            {linkCount} links
          </span>
          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Add Link</span>
          </button>
        </div>
      </div>
    </header>
  );
}
