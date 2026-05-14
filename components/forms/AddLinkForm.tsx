"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Link2, Tag, AlignLeft, FolderOpen } from "lucide-react";
import { NewLinkPayload, LinkCategory } from "@/types";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/categories";

interface AddLinkFormProps {
  onAdd: (payload: NewLinkPayload) => Promise<void>;
  onClose: () => void;
}

const INITIAL: NewLinkPayload = {
  title: "",
  url: "",
  description: "",
  category: "article",
  tags: [],
};

export function AddLinkForm({ onAdd, onClose }: AddLinkFormProps) {
  const [form, setForm] = useState<NewLinkPayload>(INITIAL);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof NewLinkPayload, string>>>({});
  const titleRef = useRef<HTMLInputElement>(null);

  // Trap focus on mount
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !form.tags.includes(tag)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NewLinkPayload, string>> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.url.trim()) {
      newErrors.url = "URL is required";
    } else {
      try {
        new URL(form.url);
      } catch {
        newErrors.url = "Enter a valid URL (include https://)";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onAdd(form);
      onClose();
    } catch (err) {
      setErrors({ title: "Failed to save link. Try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal */}
      <div className="glass-elevated rounded-2xl border border-white/[0.10] w-full max-w-lg animate-scale-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="font-display font-bold text-base">Add New Link</h2>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Save a resource to your vault
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Title */}
          <Field label="Title" icon={<AlignLeft className="w-3 h-3" />} error={errors.title}>
            <input
              ref={titleRef}
              type="text"
              placeholder="e.g. React Query v5 Guide"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="input-base"
            />
          </Field>

          {/* URL */}
          <Field label="URL" icon={<Link2 className="w-3 h-3" />} error={errors.url}>
            <input
              type="url"
              placeholder="https://..."
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              className="input-base font-mono text-xs"
            />
          </Field>

          {/* Description */}
          <Field label="Description" icon={<AlignLeft className="w-3 h-3" />}>
            <textarea
              placeholder="Brief description of what this resource covers..."
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={2}
              className="input-base resize-none"
            />
          </Field>

          {/* Category */}
          <Field label="Category" icon={<FolderOpen className="w-3 h-3" />}>
            <div className="flex flex-wrap gap-1.5">
              {(CATEGORY_KEYS.filter((k) => k !== "all") as LinkCategory[]).map(
                (cat) => {
                  const meta = CATEGORIES[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, category: cat }))}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all duration-150 ${
                        form.category === cat
                          ? `${meta.bg} ${meta.color} border-white/20`
                          : "bg-white/[0.03] text-zinc-500 border-white/[0.06] hover:border-white/[0.12]"
                      }`}
                    >
                      {meta.icon} {meta.label}
                    </button>
                  );
                }
              )}
            </div>
          </Field>

          {/* Tags */}
          <Field label="Tags" icon={<Tag className="w-3 h-3" />}>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="input-base flex-1"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 border border-white/[0.08] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] border border-white/[0.06] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Save Link
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .input-base {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          color: #f4f4f5;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input-base::placeholder {
          color: #52525b;
        }
        .input-base:focus {
          outline: none;
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
}

// ─── Sub-component: Field wrapper ────────────────────────────────────────────
function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
        {icon}
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-400 font-mono">{error}</p>}
    </div>
  );
}
