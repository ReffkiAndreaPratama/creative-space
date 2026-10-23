import { supabase } from "./supabase";

// ──────────────────────────────────────────────
// Storage helpers — upload/download files from Supabase Storage
// ──────────────────────────────────────────────

export const BUCKETS = {
  PUBLIC_MEDIA: "public-media",
  PRIVATE_MEDIA: "private-media",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

/** Allowed image MIME types. */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/** Allowed video MIME types. */
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"] as const;

/** Max file sizes (Supabase free tier allows 50 MB per upload). */
export const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

export type UploadQuality = "original" | "high" | "optimized";

export interface UploadResult {
  path: string;
  publicUrl: string | null;
  bucket: BucketName;
}

export interface UploadOptions {
  bucket: BucketName;
  file: File;
  fileName: string;
  quality?: UploadQuality;
  onProgress?: (percent: number) => void;
}

/**
 * Validate a file before upload — checks MIME type and size.
 * Returns an error message string if invalid, null if valid.
 */
export function validateFile(
  file: File,
  type: "image" | "video"
): string | null {
  const allowedTypes =
    type === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
  const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

  // Validate MIME type (not just extension)
  if (!(allowedTypes as readonly string[]).includes(file.type)) {
    const allowed = allowedTypes.join(", ");
    return `File type "${file.type}" is not allowed. Allowed: ${allowed}`;
  }

  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
    return `File size ${sizeMB} MB exceeds the ${maxMB} MB limit.`;
  }

  return null;
}

/**
 * Upload a file to Supabase Storage with progress tracking.
 */
export async function uploadFile(
  options: UploadOptions
): Promise<UploadResult> {
  const { bucket, file, fileName, onProgress } = options;

  // Use Supabase's upload with upsert false to avoid overwriting
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get the public URL for public bucket
  let publicUrl: string | null = null;
  if (bucket === BUCKETS.PUBLIC_MEDIA) {
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    publicUrl = urlData.publicUrl;
  }

  // Simulate progress completion if callback provided
  if (onProgress) onProgress(100);

  return {
    path: data.path,
    publicUrl,
    bucket,
  };
}

/**
 * Create a signed URL for a file in a private bucket.
 * The URL expires after the specified duration (default 1 hour).
 */
export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(
  bucket: BucketName,
  path: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Get the public URL for a file in a public bucket.
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Check whether a media asset uses external hosting (e.g. YouTube embed).
 */
export function isExternalMedia(
  externalUrl: string | null
): boolean {
  return Boolean(externalUrl && externalUrl.trim().length > 0);
}

/**
 * Extract a YouTube video ID from various URL formats.
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Get a YouTube thumbnail URL from a video ID.
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Get a YouTube embed URL from a video ID.
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}
