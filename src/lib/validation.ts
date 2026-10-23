// ──────────────────────────────────────────────
// Validation helpers — client-side input validation
// ──────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/** Validate an email address format. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate a URL format. */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Validate a GitHub username (alphanumeric and hyphens, 1-39 chars). */
export function isValidGitHubUsername(username: string): boolean {
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38}[a-zA-Z0-9])?$/.test(username);
}

/** Sanitize text input — trim and collapse whitespace. */
export function sanitizeText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

/**
 * Basic HTML sanitizer for journal post content.
 * Removes script tags, event handlers, and dangerous attributes.
 * This is a first line of defense; content is also protected by Supabase RLS
 * and should be rendered with React's built-in XSS protection.
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags entirely
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Remove event handler attributes (on*)
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, "");
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*'[^']*'/gi, "");
  // Remove javascript: URLs
  cleaned = cleaned.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  // Remove iframe tags (video embeds are handled separately)
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  return cleaned;
}

/** Validate media asset metadata before saving. */
export function validateMediaMetadata(data: {
  title: string;
  media_type: string;
  category: string;
}): string[] {
  const errors: string[] = [];
  if (!data.title || data.title.trim().length === 0) {
    errors.push("Title is required.");
  }
  if (data.title && data.title.length > 200) {
    errors.push("Title must be 200 characters or less.");
  }
  if (!data.media_type) {
    errors.push("Media type is required.");
  }
  if (!data.category) {
    errors.push("Category is required.");
  }
  return errors;
}

/** Validate journal post data before saving. */
export function validateJournalPost(data: {
  title: string;
  content: string | null;
}): string[] {
  const errors: string[] = [];
  if (!data.title || data.title.trim().length === 0) {
    errors.push("Title is required.");
  }
  if (data.title && data.title.length > 200) {
    errors.push("Title must be 200 characters or less.");
  }
  if (!data.content || data.content.trim().length === 0) {
    errors.push("Content is required.");
  }
  return errors;
}

/** Validate collection data before saving. */
export function validateCollection(data: {
  title: string;
}): string[] {
  const errors: string[] = [];
  if (!data.title || data.title.trim().length === 0) {
    errors.push("Collection title is required.");
  }
  if (data.title && data.title.length > 200) {
    errors.push("Collection title must be 200 characters or less.");
  }
  return errors;
}

/** Validate project data before saving. */
export function validateProject(data: {
  title: string;
  project_year: number | null;
}): string[] {
  const errors: string[] = [];
  if (!data.title || data.title.trim().length === 0) {
    errors.push("Project title is required.");
  }
  if (data.project_year !== null && data.project_year !== undefined) {
    const year = data.project_year;
    if (year < 1900 || year > 2100) {
      errors.push("Project year must be between 1900 and 2100.");
    }
  }
  return errors;
}
