import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { JournalPost } from "@/types/database";
import { useToast } from "./use-toast";

/** Fetch published journal posts (public). */
export function useJournalPosts() {
  return useQuery({
    queryKey: ["journal", "posts"],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("journal_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;
      return (data as JournalPost[]) ?? [];
    },
    enabled: isSupabaseConfigured,
  });
}

/** Fetch latest published journal posts for home page. */
export function useLatestJournalPosts(limit = 3) {
  return useQuery({
    queryKey: ["journal", "latest", limit],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("journal_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as JournalPost[]) ?? [];
    },
    enabled: isSupabaseConfigured,
  });
}

/** Fetch a single journal post by slug. */
export function useJournalPost(slug: string | undefined) {
  return useQuery({
    queryKey: ["journal", "post", slug],
    queryFn: async () => {
      if (!isSupabaseConfigured || !slug) return null;

      const { data, error } = await supabase
        .from("journal_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }
      return data as JournalPost;
    },
    enabled: isSupabaseConfigured && Boolean(slug),
  });
}

/** Fetch all journal posts including drafts (admin). */
export function useAdminJournalPosts() {
  return useQuery({
    queryKey: ["journal", "admin"],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("journal_posts")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data as JournalPost[]) ?? [];
    },
    enabled: isSupabaseConfigured,
  });
}

export function useCreateJournalPost() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<JournalPost, "id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("journal_posts")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as JournalPost;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
      toast({ type: "success", title: "Journal post created" });
    },
    onError: (error: Error) => {
      toast({ type: "error", title: "Failed to create post", message: error.message });
    },
  });
}

export function useUpdateJournalPost() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<JournalPost>;
    }) => {
      const { data: result, error } = await supabase
        .from("journal_posts")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result as JournalPost;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
      toast({ type: "success", title: "Journal post updated" });
    },
    onError: (error: Error) => {
      toast({ type: "error", title: "Failed to update post", message: error.message });
    },
  });
}

export function useDeleteJournalPost() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("journal_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
      toast({ type: "success", title: "Journal post deleted" });
    },
    onError: (error: Error) => {
      toast({ type: "error", title: "Failed to delete post", message: error.message });
    },
  });
}
