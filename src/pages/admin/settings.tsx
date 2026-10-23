import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { SEO } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSiteSettings, useUpdateSettings, type SiteSettings } from "@/hooks/use-site-settings";
import { isSupabaseConfigured } from "@/lib/supabase";

export function AdminSettingsPage() {
  const { data: settings } = useSiteSettings();
  const updateSettings = useUpdateSettings();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (settings && !form) {
      setForm(settings);
    }
  }, [settings, form]);

  const update = (key: keyof SiteSettings, value: string) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);
    setDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    updateSettings.mutate(form);
    setDirty(false);
  };

  if (!form) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <div className="mt-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Settings" />
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted">Configure your site identity and social links.</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 rounded-lg border border-amber-700/30 bg-amber-900/10 p-4">
            <p className="text-sm text-amber-400">
              Supabase is not configured. Settings cannot be saved.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Site identity */}
          <section className="space-y-4 rounded-xl border border-border bg-surface p-6">
            <h2 className="font-display text-lg text-foreground">Site Identity</h2>

            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input
                id="site-name"
                value={form.site_name}
                onChange={(e) => update("site_name", e.target.value)}
                placeholder="Nexreff Creative Space"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={form.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                placeholder="Capturing moments, drawing thoughts..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="A short description of your creative space..."
                rows={3}
              />
            </div>
          </section>

          {/* Social links */}
          <section className="space-y-4 rounded-xl border border-border bg-surface p-6">
            <h2 className="font-display text-lg text-foreground">Social Links</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  type="url"
                  value={form.github_url}
                  onChange={(e) => update("github_url", e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  type="url"
                  value={form.instagram_url}
                  onChange={(e) => update("instagram_url", e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube URL</Label>
                <Input
                  id="youtube"
                  type="url"
                  value={form.youtube_url}
                  onChange={(e) => update("youtube_url", e.target.value)}
                  placeholder="https://youtube.com/@..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter / X URL</Label>
                <Input
                  id="twitter"
                  type="url"
                  value={form.twitter_url}
                  onChange={(e) => update("twitter_url", e.target.value)}
                  placeholder="https://x.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={form.linkedin_url}
                  onChange={(e) => update("linkedin_url", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
            </div>
          </section>

          {/* Save button */}
          <div className="flex items-center justify-between">
            {dirty && <p className="text-sm text-amber-400">Unsaved changes</p>}
            <Button type="submit" disabled={updateSettings.isPending || !isSupabaseConfigured} className="ml-auto">
              <Save className="h-4 w-4" />
              {updateSettings.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>

        {/* Security note */}
        <div className="mt-8 rounded-lg border border-border bg-surface p-4">
          <h3 className="text-sm font-medium text-foreground">Security</h3>
          <p className="mt-1 text-xs text-muted">
            Your Supabase anon/publishable key is safe in the frontend — it's protected by
            Row Level Security policies. Never put your service_role key in frontend code.
          </p>
        </div>
      </div>
    </>
  );
}
