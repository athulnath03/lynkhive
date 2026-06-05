// ─── Category ─────────────────────────────────────────────────────────────────

export type LinkCategory =
  | "article"
  | "tool"
  | "github"
  | "video"
  | "docs"
  | "tutorial"
  | "library"
  | "design"
  | "other";

// ─── Database row shapes (snake_case, mirrors Supabase column names) ──────────
// These are what comes back from Supabase queries. Nothing outside lib/storage.ts
// should ever see these types directly.

export interface DatabaseLink {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: LinkCategory;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string | null;       // future: auth ownership
  is_public: boolean;           // future: sharing
  metadata: Record<string, unknown> | null; // future: OG data, favicon, etc.
}

// Future-ready: categories table (not yet wired to UI)
export interface DatabaseCategory {
  id: string;
  name: string;
  slug: LinkCategory;
  icon: string;
  color: string;
  created_at: string;
}

// ─── Application types (camelCase, safe for components/hooks) ────────────────
// The storage layer maps DatabaseLink → Link before returning data.
// Components and hooks only ever work with Link.

export interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  category: LinkCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  isPublic: boolean;
  metadata: Record<string, unknown> | null;
}

// ─── Payload types ────────────────────────────────────────────────────────────

/** Fields required to create a new link. */
export type CreateLinkPayload = Pick<
  Link,
  "title" | "url" | "description" | "category" | "tags"
> & {
  isPublic?: boolean;
  metadata?: Record<string, unknown>;
};

/** All fields are optional for partial updates. */
export type UpdateLinkPayload = Partial<CreateLinkPayload>;

// ─── Storage contract ─────────────────────────────────────────────────────────
//
// Every storage provider (Supabase, Redis, JSON, etc.) must implement this
// interface. Nothing outside lib/storage.ts may import from a specific
// provider. All data access goes through this contract.

export interface LinkStorage {
  /** Fetch all links, newest first. */
  getLinks(): Promise<Link[]>;

  /** Fetch a single link by id. Returns null if not found. */
  getLink(id: string): Promise<Link | null>;

  /** Create a new link. Returns the persisted link with generated id + timestamps. */
  addLink(payload: CreateLinkPayload): Promise<Link>;

  /** Partially update a link. Returns the updated link. Throws if not found. */
  updateLink(id: string, payload: UpdateLinkPayload): Promise<Link>;

  /** Permanently delete a link by id. */
  deleteLink(id: string): Promise<void>;

  /** Return all links serialized for export. Storage layer owns the format. */
  exportLinks(): Promise<Link[]>;
}

// ─── UI state ─────────────────────────────────────────────────────────────────

export interface FilterState {
  query: string;
  category: LinkCategory | "all";
}

export interface UrlMeta {
  title: string;
  description: string;
  favicon?: string;
}
