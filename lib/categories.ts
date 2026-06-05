import { LinkCategory } from "@/types";

export interface CategoryMeta {
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}

export const CATEGORIES: Record<LinkCategory | "all", CategoryMeta> = {
  all:      { label: "All",       icon: "◈", color: "text-zinc-200",   bg: "bg-zinc-800",      border: "border-zinc-700" },
  article:  { label: "Articles",  icon: "✦", color: "text-sky-300",    bg: "bg-sky-950",       border: "border-sky-800" },
  tool:     { label: "Tools",     icon: "⚙", color: "text-amber-300",  bg: "bg-amber-950",     border: "border-amber-800" },
  github:   { label: "Repos",     icon: "◉", color: "text-purple-300", bg: "bg-purple-950",    border: "border-purple-800" },
  video:    { label: "Videos",    icon: "▶", color: "text-red-300",    bg: "bg-red-950",       border: "border-red-800" },
  docs:     { label: "Docs",      icon: "◎", color: "text-emerald-300",bg: "bg-emerald-950",   border: "border-emerald-800" },
  tutorial: { label: "Tutorials", icon: "◆", color: "text-orange-300", bg: "bg-orange-950",    border: "border-orange-800" },
  library:  { label: "Libraries", icon: "◇", color: "text-pink-300",   bg: "bg-pink-950",      border: "border-pink-800" },
  design:   { label: "Design",    icon: "◐", color: "text-indigo-300", bg: "bg-indigo-950",    border: "border-indigo-800" },
  other:    { label: "Other",     icon: "○", color: "text-zinc-400",   bg: "bg-zinc-900",      border: "border-zinc-700" },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as (LinkCategory | "all")[];
export const CATEGORY_VALUES = CATEGORY_KEYS.filter((k) => k !== "all") as LinkCategory[];
