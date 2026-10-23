import { Link } from "react-router-dom";
import { ArrowRight, Camera, Pencil, Guitar, Film, Code, BookOpen } from "lucide-react";
import { SEO } from "@/components/seo";
import { LazyImage } from "@/components/media/lazy-image";
import { useFeaturedMedia, useLatestMedia } from "@/hooks/use-media";
import { useFeaturedProjects } from "@/hooks/use-projects";
import { useLatestJournalPosts } from "@/hooks/use-journal";
import { useCollections } from "@/hooks/use-collections";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { formatDateShort, estimateReadingTime } from "@/lib/utils";
import type { MediaAsset } from "@/types/database";
import type { Project, Collection } from "@/types/database";
import type { JournalPost } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/supabase";

export function HomePage() {
  const featuredPhotography = useFeaturedMedia("photography");
  const featuredArtwork = useFeaturedMedia("artwork");
  const featuredGuitar = useFeaturedMedia("guitar");
  const latestMedia = useLatestMedia(8);
  const featuredProjects = useFeaturedProjects(3);
  const latestJournal = useLatestJournalPosts(3);
  const collections = useCollections();
  const settings = useSiteSettings();

  const hasContent = (featuredPhotography.data?.length ?? 0) > 0 ||
    (featuredArtwork.data?.length ?? 0) > 0 ||
    (latestMedia.data?.length ?? 0) > 0;

  return (
    <>
      <SEO
        title=""
        description={settings.data?.tagline || "Capturing moments, drawing thoughts, and creating sounds."}
      />

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden">
        <div className="container-wide">
          <div className="max-w-4xl">
            <p className="font-mono text-sm uppercase tracking-widest text-accent animate-fade-in">
              Personal Creative Space
            </p>
            <h1 className="mt-4 font-display text-display-2xl font-bold text-foreground animate-fade-in-up">
              Nexreff
            </h1>
            <p className="mt-4 font-display text-display-lg italic text-muted text-balance animate-fade-in-up">
              {settings.data?.tagline || "Capturing moments, drawing thoughts, and creating sounds."}
            </p>
            <p className="mt-6 max-w-2xl text-lg text-muted text-pretty animate-fade-in-up">
              {settings.data?.description || "A personal creative space for photography, art, music, and code."}
            </p>

            <div className="mt-8 flex flex-wrap gap-4 animate-fade-in-up">
              <Link
                to="/photography"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                <Camera className="h-4 w-4" /> Photography
              </Link>
              <Link
                to="/art"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                <Pencil className="h-4 w-4" /> Art
              </Link>
              <Link
                to="/guitar"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                <Guitar className="h-4 w-4" /> Guitar
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                <Code className="h-4 w-4" /> Tech Projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      {!isSupabaseConfigured && (
        <section className="container-page py-10">
          <div className="rounded-lg border border-border bg-surface p-6 text-center">
            <p className="text-sm text-muted">
              Supabase is not configured. Add your credentials to <code className="text-accent">.env</code> to enable
              content. See <code className="text-accent">.env.example</code> for details.
            </p>
          </div>
        </section>
      )}

      {/* Featured Photography */}
      {featuredPhotography.data && featuredPhotography.data.length > 0 && (
        <Section title="Featured Photography" to="/photography" icon={<Camera className="h-5 w-5" />}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPhotography.data.slice(0, 6).map((media: MediaAsset) => (
              <Link key={media.id} to="/photography" className="group overflow-hidden rounded-lg bg-surface">
                <LazyImage
                  src={media.thumbnail_path || media.storage_path || ""}
                  alt={media.alt_text || media.title}
                  className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Featured Artwork */}
      {featuredArtwork.data && featuredArtwork.data.length > 0 && (
        <Section title="Featured Art" to="/art" icon={<Pencil className="h-5 w-5" />}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredArtwork.data.slice(0, 6).map((media: MediaAsset) => (
              <Link key={media.id} to="/art" className="group overflow-hidden rounded-lg bg-surface">
                <LazyImage
                  src={media.thumbnail_path || media.storage_path || ""}
                  alt={media.alt_text || media.title}
                  className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Featured Guitar Sessions */}
      {featuredGuitar.data && featuredGuitar.data.length > 0 && (
        <Section title="Guitar Sessions" to="/guitar" icon={<Guitar className="h-5 w-5" />}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredGuitar.data.slice(0, 3).map((media: MediaAsset) => (
              <Link key={media.id} to="/guitar" className="group overflow-hidden rounded-lg bg-surface">
                <div className="relative">
                  <LazyImage
                    src={media.thumbnail_path || media.storage_path || ""}
                    alt={media.alt_text || media.title}
                    className="aspect-video w-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                    <Guitar className="h-8 w-8 text-foreground" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                    {media.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Latest Creations */}
      {latestMedia.data && latestMedia.data.length > 0 && (
        <Section title="Latest Creations" to="/collections" icon={<Film className="h-5 w-5" />}>
          <div className="masonry">
            {latestMedia.data.map((media: MediaAsset) => (
              <div key={media.id} className="masonry-item group relative overflow-hidden rounded-lg bg-surface">
                <LazyImage
                  src={media.thumbnail_path || media.storage_path || ""}
                  alt={media.alt_text || media.title}
                  className="w-full"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground">{media.title}</p>
                    <p className="text-xs text-muted">{media.media_type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Featured Projects */}
      {featuredProjects.data && featuredProjects.data.length > 0 && (
        <Section title="Tech Projects" to="/projects" icon={<Code className="h-5 w-5" />}>
          <div className="grid gap-4 md:grid-cols-3">
            {featuredProjects.data.map((project: Project) => (
              <div key={project.id} className="rounded-lg border border-border bg-surface p-6">
                <h3 className="font-display text-lg text-foreground">{project.title}</h3>
                {project.description && (
                  <p className="mt-2 text-sm text-muted text-pretty line-clamp-2">{project.description}</p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.technologies.slice(0, 4).map((tech: string) => (
                      <span key={tech} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {project.project_year && (
                  <p className="mt-3 text-xs text-muted">{project.project_year}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Latest Journal */}
      {latestJournal.data && latestJournal.data.length > 0 && (
        <Section title="Creative Journal" to="/journal" icon={<BookOpen className="h-5 w-5" />}>
          <div className="grid gap-6 md:grid-cols-3">
            {latestJournal.data.map((post: JournalPost) => (
              <Link key={post.id} to={`/journal/${post.slug}`} className="group">
                <h3 className="font-display text-lg text-foreground group-hover:text-accent transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-muted text-pretty line-clamp-3">{post.excerpt}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                  {post.published_at && <span>{formatDateShort(post.published_at)}</span>}
                  {post.content && <span>{estimateReadingTime(post.content)} min read</span>}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Featured Collections */}
      {collections.data && collections.data.length > 0 && (
        <Section title="Collections" to="/collections" icon={<BookOpen className="h-5 w-5" />}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.data.slice(0, 6).map((collection: Collection) => (
              <Link
                key={collection.id}
                to={`/collections/${collection.slug}`}
                className="group rounded-lg border border-border bg-surface p-6 hover:border-accent/30 transition-colors"
              >
                <h3 className="font-display text-lg text-foreground group-hover:text-accent transition-colors">
                  {collection.title}
                </h3>
                {collection.description && (
                  <p className="mt-2 text-sm text-muted text-pretty line-clamp-2">{collection.description}</p>
                )}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Empty state */}
      {!hasContent && isSupabaseConfigured && (
        <section className="container-page py-20 text-center">
          <h2 className="font-display text-2xl text-foreground">Welcome to Nexreff Creative Space</h2>
          <p className="mx-auto mt-3 max-w-md text-muted text-pretty">
            No content has been published yet. Once the admin uploads photos, art, and videos,
            they will appear here.
          </p>
          <Link
            to="/about"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Learn more <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* Profile section */}
      <section className="container-page py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-display-lg font-bold text-foreground">About Nexreff</h2>
          <p className="mt-4 text-lg text-muted text-pretty">
            Photographer, artist, guitarist, and developer. This is my space to share
            what I create — from the camera lens to the guitar strings to the lines of code.
          </p>
          <Link
            to="/about"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Read more <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function Section({
  title,
  to,
  icon,
  children,
}: {
  title: string;
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="container-wide py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
          <span className="text-accent">{icon}</span>
          {title}
        </h2>
        <Link
          to={to}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent transition-colors"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {children}
    </section>
  );
}
