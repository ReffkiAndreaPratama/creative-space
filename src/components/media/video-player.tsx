import { useState, useRef, useEffect } from "react";
import { Play, AlertCircle } from "lucide-react";
import {
  isExternalMedia,
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  externalUrl: string | null;
  storagePath?: string | null;
  thumbnailPath?: string | null;
  title: string;
  className?: string;
}

export function VideoPlayer({
  externalUrl,
  storagePath,
  thumbnailPath,
  title,
  className,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const youtubeId = externalUrl ? extractYouTubeId(externalUrl) : null;
  const isExternal = isExternalMedia(externalUrl);

  // Reset on prop changes
  useEffect(() => {
    setPlaying(false);
    setHasError(false);
  }, [externalUrl, storagePath]);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex aspect-video items-center justify-center bg-surface",
          className
        )}
      >
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-2 text-sm text-muted">Video unavailable</p>
        </div>
      </div>
    );
  }

  // YouTube embed — lazy loaded (only loads iframe when user clicks play)
  if (isExternal && youtubeId) {
    const poster = getYouTubeThumbnail(youtubeId);
    return (
      <div
        ref={containerRef}
        className={cn("relative aspect-video overflow-hidden bg-black", className)}
      >
        {playing ? (
          <iframe
            src={`${getYouTubeEmbedUrl(youtubeId)}&autoplay=1`}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            className="group relative h-full w-full"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${title}`}
          >
            <img
              src={poster}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback to standard quality thumbnail
                const img = e.currentTarget;
                if (img.src.includes("maxresdefault")) {
                  img.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                } else {
                  setHasError(true);
                }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity group-hover:bg-black/50">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/90 transition-transform group-hover:scale-110">
                <Play className="h-6 w-6 fill-accent-foreground text-accent-foreground" />
              </span>
            </div>
          </button>
        )}
      </div>
    );
  }

  // External non-YouTube — try as direct link/embed
  if (isExternal && !youtubeId) {
    return (
      <div className={cn("relative aspect-video overflow-hidden bg-black", className)}>
        {playing ? (
          <iframe
            src={externalUrl!}
            title={title}
            className="h-full w-full"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            className="group relative h-full w-full"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${title}`}
          >
            {thumbnailPath && (
              <img
                src={thumbnailPath}
                alt={title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/90">
                <Play className="h-6 w-6 fill-accent-foreground text-accent-foreground" />
              </span>
            </div>
          </button>
        )}
      </div>
    );
  }

  // Direct video from storage
  if (storagePath) {
    return (
      <div className={cn("relative aspect-video overflow-hidden bg-black", className)}>
        <video
          src={storagePath}
          title={title}
          controls
          preload="metadata"
          poster={thumbnailPath || undefined}
          className="h-full w-full"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex aspect-video items-center justify-center bg-surface", className)}>
      <p className="text-sm text-muted">No video source available</p>
    </div>
  );
}
