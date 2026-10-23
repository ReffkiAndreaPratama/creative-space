import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { MediaAsset, MediaType, SortOption } from "@/types/database";
import { useToast } from "./use-toast";

// ──────────────────────────────────────────────
// Public queries
// ──────────────────────────────────────────────

interface MediaQueryParams {
  mediaType: MediaType;
  category?: string;
  search?: string;
  sort?: SortOption;
  visibility?: "public" | "all";
}

export function useMedia(params: MediaQueryParams) {
  const { mediaType, category, search, sort = "newest", visibility = "public" } = params;

  return useQuery({
    queryKey: ["media", mediaType, category, search, sort, visibility],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];

      let query = supabase
        .from("media_assets")
        .select("*")
        .eq("media_type", mediaType);

      if (visibility === "public") {
        query = query.eq("visibility", "public");
      }

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      switch (sort) {
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "title":
          query = query.order("title", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as MediaAsset[]) ?? [];
    },
    enabled: isSupabaseConfigured,
  });
}

/** Fetch featured media for the home page. */
export function useFeaturedMedia(mediaType?: MediaType) {
  return useQuery({
    queryKey: ["media", "featured", mediaType],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];

      let query = supabase
        .from("media_assets")
        .select("*")
        .eq("is_featured", true)
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(6);

      if (mediaType) {
        query = query.eq("media_type", mediaType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as MediaAsset[]) ?? [];
    },
    enabled: isSupabaseConfigured,
  });
}

/** Fetch latest media across all types for the home page. */
export function useLatestMedia(limit = 8) {
  return useQuery({
    queryKey: ["media", "latest", limit],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as MediaAsset[]) ?? [];
    },
    enabled: isSupabaseConfigured,
  });
}

/** Cross-content search across all media types. */
export function useSearchMedia(search: string) {
  return useQuery({
    queryKey: ["media", "search", search],
    queryFn: async () => {
      if (!isSupabaseConfigured || !search.trim()) return [];

      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .eq("visibility", "public")
        .or(`title.ilike.%${search}%,description.ilike.%${search}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data as MediaAsset[]) ?? [];
    },
    enabled: isSupabaseConfigured && search.trim().length > 0,
  });
}

// ──────────────────────────────────────────────
// Admin queries
// ──────────────────────────────────────────────

/** Fetch all media (admin view — includes private/draft). */
export function useAdminMedia(params: Omit<MediaQueryParams, "visibility">) {
  return useMedia({ ...params, visibility: "all" });
}

/** Create a new media asset record. */
export function useCreateMedia() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<MediaAsset, "id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("media_assets")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as MediaAsset;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media"] });
      toast({ type: "success", title: "Media created successfully" });
    },
    onError: (error: Error) => {
      toast({ type: "error", title: "Failed to create media", message: error.message });
    },
  });
}

/** Update a media asset. */
export function useUpdateMedia() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<MediaAsset>;
    }) => {
      const { data: result, error } = await supabase
        .from("media_assets")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result as MediaAsset;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media"] });
      toast({ type: "success", title: "Media updated" });
    },
    onError: (error: Error) => {
      toast({ type: "error", title: "Failed to update media", message: error.message });
    },
  });
}

/** Delete a media asset (and optionally its file). */
export function useDeleteMedia() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (media: MediaAsset) => {
      const { error } = await supabase
        .from("media_assets")
        .delete()
        .eq("id", media.id);

      if (error) throw error;
      return media;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media"] });
      toast({ type: "success", title: "Media deleted" });
    },
    onError: (error: Error) => {
      toast({ type: "error", title: "Failed to delete media", message: error.message });
    },
  });
}

/** Get media counts for the admin dashboard. */
export function useMediaCounts() {
  return useQuery({
    queryKey: ["media", "counts"],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return {
          photography: 0,
          artwork: 0,
          guitar: 0,
          video_journal: 0,
          total: 0,
        };
      }

      const { count, error } = await supabase
        .from("media_assets")
        .select("*", { count: "exact", head: true });

      if (error) throw error;

      // Get counts by type
      const types: MediaType[] = ["photography", "artwork", "guitar", "video_journal"];
      const counts: Record<string, number> = {};

      for (const type of types) {
        const { count: typeCount } = await supabase
          .from("media_assets")
          .select("*", { count: "exact", head: true })
          .eq("media_type", type);
        counts[type] = typeCount ?? 0;
      }

      return { ...counts, total: count ?? 0 };
    },
    enabled: isSupabaseConfigured,
  });
}
