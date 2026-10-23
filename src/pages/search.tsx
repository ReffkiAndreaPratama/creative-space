import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { SEO } from "@/components/seo";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/gallery/empty-state";
import { MediaCard } from "@/components/gallery/media-card";
import { useSearchMedia } from "@/hooks/use-media";
import { useJournalPosts } from "@/hooks/use-journal";
import { useProjects } from "@/hooks/use-projects";
import type { JournalPost, Project, MediaAsset } from "@/types/database";
import { formatDateShort, estimateReadingTime } from "@/lib/utils";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [input, setInput] = useState(query);

  const mediaResults = useSearchMedia(query);
  const { data: journals } = useJournalPosts();
  const { data: projects } = useProjects();

  // Filter journals and projects locally based on search query
  const journalResults = useMemo(() => {
    if (!query.trim() || !journals) return [];
    const q = query.toLowerCase();
    return journals.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        (j.excerpt?.toLowerCase().includes(q) ?? false) ||
        (j.content?.toLowerCase().includes(q) ?? false)
    );
  }, [query, journals]);

  const projectResults = useMemo(() => {
    if (!query.trim() || !projects) return [];
    const q = query.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false)
    );
  }, [query, projects]);

  const totalResults =
    (mediaResults.data?.length ?? 0) + journalResults.length + projectResults.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(input.trim() ? { q: input.trim() } : {});
  };

  return (
    <>
      <SEO title="Search" description="Search across all content on Nexreff Creative Space." />

      <div className="container-page py-8">
        <header className="mb-8">
          <h1 className="font-display text-display-lg font-bold text-foreground">Search</h1>
          <p className="mt-2 text-muted">Find photos, art, videos, journal posts, and projects.</p>
        </header>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative max-w-2xl">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <Input
              type="search"
              placeholder="Search..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-12 pl-11 text-base"
              aria-label="Search all content"
              autoFocus
            />
          </div>
        </form>

        {!query && (
          <EmptyState
            icon={<SearchIcon className="h-12 w-12" />}
            title="Start searching"
            description="Type a search term above to find content across photography, art, guitar, videos, journal, and projects."
          />
        )}

        {query && (
          <>
            <p className="mb-6 text-sm text-muted">
              {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
            </p>

            {totalResults === 0 && !mediaResults.isLoading && (
              <EmptyState
                title="No results found"
                description={`No content matches "${query}". Try a different search term.`}
              />
            )}

            {/* Media results */}
            {mediaResults.data && mediaResults.data.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 font-display text-xl text-foreground">Media ({mediaResults.data.length})</h2>
                <div className="masonry">
                  {mediaResults.data.map((media: MediaAsset) => (
                    <div key={media.id} className="masonry-item">
                      <MediaCard media={media} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Journal results */}
            {journalResults.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 font-display text-xl text-foreground">Journal ({journalResults.length})</h2>
                <div className="space-y-4">
                  {journalResults.map((post: JournalPost) => (
                    <Link
                      key={post.id}
                      to={`/journal/${post.slug}`}
                      className="block rounded-lg border border-border bg-surface p-4 hover:border-accent/30 transition-colors"
                    >
                      <h3 className="font-display text-lg text-foreground">{post.title}</h3>
                      {post.excerpt && (
                        <p className="mt-1 text-sm text-muted line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="mt-2 text-xs text-muted">
                        {post.published_at && formatDateShort(post.published_at)}
                        {post.content && ` · ${estimateReadingTime(post.content)} min read`}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Project results */}
            {projectResults.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 font-display text-xl text-foreground">Projects ({projectResults.length})</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {projectResults.map((project: Project) => (
                    <Link
                      key={project.id}
                      to="/projects"
                      className="block rounded-lg border border-border bg-surface p-4 hover:border-accent/30 transition-colors"
                    >
                      <h3 className="font-display text-lg text-foreground">{project.title}</h3>
                      {project.description && (
                        <p className="mt-1 text-sm text-muted line-clamp-2">{project.description}</p>
                      )}
                      {project.project_year && (
                        <p className="mt-2 text-xs text-muted">{project.project_year}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
