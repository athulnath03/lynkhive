"use client";

import { Link } from "@/types";
import { LinkCard } from "./LinkCard";
import { SearchX, Layers } from "lucide-react";

interface LinkGridProps {
  links: Link[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  query: string;
}

function Skeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 animate-pulse">
      <div className="h-4 w-20 bg-zinc-800 rounded" />
      <div className="h-5 w-3/4 bg-zinc-800 rounded" />
      <div className="h-3 w-full bg-zinc-800 rounded" />
      <div className="h-3 w-2/3 bg-zinc-800 rounded" />
      <div className="flex gap-2 pt-1">
        {[1,2,3].map(i => <div key={i} className="h-3 w-12 bg-zinc-800 rounded" />)}
      </div>
    </div>
  );
}

export function LinkGrid({ links, isLoading, onDelete, query }: LinkGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        {query
          ? <SearchX className="w-10 h-10 text-zinc-800 mb-3" />
          : <Layers className="w-10 h-10 text-zinc-800 mb-3" />
        }
        <p className="text-zinc-400 font-bold text-base mb-1">
          {query ? "No results found" : "Your vault is empty"}
        </p>
        <p className="text-zinc-600 text-xs font-mono">
          {query ? `Nothing matched "${query}"` : "Add your first link above"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {links.map((link) => (
        <LinkCard key={link.id} link={link} onDelete={onDelete} />
      ))}
    </div>
  );
}
