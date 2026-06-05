"use client";

import { useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { Link } from "@/types";
import { CATEGORIES } from "@/lib/categories";

interface LinkCardProps {
  link: Link;
  onDelete: (id: string) => void;
}

export function LinkCard({ link, onDelete }: LinkCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const meta = CATEGORIES[link.category];

  const hostname = (() => {
    try { return new URL(link.url).hostname.replace("www.", ""); }
    catch { return link.url; }
  })();

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
      return;
    }
    setDeleting(true);
    onDelete(link.id);
  };

  const date = new Date(link.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });

  return (
    <article
      className={`
        group relative bg-zinc-900 border border-zinc-800
        hover:border-zinc-700 hover:bg-zinc-800/80
        rounded-xl transition-all duration-200 overflow-hidden
        ${deleting ? "opacity-30 scale-95 pointer-events-none" : ""}
      `}
    >
      <div className="p-4">
        {/* Category + Actions */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-md border ${meta.bg} ${meta.color} ${meta.border}`}>
            {meta.icon} {meta.label}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={handleDelete}
              className={`p-1.5 rounded-md transition-all ${
                confirmDelete
                  ? "bg-red-500/20 text-red-400"
                  : "text-zinc-600 hover:text-red-400 hover:bg-red-500/10"
              }`}
              title={confirmDelete ? "Click again to confirm delete" : "Delete"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-bold text-zinc-100 hover:text-amber-400 transition-colors duration-150 mb-1.5 leading-snug"
        >
          {link.title}
        </a>

        {/* Description */}
        {link.description && (
          <p className="text-xs text-zinc-500 leading-relaxed mb-3 line-clamp-2">
            {link.description}
          </p>
        )}

        {/* Tags */}
        {link.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {link.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
            {link.tags.length > 4 && (
              <span className="text-[10px] font-mono text-zinc-700">+{link.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <span className="text-[10px] font-mono text-zinc-700 truncate max-w-[140px]">
            {hostname}
          </span>
          <span className="text-[10px] font-mono text-zinc-700 shrink-0">{date}</span>
        </div>
      </div>
    </article>
  );
}
