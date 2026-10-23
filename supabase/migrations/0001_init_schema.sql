-- ════════════════════════════════════════════════════════════
-- Nexreff Creative Space — Database Schema & RLS Policies
-- ════════════════════════════════════════════════════════════
-- Run this in the Supabase Dashboard → SQL Editor.
-- It is idempotent — safe to run multiple times.
-- ════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- Extensions
-- ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- profiles table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Nexreff',
  username    TEXT,
  bio         TEXT,
  avatar_path TEXT,
  website     TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- media_assets table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media_assets (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL,
  description       TEXT,
  media_type        TEXT NOT NULL CHECK (media_type IN ('photography', 'artwork', 'guitar', 'video_journal')),
  category          TEXT NOT NULL,
  storage_path      TEXT,
  thumbnail_path    TEXT,
  external_url      TEXT,
  external_provider TEXT,
  mime_type         TEXT,
  file_size         BIGINT,
  width             INTEGER,
  height            INTEGER,
  duration          INTEGER,
  alt_text          TEXT,
  visibility        TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  captured_at       TIMESTAMPTZ,
  location          TEXT,
  camera            TEXT,
  lens              TEXT,
  tools             TEXT,
  genre             TEXT,
  song_title        TEXT,
  original_artist   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS media_assets_slug_idx ON public.media_assets (slug);

-- ──────────────────────────────────────────────
-- tags table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tags (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name  TEXT NOT NULL,
  slug  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS tags_slug_idx ON public.tags (slug);

-- ──────────────────────────────────────────────
-- media_tags junction table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media_tags (
  media_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  tag_id   UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (media_id, tag_id)
);

-- ──────────────────────────────────────────────
-- collections table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.collections (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL,
  description    TEXT,
  cover_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  visibility     TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS collections_slug_idx ON public.collections (slug);

-- ──────────────────────────────────────────────
-- collection_items junction table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.collection_items (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  media_id      UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, media_id)
);

-- ──────────────────────────────────────────────
-- journal_posts table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.journal_posts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL,
  excerpt        TEXT,
  content        TEXT,
  cover_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS journal_posts_slug_idx ON public.journal_posts (slug);

-- ──────────────────────────────────────────────
-- projects table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  thumbnail_path  TEXT,
  repository_url  TEXT,
  demo_url        TEXT,
  technologies    TEXT[] DEFAULT '{}',
  project_year    INTEGER,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'wip')),
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_idx ON public.projects (slug);

-- ──────────────────────────────────────────────
-- site_settings table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key   TEXT NOT NULL,
  setting_value TEXT NOT NULL DEFAULT '',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS site_settings_key_idx ON public.site_settings (setting_key);

-- ──────────────────────────────────────────────
-- Auto-update updated_at trigger function
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  CREATE TRIGGER media_assets_updated_at BEFORE UPDATE ON public.media_assets
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  CREATE TRIGGER collections_updated_at BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  CREATE TRIGGER journal_posts_updated_at BEFORE UPDATE ON public.journal_posts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Triggers already exist
END $$;

-- ════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_tags    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_posts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings   ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
-- Helper: is the current user authenticated?
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
  SELECT auth.uid() IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ──────────────────────────────────────────────
-- profiles policies
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_owner_update" ON public.profiles;
CREATE POLICY "profiles_owner_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_owner_insert" ON public.profiles;
CREATE POLICY "profiles_owner_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ──────────────────────────────────────────────
-- media_assets policies
-- Public can read published (visibility = 'public') assets.
-- Only authenticated users (admin) can insert, update, delete.
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "media_public_read" ON public.media_assets;
CREATE POLICY "media_public_read" ON public.media_assets
  FOR SELECT USING (visibility = 'public');

DROP POLICY IF EXISTS "media_admin_read_all" ON public.media_assets;
CREATE POLICY "media_admin_read_all" ON public.media_assets
  FOR SELECT USING (public.is_authenticated());

DROP POLICY IF EXISTS "media_admin_insert" ON public.media_assets;
CREATE POLICY "media_admin_insert" ON public.media_assets
  FOR INSERT WITH CHECK (public.is_authenticated());

DROP POLICY IF EXISTS "media_admin_update" ON public.media_assets;
CREATE POLICY "media_admin_update" ON public.media_assets
  FOR UPDATE USING (public.is_authenticated());

DROP POLICY IF EXISTS "media_admin_delete" ON public.media_assets;
CREATE POLICY "media_admin_delete" ON public.media_assets
  FOR DELETE USING (public.is_authenticated());

-- ──────────────────────────────────────────────
-- tags policies
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "tags_public_read" ON public.tags;
CREATE POLICY "tags_public_read" ON public.tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "tags_admin_write" ON public.tags;
CREATE POLICY "tags_admin_write" ON public.tags
  FOR ALL USING (public.is_authenticated());

-- ──────────────────────────────────────────────
-- media_tags policies
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "media_tags_public_read" ON public.media_tags;
CREATE POLICY "media_tags_public_read" ON public.media_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "media_tags_admin_write" ON public.media_tags;
CREATE POLICY "media_tags_admin_write" ON public.media_tags
  FOR ALL USING (public.is_authenticated());

-- ──────────────────────────────────────────────
-- collections policies
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "collections_public_read" ON public.collections;
CREATE POLICY "collections_public_read" ON public.collections
  FOR SELECT USING (visibility = 'public');

DROP POLICY IF EXISTS "collections_admin_read_all" ON public.collections;
CREATE POLICY "collections_admin_read_all" ON public.collections
  FOR SELECT USING (public.is_authenticated());

DROP POLICY IF EXISTS "collections_admin_insert" ON public.collections;
CREATE POLICY "collections_admin_insert" ON public.collections
  FOR INSERT WITH CHECK (public.is_authenticated());

DROP POLICY IF EXISTS "collections_admin_update" ON public.collections;
CREATE POLICY "collections_admin_update" ON public.collections
  FOR UPDATE USING (public.is_authenticated());

DROP POLICY IF EXISTS "collections_admin_delete" ON public.collections;
CREATE POLICY "collections_admin_delete" ON public.collections
  FOR DELETE USING (public.is_authenticated());

-- ──────────────────────────────────────────────
-- collection_items policies
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "collection_items_public_read" ON public.collection_items;
CREATE POLICY "collection_items_public_read" ON public.collection_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "collection_items_admin_write" ON public.collection_items;
CREATE POLICY "collection_items_admin_write" ON public.collection_items
  FOR ALL USING (public.is_authenticated());

-- ──────────────────────────────────────────────
-- journal_posts policies
-- Public can read published posts only.
-- Authenticated users can read, insert, update, delete all.
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "journal_public_read" ON public.journal_posts;
CREATE POLICY "journal_public_read" ON public.journal_posts
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "journal_admin_read_all" ON public.journal_posts;
CREATE POLICY "journal_admin_read_all" ON public.journal_posts
  FOR SELECT USING (public.is_authenticated());

DROP POLICY IF EXISTS "journal_admin_insert" ON public.journal_posts;
CREATE POLICY "journal_admin_insert" ON public.journal_posts
  FOR INSERT WITH CHECK (public.is_authenticated());

DROP POLICY IF EXISTS "journal_admin_update" ON public.journal_posts;
CREATE POLICY "journal_admin_update" ON public.journal_posts
  FOR UPDATE USING (public.is_authenticated());

DROP POLICY IF EXISTS "journal_admin_delete" ON public.journal_posts;
CREATE POLICY "journal_admin_delete" ON public.journal_posts
  FOR DELETE USING (public.is_authenticated());

-- ──────────────────────────────────────────────
-- projects policies
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "projects_public_read" ON public.projects;
CREATE POLICY "projects_public_read" ON public.projects
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "projects_admin_insert" ON public.projects;
CREATE POLICY "projects_admin_insert" ON public.projects
  FOR INSERT WITH CHECK (public.is_authenticated());

DROP POLICY IF EXISTS "projects_admin_update" ON public.projects;
CREATE POLICY "projects_admin_update" ON public.projects
  FOR UPDATE USING (public.is_authenticated());

DROP POLICY IF EXISTS "projects_admin_delete" ON public.projects;
CREATE POLICY "projects_admin_delete" ON public.projects
  FOR DELETE USING (public.is_authenticated());

-- ──────────────────────────────────────────────
-- site_settings policies
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "settings_public_read" ON public.site_settings;
CREATE POLICY "settings_public_read" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "settings_admin_write" ON public.site_settings;
CREATE POLICY "settings_admin_write" ON public.site_settings
  FOR ALL USING (public.is_authenticated());

-- ════════════════════════════════════════════════════════════
-- Seed default site settings
-- ════════════════════════════════════════════════════════════
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
  ('site_name', 'Nexreff Creative Space'),
  ('tagline', 'Capturing moments, drawing thoughts, and creating sounds.'),
  ('description', 'A personal creative space for photography, art, music, and code by Nexreff.'),
  ('github_url', 'https://github.com/ReffkiAndreaPratama'),
  ('instagram_url', ''),
  ('youtube_url', ''),
  ('twitter_url', ''),
  ('linkedin_url', ''),
  ('email', '')
ON CONFLICT (setting_key) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- Storage Policies
-- Run these AFTER creating the buckets in the Supabase Dashboard:
--   1. Go to Storage → New bucket
--   2. Create "public-media" (Public bucket)
--   3. Create "private-media" (Private bucket)
-- Then run the SQL below.
-- ════════════════════════════════════════════════════════════

-- Public media bucket: anyone can read, only authenticated can write/delete
DROP POLICY IF EXISTS "public_media_read" ON storage.objects;
CREATE POLICY "public_media_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'public-media');

DROP POLICY IF EXISTS "public_media_write" ON storage.objects;
CREATE POLICY "public_media_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'public-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "public_media_delete" ON storage.objects;
CREATE POLICY "public_media_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'public-media' AND auth.role() = 'authenticated');

-- Private media bucket: only authenticated can read (via signed URLs)
DROP POLICY IF EXISTS "private_media_read" ON storage.objects;
CREATE POLICY "private_media_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'private-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "private_media_write" ON storage.objects;
CREATE POLICY "private_media_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'private-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "private_media_delete" ON storage.objects;
CREATE POLICY "private_media_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'private-media' AND auth.role() = 'authenticated');
