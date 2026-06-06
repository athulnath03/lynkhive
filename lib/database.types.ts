/**
 * lib/database.types.ts
 *
 * Supabase-generated type definitions for the LynkHive database schema.
 *
 * To regenerate after schema changes:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
 *
 * Do not edit manually below the "Generated types" comment —
 * everything above it (helpers, overrides) is safe to modify.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// ─── Generated types ──────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      links: {
        Row: {
          id: string;
          title: string;
          url: string;
          description: string | null;
          category: string;
          tags: string[];
          created_at: string;
          updated_at: string;
          user_id: string | null;
          is_public: boolean;
          metadata: Json | null;
        };
        Insert: {
          id?: string;           // optional: Supabase generates UUID by default
          title: string;
          url: string;
          description?: string | null;
          category: string;
          tags?: string[];
          created_at?: string;   // optional: defaults to NOW()
          updated_at?: string;   // optional: defaults to NOW()
          user_id?: string | null;
          is_public?: boolean;   // optional: defaults to false
          metadata?: Json | null;
        };
        Update: {
          id?: never;            // id is immutable after insert
          title?: string;
          url?: string;
          description?: string | null;
          category?: string;
          tags?: string[];
          updated_at?: string;
          user_id?: string | null;
          is_public?: boolean;
          metadata?: Json | null;
        };
      };

      // Future: categories table (schema in supabase/schema.sql)
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          name?: string;
          slug?: string;
          icon?: string | null;
          color?: string | null;
        };
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      link_category:
        | "article"
        | "tool"
        | "github"
        | "video"
        | "docs"
        | "tutorial"
        | "library"
        | "design"
        | "other";
    };
  };
}

// ─── Convenience aliases ──────────────────────────────────────────────────────

export type DbLink     = Database["public"]["Tables"]["links"]["Row"];
export type DbLinkInsert = Database["public"]["Tables"]["links"]["Insert"];
export type DbLinkUpdate = Database["public"]["Tables"]["links"]["Update"];
export type DbCategory = Database["public"]["Tables"]["categories"]["Row"];
