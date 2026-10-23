import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: string;
  fallback?: string;
}

export function LazyImage({
  src,
  alt,
  aspectRatio,
  className,
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={cn("relative overflow-hidden bg-surface", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-surface-hover" />
      )}
      {error ? (
        <div className="flex h-full w-full items-center justify-center bg-surface-hover">
          <span className="text-xs text-muted">Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={props.width}
          height={props.height}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0"
          )}
          {...props}
        />
      )}
    </div>
  );
}
