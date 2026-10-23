import { Link } from "react-router-dom";
import { Camera, Pencil, Guitar, Film, FileText, FolderKanban, BookOpen, Upload, TrendingUp } from "lucide-react";
import { SEO } from "@/components/seo";
import { useMediaCounts } from "@/hooks/use-media";
import { useAdminJournalPosts } from "@/hooks/use-journal";
import { useProjects } from "@/hooks/use-projects";
import { useCollections } from "@/hooks/use-collections";
import { isSupabaseConfigured } from "@/lib/supabase";

export function AdminDashboardPage() {
  const mediaCounts = useMediaCounts();
  const { data: journals } = useAdminJournalPosts();
  const { data: projects } = useProjects();
  const { data: collections } = useCollections();

  const draftCount = journals?.filter((j: { status: string }) => j.status === "draft").length ?? 0;
  const publishedCount = journals?.filter((j: { status: string }) => j.status === "published").length ?? 0;

  const stats = [
    { label: "Photography", value: mediaCounts.data?.photography ?? 0, icon: Camera },
    { label: "Artwork", value: mediaCounts.data?.artwork ?? 0, icon: Pencil },
    { label: "Guitar Sessions", value: mediaCounts.data?.guitar ?? 0, icon: Guitar },
    { label: "Video Journal", value: mediaCounts.data?.video_journal ?? 0, icon: Film },
    { label: "Journal Posts", value: journals?.length ?? 0, icon: FileText },
    { label: "Projects", value: projects?.length ?? 0, icon: TrendingUp },
    { label: "Collections", value: collections?.length ?? 0, icon: FolderKanban },
    { label: "Drafts", value: draftCount, icon: BookOpen },
  ];

  return (
    <>
      <SEO title="Dashboard" />
      <div>
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Overview of your creative space.</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 rounded-lg border border-amber-700/30 bg-amber-900/10 p-4">
            <p className="text-sm text-amber-400">
              Supabase is not configured. Statistics will show zero until credentials are added.
            </p>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-muted" />
              </div>
              <p className="mt-2 font-display text-3xl font-bold text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Publication status */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-5">
            <h3 className="text-sm font-medium text-foreground">Published Content</h3>
            <p className="mt-2 font-display text-2xl text-green-400">{publishedCount}</p>
            <p className="text-xs text-muted">Journal posts visible to the public</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <h3 className="text-sm font-medium text-foreground">Drafts</h3>
            <p className="mt-2 font-display text-2xl text-amber-400">{draftCount}</p>
            <p className="text-xs text-muted">Journal posts not yet published</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <h2 className="mb-4 font-display text-lg text-foreground">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/upload"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground hover:border-accent/30 transition-colors"
            >
              <Upload className="h-4 w-4" /> Upload Media
            </Link>
            <Link
              to="/admin/media"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground hover:border-accent/30 transition-colors"
            >
              <Camera className="h-4 w-4" /> Manage Media
            </Link>
            <Link
              to="/admin/journal"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground hover:border-accent/30 transition-colors"
            >
              <FileText className="h-4 w-4" /> New Journal Post
            </Link>
          </div>
        </div>

        {/* Analytics note */}
        <div className="mt-8 rounded-lg border border-border bg-surface p-5">
          <h3 className="text-sm font-medium text-foreground">Visitor Analytics</h3>
          <p className="mt-1 text-xs text-muted">
            Analytics are not configured. Visitor statistics will appear here once an
            analytics provider is set up.
          </p>
        </div>
      </div>
    </>
  );
}
