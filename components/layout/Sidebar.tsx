"use client";

import { DevLink, FilterState, LinkCategory } from "@/types";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/categories";

interface SidebarProps {
  links: DevLink[];
  filter: FilterState;
  onCategoryChange: (cat: LinkCategory | "all") => void;
  onTagClick: (tag: string | null) => void;
  allTags: string[];
  isOpen: boolean;
}

export function Sidebar({
  links,
  filter,
  onCategoryChange,
  onTagClick,
  allTags,
  isOpen,
}: SidebarProps) {
  // Count per category
  const countByCategory = links.reduce<Record<string, number>>((acc, l) => {
    acc[l.category] = (acc[l.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <aside
      className={`
        fixed md:relative z-30 inset-y-0 left-0 w-56 shrink-0
        glass border-r border-white/[0.06]
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        pt-14 md:pt-0 overflow-y-auto
      `}
    >
      <div className="p-3 space-y-6">
        {/* Categories */}
        <section>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 px-2 mb-2">
            Categories
          </p>
          <nav className="space-y-0.5">
            {CATEGORY_KEYS.map((cat) => {
              const meta = CATEGORIES[cat];
              const count =
                cat === "all"
                  ? links.length
                  : (countByCategory[cat] ?? 0);
              const isActive = filter.category === cat;

              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat as LinkCategory | "all")}
                  className={`
                    w-full flex items-center justify-between px-2 py-1.5 rounded-md
                    text-xs transition-all duration-150 group
                    ${
                      isActive
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span>{meta.icon}</span>
                    <span className="font-medium">{meta.label}</span>
                  </span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-indigo-500/30 text-indigo-300"
                          : "bg-white/[0.05] text-zinc-600 group-hover:text-zinc-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </section>

        {/* Tags */}
        {allTags.length > 0 && (
          <section>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 px-2 mb-2">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5 px-1">
              {allTags.slice(0, 20).map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    onTagClick(filter.tag === tag ? null : tag)
                  }
                  className={`
                    text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all duration-150
                    ${
                      filter.tag === tag
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                        : "bg-white/[0.03] text-zinc-500 border-white/[0.06] hover:text-zinc-300 hover:border-white/[0.12]"
                    }
                  `}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}
