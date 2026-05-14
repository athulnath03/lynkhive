-- ─── DevVault Supabase Schema ─────────────────────────────────────────────
-- Run this in the Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Links Table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.links (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL CHECK (category IN (
    'article', 'tool', 'github', 'video', 'docs', 'tutorial', 'library', 'design', 'other'
  )),
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Row Level Security ──────────────────────────────────────────────────────
-- Enable RLS (required for Supabase)
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read links (public vault)
CREATE POLICY "Anyone can read links"
  ON public.links FOR SELECT
  USING (true);

-- Allow anyone to insert links (no auth required for MVP)
CREATE POLICY "Anyone can insert links"
  ON public.links FOR INSERT
  WITH CHECK (true);

-- Allow anyone to delete links (swap for auth check in production)
CREATE POLICY "Anyone can delete links"
  ON public.links FOR DELETE
  USING (true);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
-- Fast category filtering
CREATE INDEX idx_links_category ON public.links(category);

-- Fast tag array search
CREATE INDEX idx_links_tags ON public.links USING GIN(tags);

-- Full text search index
CREATE INDEX idx_links_title_fts ON public.links USING GIN(to_tsvector('english', title));

-- ─── Sample Data ─────────────────────────────────────────────────────────────
INSERT INTO public.links (title, url, description, category, tags)
VALUES
  ('Next.js App Router Docs', 'https://nextjs.org/docs/app',
   'Official documentation for the Next.js App Router.',
   'docs', ARRAY['nextjs', 'react', 'routing']),
  ('Tailwind CSS', 'https://tailwindcss.com',
   'A utility-first CSS framework for building modern interfaces.',
   'tool', ARRAY['css', 'design-system', 'tailwind']),
  ('shadcn/ui', 'https://ui.shadcn.com',
   'Beautifully designed components built with Radix UI and Tailwind CSS.',
   'library', ARRAY['ui', 'react', 'components']);
