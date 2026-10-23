import { Link } from "react-router-dom";
import { Heart, Play } from "lucide-react";
import type { MediaAsset } from "@/types/database";
import { LazyImage } from "@/components/media/lazy-image";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  media: MediaAsset;
  onOpen?: (media: MediaAsset) => void;
  variant?: "masonry" | "grid";
  className?: string;
}

export function MediaCard({ media, onOpen, variant = "masonry", className }: MediaCardProps) {
  const isVideo = media.media_type === "guitar" || media.media_type === "video_journal";
  const imageUrl = media.thumbnail_path || media.storage_path || media.external_url;

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg bg-surface",
        variant === "masonry" ? "masonry-item" : "",
        className
      )}
      onClick={() => onOpen?.(media)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.(media);
        }
      }}
      aria-label={`View ${media.title}`}
    >
      <LazyImage
        src={imageUrl || ""}
        alt={media.alt_text || media.title}
        className="w-full"
      />

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="p-4">
          <h3 className="font-display text-lg leading-tight text-foreground line-clamp-2">
            {media.title}
          </h3>
          {media.category && (
            <p className="mt-1 text-xs text-muted">{media.category}</p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="absolute left-3 top-3 flex gap-2">
        {isVideo && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background/70 backdrop-blur-sm">
            <Play className="h-4 w-4 fill-foreground text-foreground" />
          </span>
        )}
      </div>

      <div className="absolute right-3 top-3">
        {media.is_featured && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background/70 backdrop-blur-sm">
            <Heart className="h-4 w-4 fill-accent text-accent" />
          </span>
        )}
      </div>
    </div>
  );
}

/** A simpler card for linking to detail pages */
export function MediaCardLink({ media, to }: { media: MediaAsset; to: string }) {
  const isVideo = media.media_type === "guitar" || media.media_type === "video_journal";
  const imageUrl = media.thumbnail_path || media.storage_path || media.external_url;

  return (
    <Link to={to} className="group block overflow-hidden rounded-lg bg-surface">
      <div className="relative overflow-hidden">
        <LazyImage
          src={imageUrl || ""}
          alt={media.alt_text || media.title}
          className="w-full transition-transform duration-300 group-hover:scale-105"
        />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm transition-transform group-hover:scale-110">
              <Play className="h-5 w-5 fill-foreground text-foreground" />
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base text-foreground line-clamp-1 group-hover:text-accent transition-colors">
          {media.title}
        </h3>
        {media.category && (
          <p className="mt-1 text-xs text-muted">{media.category}</p>
        )}
      </div>
    </Link>
  );
}
