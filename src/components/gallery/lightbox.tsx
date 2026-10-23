import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, Info } from "lucide-react";
import type { MediaAsset } from "@/types/database";
import { VideoPlayer } from "@/components/media/video-player";
import { isExternalMedia } from "@/lib/storage";
import { formatDate, cn } from "@/lib/utils";

interface LightboxProps {
  items: MediaAsset[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function Lightbox({ items, index, onClose, onIndexChange }: LightboxProps) {
  const [showInfo, setShowInfo] = useState(true);
  const current = items[index];
  const isVideo = current?.media_type === "guitar" || current?.media_type === "video_journal";

  const goNext = useCallback(() => {
    onIndexChange((index + 1) % items.length);
  }, [index, items.length, onIndexChange]);

  const goPrev = useCallback(() => {
    onIndexChange((index - 1 + items.length) % items.length);
  }, [index, items.length, onIndexChange]);

  useEffect(() => {
    if (!current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case "i":
          setShowInfo((prev) => !prev);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [current, onClose, goNext, goPrev]);

  if (!current) return null;

  const imageUrl = current.thumbnail_path || current.storage_path || current.external_url;
  const isExternal = isExternalMedia(current.external_url);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 text-foreground hover:bg-surface-hover focus-ring"
        aria-label="Close lightbox"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Prev / Next */}
      {items.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-foreground hover:bg-surface-hover focus-ring"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-foreground hover:bg-surface-hover focus-ring"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="flex h-full w-full max-w-6xl flex-col px-12 py-16 md:px-20">
        {/* Image or video */}
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          {isVideo ? (
            <VideoPlayer
              externalUrl={current.external_url}
              storagePath={current.storage_path}
              thumbnailPath={current.thumbnail_path}
              title={current.title}
              className="max-h-full rounded-lg"
            />
          ) : (
            <img
              src={imageUrl || ""}
              alt={current.alt_text || current.title}
              className="max-h-full max-w-full object-contain"
              loading="eager"
            />
          )}
        </div>

        {/* Info panel */}
        {showInfo && (
          <div className="mt-4 max-h-32 overflow-y-auto animate-fade-in-up">
            <h2 className="font-display text-2xl text-foreground">{current.title}</h2>
            {current.description && (
              <p className="mt-2 max-w-2xl text-sm text-muted text-pretty">
                {current.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
              {current.captured_at && (
                <span>{formatDate(current.captured_at)}</span>
              )}
              {current.location && <span>{current.location}</span>}
              {current.camera && <span>{current.camera}</span>}
              {current.lens && <span>{current.lens}</span>}
              {current.tools && <span>{current.tools}</span>
              }
              {current.genre && <span>{current.genre}</span>}
              {current.song_title && (
                <span className="italic">{current.song_title}</span>
              )}
              {current.original_artist && (
                <span>by {current.original_artist}</span>
              )}
              {isExternal && <span className="text-accent">External embed</span>}
            </div>
          </div>
        )}
      </div>

      {/* Counter */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted">
          {index + 1} / {items.length}
        </div>
      )}

      {/* Info toggle */}
      <button
        onClick={() => setShowInfo((prev) => !prev)}
        className={cn(
          "absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full text-foreground focus-ring transition-colors",
          showInfo ? "bg-surface-hover" : "bg-surface/80"
        )}
        aria-label="Toggle info"
      >
        <Info className="h-5 w-5" />
      </button>
    </div>,
    document.body
  );
}
