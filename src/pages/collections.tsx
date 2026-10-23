import { Link, useParams } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import { SEO } from "@/components/seo";
import { EmptyState } from "@/components/gallery/empty-state";
import { MasonryGallery } from "@/components/gallery/masonry-gallery";
import { useCollections, useCollectionItems } from "@/hooks/use-collections";
import type { Collection } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatDateShort } from "@/lib/utils";

export function CollectionsPage() {
  const { data: collections, isLoading } = useCollections();

  return (
    <>
      <SEO
        title="Collections"
        description="Curated collections of photography, art, and creative works by Nexreff."
      />

      <div className="container-page py-8">
        <header className="mb-8">
          <h1 className="font-display text-display-lg font-bold text-foreground">Collections</h1>
          <p className="mt-2 max-w-2xl text-muted text-pretty">
            Curated groups of works — organized by theme, subject, or time.
          </p>
        </header>

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-40 rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && (!collections || collections.length === 0) && (
          <EmptyState
            icon={<FolderOpen className="h-12 w-12" />}
            title={isSupabaseConfigured ? "No collections yet" : "Supabase not configured"}
            description={
              isSupabaseConfigured
                ? "Collections will appear here once created."
                : "Add your Supabase credentials to .env to load content."
            }
          />
        )}

        {!isLoading && collections && collections.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection: Collection) => (
              <Link
                key={collection.id}
                to={`/collections/${collection.slug}`}
                className="group rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent/30"
              >
                <h2 className="font-display text-xl text-foreground group-hover:text-accent transition-colors">
                  {collection.title}
                </h2>
                {collection.description && (
                  <p className="mt-2 text-sm text-muted text-pretty line-clamp-2">
                    {collection.description}
                  </p>
                )}
                {collection.created_at && (
                  <p className="mt-4 text-xs text-muted">{formatDateShort(collection.created_at)}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: collections } = useCollections();
  const collection = collections?.find((c: Collection) => c.slug === slug);
  const { data: items, isLoading } = useCollectionItems(collection?.id);

  if (!collection && !isLoading && collections) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center text-center">
        <div>
          <h1 className="font-display text-2xl text-foreground">Collection not found</h1>
          <Link to="/collections" className="mt-4 inline-block text-sm text-accent hover:text-accent-hover">
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={collection?.title || "Collection"} description={collection?.description || undefined} />

      <div className="container-wide py-8">
        <Link
          to="/collections"
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          ← All Collections
        </Link>

        <header className="mt-4 mb-8">
          <h1 className="font-display text-display-lg font-bold text-foreground">
            {collection?.title}
          </h1>
          {collection?.description && (
            <p className="mt-2 max-w-2xl text-muted text-pretty">{collection.description}</p>
          )}
        </header>

        {isLoading && (
          <div className="masonry">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="masonry-item">
                <div className="skeleton h-64 w-full rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!items || items.length === 0) && (
          <EmptyState
            title="No items in this collection"
            description="This collection doesn't have any published works yet."
          />
        )}

        {!isLoading && items && items.length > 0 && (
          <MasonryGallery items={items} />
        )}
      </div>
    </>
  );
}
