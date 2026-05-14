/**
 * lib/linkRepository.ts
 *
 * Repository pattern: all CRUD operations live here.
 * Swap `mockRepository` for `supabaseRepository` in lib/db.ts
 * without touching any component or hook.
 */

import { DevLink, LinkRepository, NewLinkPayload } from "@/types";
import { mockLinks } from "@/data/links";
import { nanoid } from "nanoid";

// In-memory store (simulates a DB for the mock layer)
let store: DevLink[] = [...mockLinks];

export const mockRepository: LinkRepository = {
  async getAll(): Promise<DevLink[]> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 120));
    return [...store].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getById(id: string): Promise<DevLink | null> {
    return store.find((l) => l.id === id) ?? null;
  },

  async create(payload: NewLinkPayload): Promise<DevLink> {
    const newLink: DevLink = {
      ...payload,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };
    store = [newLink, ...store];
    return newLink;
  },

  async delete(id: string): Promise<void> {
    store = store.filter((l) => l.id !== id);
  },
};

// ─── Supabase stub (uncomment & fill when ready) ────────────────────────────
//
// import { createClient } from "@supabase/supabase-js";
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
//
// export const supabaseRepository: LinkRepository = {
//   async getAll() {
//     const { data, error } = await supabase.from("links").select("*").order("created_at", { ascending: false });
//     if (error) throw error;
//     return data;
//   },
//   async getById(id) {
//     const { data, error } = await supabase.from("links").select("*").eq("id", id).single();
//     if (error) throw error;
//     return data;
//   },
//   async create(payload) {
//     const { data, error } = await supabase.from("links").insert([payload]).select().single();
//     if (error) throw error;
//     return data;
//   },
//   async delete(id) {
//     const { error } = await supabase.from("links").delete().eq("id", id);
//     if (error) throw error;
//   },
// };
