import { LinkCategory } from "@/types";

export interface CategoryMeta {
  label: string;
  icon: string; // emoji or icon name
  color: string; // Tailwind text color class
  bg: string; // Tailwind bg class
}

export const CATEGORIES: Record<LinkCategory | "all", CategoryMeta> = {
  all: {
    label: "All Links",
    icon: "⚡",
    color: "text-zinc-300",
    bg: "bg-zinc-800",
  },
  article: {
    label: "Articles",
    icon: "📄",
    color: "text-sky-300",
    bg: "bg-sky-900/40",
  },
  tool: {
    label: "Tools",
    icon: "🔧",
    color: "text-amber-300",
    bg: "bg-amber-900/40",
  },
  github: {
    label: "GitHub",
    icon: "🐙",
    color: "text-purple-300",
    bg: "bg-purple-900/40",
  },
  video: {
    label: "Videos",
    icon: "🎬",
    color: "text-red-300",
    bg: "bg-red-900/40",
  },
  docs: {
    label: "Docs",
    icon: "📚",
    color: "text-emerald-300",
    bg: "bg-emerald-900/40",
  },
  tutorial: {
    label: "Tutorials",
    icon: "🎓",
    color: "text-orange-300",
    bg: "bg-orange-900/40",
  },
  library: {
    label: "Libraries",
    icon: "📦",
    color: "text-pink-300",
    bg: "bg-pink-900/40",
  },
  design: {
    label: "Design",
    icon: "🎨",
    color: "text-indigo-300",
    bg: "bg-indigo-900/40",
  },
  other: {
    label: "Other",
    icon: "🔗",
    color: "text-zinc-300",
    bg: "bg-zinc-800",
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as (
  | LinkCategory
  | "all"
)[];
