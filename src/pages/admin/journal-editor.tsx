import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { SEO } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/gallery/empty-state";
import {
  useAdminJournalPosts,
  useCreateJournalPost,
  useUpdateJournalPost,
  useDeleteJournalPost,
} from "@/hooks/use-journal";
import { slugify, formatDateShort, estimateReadingTime } from "@/lib/utils";
import type { JournalPost, ContentStatus } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/supabase";

export function AdminJournalPage() {
  const { data: posts, isLoading } = useAdminJournalPosts();
  const createPost = useCreateJournalPost();
  const updatePost = useUpdateJournalPost();
  const deletePost = useDeleteJournalPost();
  const [editing, setEditing] = useState<JournalPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<JournalPost | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deletePost.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      // handled by mutation
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <SEO title="Journal Editor" />
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Journal</h1>
            <p className="mt-1 text-sm text-muted">Write and manage creative journal posts.</p>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New Post
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && (!posts || posts.length === 0) && (
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title={isSupabaseConfigured ? "No journal posts yet" : "Supabase not configured"}
            description="Create your first journal entry to share your stories."
            action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New Post</Button>}
          />
        )}

        {!isLoading && posts && posts.length > 0 && (
          <div className="space-y-3">
            {posts.map((post: JournalPost) => (
              <div
                key={post.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg text-foreground">{post.title}</h3>
                    <Badge variant={post.status === "published" ? "success" : "secondary"}>
                      {post.status}
                    </Badge>
                  </div>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-muted line-clamp-1">{post.excerpt}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                    <span>{formatDateShort(post.updated_at)}</span>
                    {post.content && <span>{estimateReadingTime(post.content)} min read</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(post)} aria-label="Edit post">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(post)}
                    aria-label="Delete post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
      {(creating || editing) && (
        <JournalEditorDialog
          post={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={async (data, isNew) => {
            if (isNew) {
              await createPost.mutateAsync(data);
            } else if (editing) {
              await updatePost.mutateAsync({ id: editing.id, data });
            }
            setCreating(false);
            setEditing(null);
          }}
          saving={createPost.isPending || updatePost.isPending}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete post?"
        description={`Delete "${deleting?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </>
  );
}

function JournalEditorDialog({
  post,
  onClose,
  onSave,
  saving,
}: {
  post: JournalPost | null;
  onClose: () => void;
  onSave: (data: Omit<JournalPost, "id" | "created_at" | "updated_at">, isNew: boolean) => Promise<void>;
  saving: boolean;
}) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [status, setStatus] = useState<ContentStatus>(post?.status || "draft");
  const [autoSlug, setAutoSlug] = useState(!post);

  useEffect(() => {
    if (autoSlug) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        title,
        slug: slug || slugify(title),
        excerpt: excerpt || null,
        content,
        cover_media_id: post?.cover_media_id || null,
        status,
        published_at: status === "published" ? (post?.published_at || new Date().toISOString()) : null,
      },
      !post
    );
  };

  return (
    <Dialog open onClose={onClose} title={post ? "Edit Post" : "New Post"} className="max-w-3xl" showClose>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="post-title">Title</Label>
          <Input
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Post title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="post-slug">Slug</Label>
          <Input
            id="post-slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setAutoSlug(false);
            }}
            placeholder="url-friendly-slug"
          />
          <p className="text-xs text-muted">URL: /journal/{slug || "slug"}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="post-excerpt">Excerpt</Label>
          <Textarea
            id="post-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary shown in lists..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="post-content">Content (HTML)</Label>
          <Textarea
            id="post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="<p>Write your story here...</p>"
            rows={12}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted">
            Use basic HTML: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;em&gt;
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="post-status">Status</Label>
          <Select
            id="post-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ContentStatus)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving || !title.trim() || !content.trim()}>
            {saving ? "Saving..." : "Save Post"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
