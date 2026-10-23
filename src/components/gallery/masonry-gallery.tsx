import { useState } from "react";
import type { MediaAsset } from "@/types/database";
import { MediaCard } from "./media-card";
import { Lightbox } from "./lightbox";

interface MasonryGalleryProps {
  items: MediaAsset[];
}

export function MasonryGallery({ items }: MasonryGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return null; // Empty state handled by parent
  }

  return (
    <>
      <div className="masonry">
        {items.map((media, i) => (
          <MediaCard
            key={media.id}
            media={media}
            onOpen={() => setLightboxIndex(i)}
          />
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </>
  );
}
