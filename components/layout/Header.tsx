"use client";

import { useState } from "react";
import { Plus, Download, Menu, X } from "lucide-react";

interface HeaderProps {
  linkCount: number;
  onAddClick: () => void;
  onExport: () => void;
}

export function Header({ linkCount, onAddClick, onExport }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800">
      <div className="flex items-center justify-between px-4 md:px-6 h-14 max-w-5xl mx-auto">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center">
            <span className="text-zinc-950 font-black text-xs leading-none">L</span>
          </div>
          <span className="font-black text-sm tracking-tight text-zinc-100">
            Lynk<span className="text-amber-400">Hive</span>
          </span>
          <span className="hidden sm:block text-[10px] font-mono text-zinc-600 ml-1">
            {linkCount} links
          </span>
        </a>

        {/* Desktop actions */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all duration-150"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Link
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 space-y-2">
          <button
            onClick={() => { onExport(); setMobileOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            Export Data
          </button>
          <button
            onClick={() => { onAddClick(); setMobileOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-400 text-zinc-950 text-sm font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Link
          </button>
        </div>
      )}
    </header>
  );
}
