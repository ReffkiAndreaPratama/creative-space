import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { SEO } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/gallery/empty-state";
import {
  useCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
} from "@/hooks/use-collections";
import { slugify, formatDateShort } from "@/lib/utils";
import type { Collection } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/supabase";

export function AdminCollectionsPage() {
  const { data: collections, isLoading } = useCollections();
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();
  const [editing, setEditing] = useState<Collection | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Collection | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteCollection.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      // handled
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <SEO title="Collections Manager" />
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Collections</h1>
            <p className="mt-1 text-sm text-muted">Create and manage curated collections.</p>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New Collection
          </Button>
        </div>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && (!collections || collections.length === 0) && (
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title={isSupabaseConfigured ? "No collections yet" : "Supabase not configured"}
            description="Group your works into themed collections."
            action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New Collection</Button>}
          />
        )}

        {!isLoading && collections && collections.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection: Collection) => (
              <div key={collection.id} className="rounded-lg border border-border bg-surface p-5">
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-lg text-foreground">{collection.title}</h3>
                  <Badge variant={collection.visibility === "public" ? "success" : "secondary"}>
                    {collection.visibility}
                  </Badge>
                </div>
                {collection.description && (
                  <p className="mt-2 text-sm text-muted line-clamp-2">{collection.description}</p>
                )}
                <p className="mt-3 text-xs text-muted">{formatDateShort(collection.created_at)}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(collection)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(collection)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
      {(creating || editing) && (
        <CollectionDialog
          collection={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={async (data, isNew) => {
            if (isNew) {
              await createCollection.mutateAsync(data);
            } else if (editing) {
              await updateCollection.mutateAsync({ id: editing.id, data });
            }
            setCreating(false);
            setEditing(null);
          }}
          saving={createCollection.isPending || updateCollection.isPending}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete collection?"
        description={`Delete "${deleting?.title}"? Works inside will not be deleted.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </>
  );
}

function CollectionDialog({
  collection,
  onClose,
  onSave,
  saving,
}: {
  collection: Collection | null;
  onClose: () => void;
  onSave: (data: Omit<Collection, "id" | "created_at" | "updated_at">, isNew: boolean) => Promise<void>;
  saving: boolean;
}) {
  const [title, setTitle] = useState(collection?.title || "");
  const [slug, setSlug] = useState(collection?.slug || "");
  const [description, setDescription] = useState(collection?.description || "");
  const [isPublic, setIsPublic] = useState(collection?.visibility === "public");
  const [autoSlug, setAutoSlug] = useState(!collection);

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
        description: description || null,
        cover_media_id: collection?.cover_media_id || null,
        visibility: isPublic ? "public" : "private",
      },
      !collection
    );
  };

  return (
    <Dialog open onClose={onClose} title={collection ? "Edit Collection" : "New Collection"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="col-title">Title</Label>
          <Input
            id="col-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Collection name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="col-slug">Slug</Label>
          <Input
            id="col-slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setAutoSlug(false);
            }}
            placeholder="url-friendly-slug"
          />
          <p className="text-xs text-muted">URL: /collections/{slug || "slug"}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="col-desc">Description</Label>
          <Textarea
            id="col-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this collection about?"
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-surface-raised p-3">
          <div>
            <Label htmlFor="col-public">Public</Label>
            <p className="text-xs text-muted">Visible to visitors</p>
          </div>
          <Switch id="col-public" checked={isPublic} onCheckedChange={setIsPublic} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving || !title.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
