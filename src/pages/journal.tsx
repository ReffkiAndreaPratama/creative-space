import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { SEO } from "@/components/seo";
import { EmptyState } from "@/components/gallery/empty-state";
import { useJournalPosts } from "@/hooks/use-journal";
import { formatDateShort, estimateReadingTime } from "@/lib/utils";
import type { JournalPost } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/supabase";

export function JournalPage() {
  const { data: posts, isLoading } = useJournalPosts();

  return (
    <>
      <SEO
        title="Creative Journal"
        description="Stories behind photos, drawing processes, guitar learning journeys, and creative reflections."
      />

      <div className="container-page py-8">
        <header className="mb-8">
          <h1 className="font-display text-display-lg font-bold text-foreground">Creative Journal</h1>
          <p className="mt-2 max-w-2xl text-muted text-pretty">
            Stories behind the photos, drawing processes, guitar learning journeys, and creative reflections.
          </p>
        </header>

        {isLoading && (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-48 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && (!posts || posts.length === 0) && (
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title={isSupabaseConfigured ? "No journal entries yet" : "Supabase not configured"}
            description={
              isSupabaseConfigured
                ? "Journal posts will appear here once published."
                : "Add your Supabase credentials to .env to load content."
            }
          />
        )}

        {!isLoading && posts && posts.length > 0 && (
          <div className="space-y-12">
            {posts.map((post: JournalPost) => (
              <article key={post.id} className="border-b border-border pb-8">
                <Link to={`/journal/${post.slug}`} className="group block">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="flex-1">
                      <h2 className="font-display text-2xl text-foreground group-hover:text-accent transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2 text-muted text-pretty line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                        {post.published_at && (
                          <span>{formatDateShort(post.published_at)}</span>
                        )}
                        {post.content && (
                          <span>{estimateReadingTime(post.content)} min read</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
