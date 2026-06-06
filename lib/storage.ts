import { supabase } from "@/lib/supabase";
import type { DbLink } from "@/lib/database.types";
import type {
  Link,
  LinkStorage,
  CreateLinkPayload,
  UpdateLinkPayload,
  LinkCategory,
} from "@/types";

const db = supabase as any;

function toLink(row: DbLink): Link {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    description: row.description ?? "",
    category: row.category as LinkCategory,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
    isPublic: row.is_public,
    metadata: (row.metadata as Record<string, unknown>) ?? null,
  };
}

class SupabaseStorage implements LinkStorage {
  async getLinks(): Promise<Link[]> {
    const { data, error } = await db
      .from("links")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(toLink);
  }

  async getLink(id: string): Promise<Link | null> {
    const { data, error } = await db
      .from("links")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toLink(data) : null;
  }

  async addLink(payload: CreateLinkPayload): Promise<Link> {
    const { data, error } = await db
      .from("links")
      .insert({
        title: payload.title.trim(),
        url: payload.url.trim(),
        description: payload.description?.trim() ?? null,
        category: payload.category,
        tags: payload.tags ?? [],
        is_public: payload.isPublic ?? false,
        metadata: payload.metadata ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toLink(data);
  }

  async updateLink(id: string, payload: UpdateLinkPayload): Promise<Link> {
    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (payload.title !== undefined) update.title = payload.title.trim();
    if (payload.url !== undefined) update.url = payload.url.trim();
    if (payload.description !== undefined) update.description = payload.description.trim();
    if (payload.category !== undefined) update.category = payload.category;
    if (payload.tags !== undefined) update.tags = payload.tags;
    if (payload.isPublic !== undefined) update.is_public = payload.isPublic;
    if (payload.metadata !== undefined) update.metadata = payload.metadata;
    const { data, error } = await db
      .from("links")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toLink(data);
  }

  async deleteLink(id: string): Promise<void> {
    const { error } = await db.from("links").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async exportLinks(): Promise<Link[]> {
    return this.getLinks();
  }
}

export class NotFoundError extends Error {
  constructor(id: string) {
    super(`Link not found: ${id}`);
  }
}

export const storage: LinkStorage = new SupabaseStorage();
