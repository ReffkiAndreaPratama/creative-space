// ──────────────────────────────────────────────
// Database Types — mirrors the Supabase PostgreSQL schema
// ──────────────────────────────────────────────

export type MediaType =
  | "photography"
  | "artwork"
  | "guitar"
  | "video_journal";

export type Visibility = "public" | "private";

export type ContentStatus = "draft" | "published";

export type ProjectStatus = "active" | "archived" | "wip";

// ── profiles ──
export interface Profile {
  id: string;
  display_name: string;
  username: string | null;
  bio: string | null;
  avatar_path: string | null;
  website: string | null;
  social_links: SocialLinks | null;
  created_at: string;
  updated_at: string;
}

export interface SocialLinks {
  github?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
  email?: string;
}

// ── media_assets ──
export interface MediaAsset {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  media_type: MediaType;
  category: string;
  storage_path: string | null;
  thumbnail_path: string | null;
  external_url: string | null;
  external_provider: string | null;
  mime_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  alt_text: string | null;
  visibility: Visibility;
  is_featured: boolean;
  captured_at: string | null;
  // Optional metadata fields
  location: string | null;
  camera: string | null;
  lens: string | null;
  tools: string | null;
  genre: string | null;
  song_title: string | null;
  original_artist: string | null;
  created_at: string;
  updated_at: string;
}

// ── tags ──
export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// ── media_tags ──
export interface MediaTag {
  media_id: string;
  tag_id: string;
}

// ── collections ──
export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_media_id: string | null;
  visibility: Visibility;
  created_at: string;
  updated_at: string;
}

// ── collection_items ──
export interface CollectionItem {
  collection_id: string;
  media_id: string;
  sort_order: number;
}

// ── journal_posts ──
export interface JournalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_media_id: string | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── projects ──
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_path: string | null;
  repository_url: string | null;
  demo_url: string | null;
  technologies: string[] | null;
  project_year: number | null;
  status: ProjectStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// ── site_settings ──
export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  updated_at: string;
}

// ── Composite / query result types ──
export interface MediaAssetWithTags extends MediaAsset {
  tags?: Tag[];
}

export interface JournalPostWithCover extends JournalPost {
  cover_media?: Pick<MediaAsset, "id" | "storage_path" | "thumbnail_path" | "alt_text" | "external_url"> | null;
}

export interface CollectionWithCover extends Collection {
  cover_media?: Pick<MediaAsset, "id" | "storage_path" | "thumbnail_path" | "alt_text"> | null;
  item_count?: number;
}

// ── Category definitions ──
export const PHOTOGRAPHY_CATEGORIES = [
  "Portrait",
  "Nature",
  "Landscape",
  "Street Photography",
  "Architecture",
  "Night Photography",
  "Experimental Photography",
  "Other",
] as const;

export const ARTWORK_CATEGORIES = [
  "Pencil Sketch",
  "Black and White",
  "Digital Art",
  "Illustration",
  "Character Design",
  "Study Sketch",
  "Experimental Art",
] as const;

export const GUITAR_CATEGORIES = [
  "Cover",
  "Acoustic Session",
  "Electric Guitar Session",
  "Fingerstyle",
  "Practice Session",
  "Original Music",
  "Music Experiment",
] as const;

export const VIDEO_JOURNAL_CATEGORIES = [
  "Cinematic Shots",
  "Daily Moments",
  "Short Films",
  "Creative Experiments",
  "Behind the Scenes",
  "Travel Videos",
] as const;

export const PROJECT_STATUSES = ["active", "archived", "wip"] as const;

// ── Sort options ──
export type SortOption = "newest" | "oldest" | "title";
