"use client";

/**
 * BottomBar — keyboard-aware sticky bottom bar.
 *
 * Behaviour mirrors WhatsApp / Telegram:
 *  - Bar sits at the bottom of the screen at rest.
 *  - When the software keyboard opens, the bar lifts up to sit directly
 *    above the keyboard — categories hide to maximise vertical space,
 *    only the search input remains visible.
 *  - When the keyboard closes, categories slide back in smoothly.
 *
 * Implementation notes:
 *  - We use CSS transform (translateY) to lift the bar, NOT animating `bottom`.
 *    Transform runs on the GPU compositor thread → no layout reflow → smooth
 *    on low-end Android devices where `bottom` animation causes jank.
 *  - Safe area inset (notch/home bar) is handled via padding-bottom in CSS.
 *  - useKeyboardOffset() abstracts the visualViewport measurement.
 */

import { useRef } from "react";
import { Search, X } from "lucide-react";
import { FilterState, LinkCategory, Link } from "@/types";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/categories";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";

interface BottomBarProps {
  links: Link[];
  filter: FilterState;
  onCategoryChange: (cat: LinkCategory | "all") => void;
  onQueryChange: (q: string) => void;
}

export function BottomBar({ links, filter, onCategoryChange, onQueryChange }: BottomBarProps) {
  const { offset, isOpen: keyboardOpen } = useKeyboardOffset();
  const searchRef = useRef<HTMLInputElement>(null);

  const countByCategory = links.reduce<Record<string, number>>((acc, l) => {
    acc[l.category] = (acc[l.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 bg-zinc-950 border-t border-zinc-800"
      style={{
        // Lift bar above keyboard using transform (compositor-only, no reflow)
        transform: `translateY(-${offset}px)`,
        transition: "transform 120ms ease-out",
        // Ensure content behind bar is never hidden under home indicator
        paddingBottom: keyboardOpen ? "0px" : "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* ── Category filters — hidden when keyboard is open ── */}
      <div
        style={{
          // Animate height rather than display:none for smooth collapse
          maxHeight: keyboardOpen ? "0px" : "56px",
          overflow: "hidden",
          transition: "max-height 120ms ease-out",
        }}
      >
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 px-4 pt-2.5 pb-2 min-w-max">
            {CATEGORY_KEYS.map(cat => {
              const meta     = CATEGORIES[cat];
              const count    = cat === "all" ? links.length : (countByCategory[cat] ?? 0);
              const isActive = filter.category === cat;

              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat as LinkCategory | "all")}
                  className={[
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                    "whitespace-nowrap border transition-all duration-150",
                    isActive
                      ? `${meta.bg} ${meta.color} ${meta.border}`
                      : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300",
                  ].join(" ")}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] font-mono ${isActive ? "opacity-60" : "text-zinc-700"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Search bar — always visible ── */}
      <div className="px-4 pt-1 pb-3">
        <div className="relative flex items-center max-w-5xl mx-auto">
          <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
          <input
            ref={searchRef}
            type="search"
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={keyboardOpen ? "Search links..." : "Search links..."}
            value={filter.query}
            onChange={e => onQueryChange(e.target.value)}
            className={[
              "w-full bg-zinc-900 border rounded-xl",
              "pl-9 pr-9 py-2.5",
              "text-sm text-zinc-100 placeholder:text-zinc-600",
              "outline-none transition-all duration-200 font-mono",
              keyboardOpen
                ? "border-amber-400/40 ring-2 ring-amber-400/10"
                : "border-zinc-800 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10",
            ].join(" ")}
          />
          {filter.query && (
            <button
              onMouseDown={e => {
                // Prevent the input losing focus before we clear
                e.preventDefault();
                onQueryChange("");
              }}
              className="absolute right-3 p-0.5 text-zinc-600 hover:text-zinc-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
