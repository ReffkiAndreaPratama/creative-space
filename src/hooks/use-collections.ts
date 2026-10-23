import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Collection, MediaAsset } from "@/types/database";
import { useToast } from "./use-toast";

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as Collection[]) ?? [];
    },
    enabled: isSupabaseConfigured,
  });
}

export function useCollectionItems(collectionId: string | undefined) {
  return useQuery({
    queryKey: ["collections", collectionId, "items"],
    queryFn: async () => {
      if (!isSupabaseConfigured || !collectionId) return [];

      const { data, error } = await supabase
        .from("collection_items")
        .select("media_id, sort_order")
        .eq("collection_id", collectionId)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      const items = data ?? [];
      if (items.length === 0) return [];

      const mediaIds = items.map((item) => item.media_id);
      const { data: media, error: mediaError } = await supabase
        .from("media_assets")
        .select("*")
        .in("id", mediaIds)
        .eq("visibility", "public");

      if (mediaError) throw mediaError;
      return (media as MediaAsset[]) ?? [];
    },
    enabled: isSupabaseConfigured && Boolean(collectionId),
  });
}

export function useCreateCollection() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<Collection, "id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("collections")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as Collection;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections"] });
      toast({ type: "success", title: "Collection created" });
    },
    onError: (error: Error) => {
      toast({ type: "error", title: "Failed to create collection", message: error.message });
    },
  });
}

export function useUpdateCollection() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Collection>;
    }) => {
      const { data: result, error } = await supabase
        .from("collections")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result as Collection;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections"] });
      toast({ type: "success", title: "Collection updated" });
    },
    onError: (error: Error) => {
      toast({ type: "error", title: "Failed to update collection", message: error.message });
    },
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections"] });
      toast({ type: "success", title: "Collection deleted" });
    },
    onError: (error: Error) => {
      toast({ type: "error", title: "Failed to delete collection", message: error.message });
    },
  });
}
