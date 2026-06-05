"use client";
import type { Link } from "@/types";
import { useState, useEffect, useRef, useCallback } from "react";
import { X, Plus, Link2, Loader2, CheckCircle, AlertCircle, Tag } from "lucide-react";
import { CreateLinkPayload, LinkCategory, UrlMeta } from "@/types";
import { CATEGORIES, CATEGORY_VALUES } from "@/lib/categories";

interface AddLinkFormProps {
onAdd: (payload: CreateLinkPayload) => Promise<Link>
  onClose: () => void;
}

type AnalyzeState = "idle" | "loading" | "done" | "error";
type StatusPhase  = "detecting" | "fetching" | "analyzing" | "";

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "article" as LinkCategory,
  tags: [] as string[],
};

// ── URL normalizer (mirrors your snippet) ───────────────────────────────────
function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function AddLinkForm({ onAdd, onClose }: AddLinkFormProps) {
  const [url, setUrl]                   = useState("");
  const [analyzeState, setAnalyzeState] = useState<AnalyzeState>("idle");
  const [statusPhase, setStatusPhase]   = useState<StatusPhase>("");
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [tagInput, setTagInput]         = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const urlRef       = useRef<HTMLInputElement>(null);
  const analyzeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { urlRef.current?.focus(); }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // ── Microlink analyzer (client-side, no server proxy needed) ───────────────
  const analyze = useCallback(async (rawUrl: string) => {
    const fixedUrl = normalizeUrl(rawUrl);
    try { new URL(fixedUrl); } catch { return; }

    setAnalyzeState("loading");

    try {
      // Phase 1
      setStatusPhase("detecting");
      await new Promise(r => setTimeout(r, 300));

      // Phase 2 — hit microlink
      setStatusPhase("fetching");
      const res = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(fixedUrl)}`
      );
      const result = await res.json();
      const data   = result.data || {};

      // Phase 3
      setStatusPhase("analyzing");
      await new Promise(r => setTimeout(r, 300));

      const finalTitle =
        data.title ||
        data.og?.title ||
        data.meta?.title ||
        "";

      const finalDescription =
        data.description ||
        data.og?.description ||
        data.meta?.description ||
        "";

      // Only pre-fill if user hasn't typed manually
      setForm(prev => ({
        ...prev,
        title:       prev.title       || finalTitle,
        description: prev.description || finalDescription,
      }));

      setAnalyzeState(finalTitle ? "done" : "error");
    } catch {
      setAnalyzeState("error");
    } finally {
      setStatusPhase("");
    }
  }, []);

  const handleUrlChange = (val: string) => {
    setUrl(val);
    setErrors(e => ({ ...e, url: "" }));
    if (analyzeTimer.current) {
      clearTimeout(analyzeTimer.current);
    }
    if (val.length > 8) {
      analyzeTimer.current = setTimeout(() => analyze(val), 800);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !form.tags.includes(tag)) {
      setForm(p => ({ ...p, tags: [...p.tags, tag] }));
    }
    setTagInput("");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!url.trim()) { e.url = "URL is required"; }
    else { try { new URL(normalizeUrl(url)); } catch { e.url = "Enter a valid URL"; } }
    if (!form.title.trim()) { e.title = "Title is required"; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onAdd({ url: normalizeUrl(url), ...form });
      onClose();
    } catch {
      setErrors({ url: "Failed to save. Try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusText: Record<StatusPhase, string> = {
    detecting: "Detecting website...",
    fetching:  "Fetching metadata...",
    analyzing: "Analyzing content...",
    "":        "",
  };

  const showPreview = analyzeState !== "idle" || form.title;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="font-bold text-sm text-zinc-100">Add New Link</h2>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Paste a URL — metadata auto-detected
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* URL */}
          <section>
            <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">
              URL
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
              <input
                ref={urlRef}
                type="url"
                placeholder="https://..."
                value={url}
                onChange={e => handleUrlChange(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10 rounded-lg pl-9 pr-10 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all font-mono"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {analyzeState === "loading" && <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
                {analyzeState === "done"    && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                {analyzeState === "error"   && <AlertCircle className="w-3.5 h-3.5 text-zinc-600" />}
              </div>
            </div>

            {/* Status line */}
            {analyzeState === "loading" && statusPhase && (
              <p className="text-[11px] font-mono text-amber-400/70 mt-1.5 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                {statusText[statusPhase]}
              </p>
            )}
            {analyzeState === "done" && (
              <p className="text-[11px] font-mono text-emerald-500/70 mt-1.5">
                Metadata generated successfully
              </p>
            )}
            {analyzeState === "error" && (
              <p className="text-[11px] font-mono text-zinc-600 mt-1.5">
                Unable to analyze — fill in manually below.
              </p>
            )}
            {errors.url && (
              <p className="text-[11px] font-mono text-red-400 mt-1.5">{errors.url}</p>
            )}
          </section>

          {/* Preview fields — appear after analysis or if user starts typing */}
          {showPreview && (
            <section className="space-y-4">
              <div className="h-px bg-zinc-800" />

              {/* Title */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">
                  Title
                  {analyzeState === "done" && (
                    <span className="normal-case text-emerald-500/60 tracking-normal">
                      auto-detected · editable
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js App Router Guide"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
                />
                {errors.title && <p className="text-[11px] font-mono text-red-400 mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">
                  Description
                  {analyzeState === "done" && (
                    <span className="normal-case text-emerald-500/60 tracking-normal">
                      auto-detected · editable
                    </span>
                  )}
                </label>
                <textarea
                  placeholder="What is this resource about?"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_VALUES.map(cat => {
                    const m = CATEGORIES[cat];
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, category: cat }))}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all duration-150 ${
                          form.category === cat
                            ? `${m.bg} ${m.color} ${m.border}`
                            : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-600 hover:text-zinc-300"
                        }`}
                      >
                        {m.icon} {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add tag, press Enter"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-amber-400/60 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-amber-400/40 text-zinc-400 hover:text-amber-400 transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5" />
                  </button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        #{tag}
                        <button
                          onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-zinc-800 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || analyzeState === "loading"}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
              : <><Plus className="w-3.5 h-3.5" /> Save Link</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
