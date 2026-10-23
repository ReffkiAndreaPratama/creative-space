import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { SEO } from "@/components/seo";
import { useJournalPost } from "@/hooks/use-journal";
import { formatDate, estimateReadingTime } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/validation";

export function JournalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useJournalPost(slug);

  if (isLoading) {
    return (
      <div className="container-page py-8">
        <div className="skeleton h-8 w-3/4" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center text-center">
        <div>
          <h1 className="font-display text-2xl text-foreground">Post not found</h1>
          <p className="mt-2 text-muted">This journal post may have been moved or is no longer published.</p>
          <Link
            to="/journal"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={post.title} description={post.excerpt || undefined} />

      <article className="container-page py-8">
        {/* Back link */}
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Journal
        </Link>

        {/* Header */}
        <header className="mt-6 max-w-3xl">
          <h1 className="font-display text-display-lg font-bold text-foreground text-balance">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted">
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(post.published_at)}
              </span>
            )}
            {post.content && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {estimateReadingTime(post.content)} min read
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-invert mt-8 max-w-3xl"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || "") }}
        />
      </article>
    </>
  );
}
