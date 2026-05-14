// ─── Core Domain Types ──────────────────────────────────────────────────────

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

export interface DevLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: LinkCategory;
  tags: string[];
  createdAt: string; // ISO 8601
  favicon?: string;
}

// ─── UI / Filter Types ───────────────────────────────────────────────────────

export interface FilterState {
  query: string;
  category: LinkCategory | "all";
  tag: string | null;
}

// ─── Form Types ──────────────────────────────────────────────────────────────

export type NewLinkPayload = Omit<DevLink, "id" | "createdAt" | "favicon">;

// ─── Repository Interface (for future Supabase swap) ────────────────────────

export interface LinkRepository {
  getAll(): Promise<DevLink[]>;
  getById(id: string): Promise<DevLink | null>;
  create(payload: NewLinkPayload): Promise<DevLink>;
  delete(id: string): Promise<void>;
}
