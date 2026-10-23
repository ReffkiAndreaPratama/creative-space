import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Project } from "@/types/database";
import { useToast } from "./use-toast";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("project_year", { ascending: false });

      if (error) throw error;
      return (data as Project[]) ?? [];
    },
    enabled: isSupabaseConfigured,
  });
}

export function useFeaturedProjects(limit = 3) {
  return useQuery({
    queryKey: ["projects", "featured", limit],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_featured", true)
        .order("project_year", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as Project[]) ?? [];
    },
    enabled: isSupabaseConfigured,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<Project, "id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("projects")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as Project;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast({ type: "success", title: "Project created" });
    },
    onError: (error: Error) => {
      toast({ type: "error", title: "Failed to create project", message: error.message });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const { data: result, error } = await supabase
        .from("projects")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result as Project;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast({ type: "success", title: "Project updated" });
    },
    onError: (error: Error) => {
      toast({ type: "error", title: "Failed to update project", message: error.message });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast({ type: "success", title: "Project deleted" });
    },
    onError: (error: Error) => {
      toast({ type: "error", title: "Failed to delete project", message: error.message });
    },
  });
}
