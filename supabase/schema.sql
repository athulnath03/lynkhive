-- ============================================================
-- LynkHive — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- enables fast ILIKE / full-text on tags

-- ── Enum: link category ─────────────────────────────────────────────────────
-- Using an enum enforces valid categories at the DB level.
-- To add a new category: ALTER TYPE link_category ADD VALUE 'new_value';

CREATE TYPE link_category AS ENUM (
  'article',
  'tool',
  'github',
  'video',
  'docs',
  'tutorial',
  'library',
  'design',
  'other'
);

-- ── Table: categories (future-ready) ────────────────────────────────────────
-- Not currently wired to UI. Exists so the schema is ready when needed.

CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        NOT NULL,
  slug       TEXT        NOT NULL UNIQUE,
  icon       TEXT,
  color      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed built-in categories
INSERT INTO public.categories (name, slug, icon, color) VALUES
  ('Articles',  'article',  '✦', '#38bdf8'),
  ('Tools',     'tool',     '⚙', '#fbbf24'),
  ('GitHub',    'github',   '◉', '#c084fc'),
  ('Videos',    'video',    '▶', '#f87171'),
  ('Docs',      'docs',     '◎', '#34d399'),
  ('Tutorials', 'tutorial', '◆', '#fb923c'),
  ('Libraries', 'library',  '◇', '#f472b6'),
  ('Design',    'design',   '◐', '#818cf8'),
  ('Other',     'other',    '○', '#a1a1aa')
ON CONFLICT (slug) DO NOTHING;

-- ── Table: links ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.links (
  -- Identity
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core fields
  title       TEXT          NOT NULL,
  url         TEXT          NOT NULL,
  description TEXT,
  category    link_category NOT NULL DEFAULT 'other',
  tags        TEXT[]        NOT NULL DEFAULT '{}',

  -- Timestamps (updated_at maintained by trigger below)
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Future: auth ownership
  -- When you add Supabase Auth, set user_id = auth.uid() in RLS policies.
  user_id     UUID          REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Future: link sharing
  is_public   BOOLEAN       NOT NULL DEFAULT FALSE,

  -- Future: OG metadata, favicon URL, preview image, etc.
  metadata    JSONB
);

-- ── Trigger: auto-update updated_at ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER links_set_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ── Indexes ──────────────────────────────────────────────────────────────────

-- Newest-first queries (default sort)
CREATE INDEX idx_links_created_at  ON public.links (created_at DESC);

-- Category filter
CREATE INDEX idx_links_category    ON public.links (category);

-- Tag array containment search
CREATE INDEX idx_links_tags        ON public.links USING GIN (tags);

-- JSONB metadata queries
CREATE INDEX idx_links_metadata    ON public.links USING GIN (metadata);

-- Future: per-user queries
CREATE INDEX idx_links_user_id     ON public.links (user_id);

-- Full-text search on title + description (trigram for ILIKE)
CREATE INDEX idx_links_title_trgm  ON public.links USING GIN (title gin_trgm_ops);
CREATE INDEX idx_links_desc_trgm   ON public.links USING GIN (description gin_trgm_ops);

-- ── Row Level Security ───────────────────────────────────────────────────────
--
-- Currently: public read + write (no auth).
-- Future: restrict writes to authenticated owner by replacing these policies.
--
-- To lock down after adding auth:
--   DROP POLICY "Public read"   ON public.links;
--   DROP POLICY "Public insert" ON public.links;
--   DROP POLICY "Public delete" ON public.links;
--   DROP POLICY "Public update" ON public.links;
--
--   CREATE POLICY "Owner read"   ON public.links FOR SELECT USING (user_id = auth.uid());
--   CREATE POLICY "Owner insert" ON public.links FOR INSERT WITH CHECK (user_id = auth.uid());
--   CREATE POLICY "Owner update" ON public.links FOR UPDATE USING (user_id = auth.uid());
--   CREATE POLICY "Owner delete" ON public.links FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.links     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Links: open read/write (single-user app, no auth yet)
CREATE POLICY "Public read"   ON public.links FOR SELECT USING (TRUE);
CREATE POLICY "Public insert" ON public.links FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public update" ON public.links FOR UPDATE USING (TRUE);
CREATE POLICY "Public delete" ON public.links FOR DELETE USING (TRUE);

-- Categories: read-only for everyone
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (TRUE);

-- ── Seed data ─────────────────────────────────────────────────────────────────

INSERT INTO public.links (title, url, description, category, tags) VALUES
  (
    'Next.js App Router Docs',
    'https://nextjs.org/docs/app',
    'Official documentation for the Next.js App Router — routing, layouts, server components, and streaming.',
    'docs',
    ARRAY['nextjs', 'react', 'routing', 'ssr']
  ),
  (
    'Tailwind CSS',
    'https://tailwindcss.com',
    'A utility-first CSS framework for building modern interfaces without leaving your HTML.',
    'tool',
    ARRAY['css', 'design-system', 'tailwind']
  ),
  (
    'shadcn/ui',
    'https://ui.shadcn.com',
    'Beautifully designed components built with Radix UI and Tailwind CSS. Copy-paste into your project.',
    'library',
    ARRAY['ui', 'react', 'radix', 'components']
  ),
  (
    'Supabase',
    'https://supabase.com',
    'Open source Firebase alternative. Postgres database, Auth, realtime, storage, and Edge Functions.',
    'tool',
    ARRAY['backend', 'postgres', 'auth', 'database']
  ),
  (
    't3-oss/create-t3-app',
    'https://github.com/t3-oss/create-t3-app',
    'The best way to start a full-stack, typesafe Next.js app. Includes tRPC, Prisma, and Tailwind.',
    'github',
    ARRAY['nextjs', 'typescript', 'trpc', 'starter']
  ),
  (
    'Zod — TypeScript Schema Validation',
    'https://zod.dev',
    'TypeScript-first schema declaration and validation. Parse JSON, validate forms, type API responses.',
    'library',
    ARRAY['typescript', 'validation', 'forms']
  );
