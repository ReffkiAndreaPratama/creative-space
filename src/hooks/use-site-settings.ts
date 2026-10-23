import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useToast } from "./use-toast";

export interface SiteSettings {
  site_name: string;
  tagline: string;
  description: string;
  github_url: string;
  instagram_url: string;
  youtube_url: string;
  twitter_url: string;
  linkedin_url: string;
  email: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "Nexreff Creative Space",
  tagline: "Capturing moments, drawing thoughts, and creating sounds.",
  description:
    "A personal creative space for photography, art, music, and code by Nexreff.",
  github_url: "https://github.com/ReffkiAndreaPratama",
  instagram_url: "",
  youtube_url: "",
  twitter_url: "",
  linkedin_url: "",
  email: "",
};

/** Fetch all site settings as a key-value map. */
export function useSiteSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<SiteSettings> => {
      if (!isSupabaseConfigured) return DEFAULT_SETTINGS;

      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value");

      if (error) {
        console.warn("[Nexreff] Failed to load site settings:", error.message);
        return DEFAULT_SETTINGS;
      }

      const settings = { ...DEFAULT_SETTINGS };
      for (const row of data ?? []) {
        const key = row.setting_key as keyof SiteSettings;
        if (key in settings) {
          (settings[key] as string) = row.setting_value;
        }
      }
      return settings;
    },
    enabled: isSupabaseConfigured,
  });
}

/** Update a single site setting. */
export function useUpdateSetting() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast({ type: "success", title: "Setting saved" });
    },
    onError: (error: Error) => {
      toast({ type: "error", title: "Failed to save setting", message: error.message });
    },
  });
}

/** Update multiple settings at once. */
export function useUpdateSettings() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<SiteSettings>) => {
      const entries = Object.entries(settings);
      for (const [key, value] of entries) {
        const { error } = await supabase
          .from("site_settings")
          .upsert({
            setting_key: key,
            setting_value: String(value),
            updated_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast({ type: "success", title: "Settings saved successfully" });
    },
    onError: (error: Error) => {
      toast({ type: "error", title: "Failed to save settings", message: error.message });
    },
  });
}
