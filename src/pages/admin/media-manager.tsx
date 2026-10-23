import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Pencil, Star, Upload } from "lucide-react";
import { SEO } from "@/components/seo";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/gallery/empty-state";
import { LazyImage } from "@/components/media/lazy-image";
import { useAdminMedia, useUpdateMedia, useDeleteMedia } from "@/hooks/use-media";
import { useToast } from "@/hooks/use-toast";
import type { MediaAsset, MediaType } from "@/types/database";
import { PHOTOGRAPHY_CATEGORIES, ARTWORK_CATEGORIES, GUITAR_CATEGORIES, VIDEO_JOURNAL_CATEGORIES } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { SortOption } from "@/types/database";

const ALL_MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: "photography", label: "Photography" },
  { value: "artwork", label: "Art & Sketchbook" },
  { value: "guitar", label: "Guitar Sessions" },
  { value: "video_journal", label: "Video Journal" },
];

const CATEGORY_MAP: Record<MediaType, readonly string[]> = {
  photography: PHOTOGRAPHY_CATEGORIES,
  artwork: ARTWORK_CATEGORIES,
  guitar: GUITAR_CATEGORIES,
  video_journal: VIDEO_JOURNAL_CATEGORIES,
};

export function AdminMediaManagerPage() {
  const [mediaType, setMediaType] = useState<MediaType>("photography");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, _setSort] = useState<SortOption>("newest");
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState<MediaAsset | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data, isLoading } = useAdminMedia({ mediaType, category, search, sort });
  const updateMedia = useUpdateMedia();
  const deleteMedia = useDeleteMedia();
  void useToast(); // keep import, toast shown by mutation hooks

  const categories = CATEGORY_MAP[mediaType];

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteMedia.mutateAsync(deleting);
      setDeleting(null);
    } catch {
      // Error handled by mutation onError
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <SEO title="Media Manager" />
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Media Manager</h1>
            <p className="mt-1 text-sm text-muted">Manage all your uploaded media.</p>
          </div>
          <Link to="/admin/upload">
            <Button>
              <Upload className="h-4 w-4" /> Upload
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={mediaType}
            onChange={(e) => {
              setMediaType(e.target.value as MediaType);
              setCategory("all");
            }}
            className="w-auto"
            aria-label="Filter by media type"
          >
            {ALL_MEDIA_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>

          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-auto"
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>

          <Input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 sm:max-w-xs"
            aria-label="Search media"
          />
        </div>

        {/* Grid */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && (!data || data.length === 0) && (
          <EmptyState
            icon={<Upload className="h-12 w-12" />}
            title={isSupabaseConfigured ? "No media found" : "Supabase not configured"}
            description={isSupabaseConfigured ? "Upload your first media to get started." : "Add credentials to .env."}
            action={
              <Link to="/admin/upload">
                <Button><Upload className="h-4 w-4" /> Upload Media</Button>
              </Link>
            }
          />
        )}

        {!isLoading && data && data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((media: MediaAsset) => (
              <div key={media.id} className="group rounded-lg border border-border bg-surface overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <LazyImage
                    src={media.thumbnail_path || media.storage_path || ""}
                    alt={media.alt_text || media.title}
                    className="h-full w-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => setEditing(media)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-foreground hover:text-accent transition-colors"
                      aria-label={`Edit ${media.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(media)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-foreground hover:text-destructive transition-colors"
                      aria-label={`Delete ${media.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {media.is_featured && (
                    <span className="absolute left-2 top-2">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground line-clamp-1">{media.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary">{media.media_type}</Badge>
                    {media.visibility === "private" && <Badge variant="destructive">Private</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      {editing && (
        <EditMediaDialog
          media={editing}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            await updateMedia.mutateAsync({ id: editing.id, data });
            setEditing(null);
          }}
          saving={updateMedia.isPending}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete media?"
        description={`Are you sure you want to delete "${deleting?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </>
  );
}

function EditMediaDialog({
  media,
  onClose,
  onSave,
  saving,
}: {
  media: MediaAsset;
  onClose: () => void;
  onSave: (data: Partial<MediaAsset>) => Promise<void>;
  saving: boolean;
}) {
  const [title, setTitle] = useState(media.title);
  const [description, setDescription] = useState(media.description || "");
  const [category, setCategory] = useState(media.category);
  const [isFeatured, setIsFeatured] = useState(media.is_featured);
  const [visibility, setVisibility] = useState(media.visibility);
  const [altText, setAltText] = useState(media.alt_text || "");

  const categories = CATEGORY_MAP[media.media_type];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description: description || null,
      category,
      is_featured: isFeatured,
      visibility,
      alt_text: altText || null,
    });
  };

  return (
    <Dialog open onClose={onClose} title="Edit Media" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Title</Label>
          <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-alt">Alt Text</Label>
            <Input id="edit-alt" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe the image" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
          <div>
            <Label htmlFor="edit-featured">Featured</Label>
            <p className="text-xs text-muted">Show on the home page</p>
          </div>
          <Switch id="edit-featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
          <div>
            <Label htmlFor="edit-visibility">Public</Label>
            <p className="text-xs text-muted">Visible to visitors</p>
          </div>
          <Switch
            id="edit-visibility"
            checked={visibility === "public"}
            onCheckedChange={(checked) => setVisibility(checked ? "public" : "private")}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
