"use client";

import { useState, useEffect, useCallback } from "react";
import { DevLink, FilterState, NewLinkPayload } from "@/types";

interface UseLinksReturn {
  links: DevLink[];
  filteredLinks: DevLink[];
  isLoading: boolean;
  error: string | null;
  filter: FilterState;
  setFilter: (f: Partial<FilterState>) => void;
  addLink: (payload: NewLinkPayload) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  allTags: string[];
}

export function useLinks(): UseLinksReturn {
  const [links, setLinks] = useState<DevLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilterState] = useState<FilterState>({
    query: "",
    category: "all",
    tag: null,
  });

  // ── Fetch all links ────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/links");
        if (!res.ok) throw new Error("Failed to fetch links");
        const data: DevLink[] = await res.json();
        setLinks(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // ── Filter logic (client-side, fast) ──────────────────────────────────────
  const filteredLinks = useCallback(() => {
    let result = [...links];

    // Category filter
    if (filter.category !== "all") {
      result = result.filter((l) => l.category === filter.category);
    }

    // Tag filter
    if (filter.tag) {
      result = result.filter((l) => l.tags.includes(filter.tag!));
    }

    // Full-text search
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
  }, [links, filter])();

  // ── Derived: all unique tags ───────────────────────────────────────────────
  const allTags = Array.from(new Set(links.flatMap((l) => l.tags))).sort();

  // ── Mutations ─────────────────────────────────────────────────────────────
  const addLink = useCallback(async (payload: NewLinkPayload) => {
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to add link");
    const newLink: DevLink = await res.json();
    setLinks((prev) => [newLink, ...prev]);
  }, []);

  const deleteLink = useCallback(async (id: string) => {
    await fetch(`/api/links?id=${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const setFilter = useCallback((f: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...f }));
  }, []);

  return {
    links,
    filteredLinks,
    isLoading,
    error,
    filter,
    setFilter,
    addLink,
    deleteLink,
    allTags,
  };
}
