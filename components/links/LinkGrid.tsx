"use client";

import { DevLink } from "@/types";
import { LinkCard } from "./LinkCard";
import { SearchX } from "lucide-react";

interface LinkGridProps {
  links: DevLink[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
  query: string;
}

function SkeletonCard() {
  return (
    <div className="glass rounded-xl border border-white/[0.06] p-4 space-y-3">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-2/3" />
      <div className="flex gap-2 pt-1">
        <div className="skeleton h-3 w-10" />
        <div className="skeleton h-3 w-10" />
        <div className="skeleton h-3 w-10" />
      </div>
    </div>
  );
}

export function LinkGrid({
  links,
  isLoading,
  onDelete,
  onTagClick,
  query,
}: LinkGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-scale-in">
        <SearchX className="w-12 h-12 text-zinc-800 mb-4" />
        <p className="text-zinc-400 font-display font-bold text-lg mb-1">
          {query ? "No links found" : "Your vault is empty"}
        </p>
        <p className="text-zinc-600 text-sm font-mono">
          {query
            ? `No results for "${query}" — try different keywords`
            : "Add your first link using the button above"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {links.map((link) => (
        <LinkCard
          key={link.id}
          link={link}
          onDelete={onDelete}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
}
