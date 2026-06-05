"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, FilterState, CreateLinkPayload, UpdateLinkPayload } from "@/types";

export function useLinks() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilterState] = useState<FilterState>({
    query: "",
    category: "all",
  });

  // ── Fetch all links ────────────────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/links")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Link[]) => setLinks(data))
      .catch((e) => setError(e.message ?? "Failed to load links"))
      .finally(() => setIsLoading(false));
  }, []);

  // ── Client-side filter (instant, no round-trip) ────────────────────────────

  const filteredLinks = (() => {
    let result = [...links];

    if (filter.category !== "all") {
      result = result.filter((l) => l.category === filter.category);
    }

    if (filter.query.trim()) {
      const q = filter.query.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)) ||
          l.category.toLowerCase().includes(q)
      );
    }

    return result;
  })();

  // ── Mutations ─────────────────────────────────────────────────────────────

  const addLink = useCallback(async (payload: CreateLinkPayload) => {
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? "Failed to add link");
    }
    const newLink: Link = await res.json();
    setLinks((prev) => [newLink, ...prev]);
    return newLink;
  }, []);

  const updateLink = useCallback(async (id: string, payload: UpdateLinkPayload) => {
    const res = await fetch("/api/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? "Failed to update link");
    }
    const updated: Link = await res.json();
    setLinks((prev) => prev.map((l) => (l.id === id ? updated : l)));
    return updated;
  }, []);

  const deleteLink = useCallback(async (id: string) => {
    const res = await fetch(`/api/links?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      throw new Error(error ?? "Failed to delete link");
    }
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // ── Export ────────────────────────────────────────────────────────────────

  const exportData = useCallback(() => {
    const a = document.createElement("a");
    a.href = "/api/export";
    a.download = "lynkhive-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const setFilter = useCallback((f: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...f }));
  }, []);

  const allTags = Array.from(new Set(links.flatMap((l) => l.tags))).sort();

  return {
    links,
    filteredLinks,
    isLoading,
    error,
    filter,
    setFilter,
    addLink,
    updateLink,
    deleteLink,
    exportData,
    allTags,
  };
}
