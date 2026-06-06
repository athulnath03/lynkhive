"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomBar } from "@/components/layout/BottomBar";
import { LinkGrid } from "@/components/links/LinkGrid";
import { AddLinkForm } from "@/components/forms/AddLinkForm";
import { useLinks } from "@/hooks/useLinks";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { LinkCategory } from "@/types";

// BottomBar natural height: categories (~48px) + search (~52px) + padding = ~108px
// Add safe area buffer for home indicator on notched phones
const BOTTOM_BAR_BASE_HEIGHT = 112;

export default function HomePage() {
  const {
    links,
    filteredLinks,
    isLoading,
    filter,
    setFilter,
    addLink,
    deleteLink,
    exportData,
  } = useLinks();

  const [showAddForm, setShowAddForm] = useState(false);
  const { offset: keyboardOffset, isOpen: keyboardOpen } = useKeyboardOffset();

  // When keyboard is open the categories row collapses, so bar is ~52px shorter.
  // Main content padding adjusts so the last card is never hidden behind the bar.
  const bottomBarHeight = keyboardOpen
    ? BOTTOM_BAR_BASE_HEIGHT - 48 // categories hidden
    : BOTTOM_BAR_BASE_HEIGHT;

  const categoryLabel =
    filter.category === "all"
      ? "All Links"
      : filter.category.charAt(0).toUpperCase() +
        filter.category.slice(1) +
        "s";

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <Header
        linkCount={links.length}
        onExport={exportData}
      />

      {/* ── Main content ── */}
      <main
        className="flex-1 px-4 md:px-6 py-6 max-w-5xl mx-auto w-full"
        style={{
          // Dynamically track bar height + any keyboard lift
          // so content is always scrollable above the bar
          paddingBottom: bottomBarHeight + keyboardOffset + 16,
          transition: "padding-bottom 120ms ease-out",
        }}
      >
        {/* Count + clear row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-bold text-base text-zinc-100">
              {categoryLabel}
            </h1>

            <p className="text-[11px] text-zinc-600 font-mono mt-0.5">
              {isLoading
                ? "Loading..."
                : `${filteredLinks.length} of ${links.length} links`}
              {filter.query && (
                <span className="text-zinc-500">
                  {" "}
                  · &ldquo;{filter.query}&rdquo;
                </span>
              )}
            </p>
          </div>

          {(filter.query || filter.category !== "all") && (
            <button
              onClick={() =>
                setFilter({ query: "", category: "all" })
              }
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all"
            >
              Clear ×
            </button>
          )}
        </div>

        {/* Cards */}
        <LinkGrid
          links={filteredLinks}
          isLoading={isLoading}
          onDelete={deleteLink}
          query={filter.query}
        />
      </main>

      {/* ── Floating Action Button ── */}
      <button
        onClick={() => setShowAddForm(true)}
        style={{
          bottom: bottomBarHeight + keyboardOffset + 16,
          transition: "bottom 120ms ease-out",
        }}
        className="fixed right-5 z-40 w-14 h-14 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-zinc-950 shadow-lg shadow-amber-400/20 flex items-center justify-center transition-all duration-150"
        aria-label="Add new link"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* ── Sticky bottom bar ── */}
      <BottomBar
        links={links}
        filter={filter}
        onCategoryChange={(cat: LinkCategory | "all") =>
          setFilter({ category: cat })
        }
        onQueryChange={(q) =>
          setFilter({ query: q })
        }
      />

      {/* ── Add link modal ── */}
      {showAddForm && (
        <AddLinkForm
          onAdd={addLink}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
