import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { MediaType } from "@/types/database";
import { PHOTOGRAPHY_CATEGORIES, ARTWORK_CATEGORIES, GUITAR_CATEGORIES, VIDEO_JOURNAL_CATEGORIES, type SortOption } from "@/types/database";
import { useMedia } from "@/hooks/use-media";
import { FilterBar } from "./filter-bar";
import { MasonryGallery } from "./masonry-gallery";
import { EmptyState } from "./empty-state";
import { SEO } from "@/components/seo";
import { isSupabaseConfigured } from "@/lib/supabase";

const CATEGORY_MAP: Record<MediaType, readonly string[]> = {
  photography: PHOTOGRAPHY_CATEGORIES,
  artwork: ARTWORK_CATEGORIES,
  guitar: GUITAR_CATEGORIES,
  video_journal: VIDEO_JOURNAL_CATEGORIES,
};

interface GalleryPageProps {
  mediaType: MediaType;
  title: string;
  description: string;
  seoTitle: string;
}

export function GalleryPage({ mediaType, title, description, seoTitle }: GalleryPageProps) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const categories = CATEGORY_MAP[mediaType];
  const { data, isLoading, isError, error } = useMedia({ mediaType, category, search, sort });

  return (
    <>
      <SEO title={seoTitle} description={description} />

      <div className="container-wide py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-display text-display-lg font-bold text-foreground">{title}</h1>
          <p className="mt-2 max-w-2xl text-muted text-pretty">{description}</p>
        </header>

        {/* Filters */}
        <FilterBar
          categories={categories}
          selectedCategory={category}
          onCategoryChange={setCategory}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          className="mb-8"
        />

        {/* Content */}
        {isLoading && (
          <div className="masonry">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="masonry-item">
                <div className="skeleton h-64 w-full rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <EmptyState
            title="Failed to load content"
            description={error instanceof Error ? error.message : "Please try again later."}
          />
        )}

        {!isLoading && !isError && data && data.length === 0 && (
          <EmptyState
            icon={<ImageOff className="h-12 w-12" />}
            title={isSupabaseConfigured ? "No works found" : "Supabase not configured"}
            description={
              isSupabaseConfigured
                ? "No content matches your current filters. Try changing the category or search term."
                : "Add your Supabase credentials to .env to load content."
            }
          />
        )}

        {!isLoading && !isError && data && data.length > 0 && (
          <MasonryGallery items={data} />
        )}
      </div>
    </>
  );
}
