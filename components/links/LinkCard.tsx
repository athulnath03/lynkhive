"use client";

import { useState } from "react";
import { ExternalLink, Trash2, Calendar } from "lucide-react";
import { DevLink } from "@/types";
import { CATEGORIES } from "@/lib/categories";

interface LinkCardProps {
  link: DevLink;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
}

export function LinkCard({ link, onDelete, onTagClick }: LinkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const categoryMeta = CATEGORIES[link.category];

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 2500);
      return;
    }
    setIsDeleting(true);
    onDelete(link.id);
  };

  const hostname = (() => {
    try {
      return new URL(link.url).hostname.replace("www.", "");
    } catch {
      return link.url;
    }
  })();

  const formattedDate = new Date(link.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article
      className={`
        link-card animate-fade-in-up group relative
        glass rounded-xl border border-white/[0.06]
        hover:border-white/[0.12] hover:bg-white/[0.03]
        transition-all duration-200 overflow-hidden
        ${isDeleting ? "opacity-40 scale-95 pointer-events-none" : ""}
      `}
    >
      {/* Top accent line */}
      <div
        className={`absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        style={{
          background: `linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)`,
        }}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            {/* Category badge */}
            <span
              className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/[0.08] ${categoryMeta.bg} ${categoryMeta.color}`}
            >
              {categoryMeta.icon} {categoryMeta.label}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-white/10 text-zinc-500 hover:text-zinc-200 transition-colors"
              title="Open link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`p-1.5 rounded-md transition-all duration-150 ${
                showConfirm
                  ? "bg-red-500/20 text-red-400 scale-110"
                  : "hover:bg-red-500/10 text-zinc-600 hover:text-red-400"
              }`}
              title={showConfirm ? "Click again to confirm" : "Delete link"}
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
          className="block font-display text-sm font-bold text-zinc-100 hover:text-indigo-300 transition-colors duration-150 mb-1.5 leading-snug"
        >
          {link.title}
        </a>

        {/* Description */}
        <p className="text-xs text-zinc-500 leading-relaxed truncate-2 mb-3">
          {link.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          {/* Tags */}
          <div className="flex flex-wrap gap-1 min-w-0">
            {link.tags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className="text-[10px] font-mono text-zinc-600 hover:text-indigo-400 transition-colors duration-150"
              >
                #{tag}
              </button>
            ))}
            {link.tags.length > 4 && (
              <span className="text-[10px] font-mono text-zinc-700">
                +{link.tags.length - 4}
              </span>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-700 shrink-0">
            <Calendar className="w-2.5 h-2.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* URL strip */}
        <div className="mt-2 pt-2 border-t border-white/[0.04]">
          <span className="text-[10px] font-mono text-zinc-700 truncate block">
            {hostname}
          </span>
        </div>
      </div>
    </article>
  );
}
