-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── LINKS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.links (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL CHECK (
    category IN (
      'article', 'tool', 'github', 'video',
      'docs', 'tutorial', 'library', 'design', 'other'
    )
  ),
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── RLS ENABLE ─────────────────────────────────────────────
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- ─── USER-BASED POLICIES ────────────────────────────────────

CREATE POLICY "Users can view their own links"
ON public.links
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own links"
ON public.links
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links"
ON public.links
FOR DELETE
USING (auth.uid() = user_id);

-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_links_category ON public.links(category);
CREATE INDEX IF NOT EXISTS idx_links_tags ON public.links USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_links_title_fts ON public.links USING GIN(to_tsvector('english', title));
