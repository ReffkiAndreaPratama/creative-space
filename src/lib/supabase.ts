import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** Whether Supabase credentials are configured. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[Nexreff] Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.\n" +
      "See .env.example for details."
  );
}

/**
 * The Supabase browser client.
 * Uses the PUBLIC anon/publishable key — protected by Row Level Security.
 * NEVER use the service_role key in frontend code.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
