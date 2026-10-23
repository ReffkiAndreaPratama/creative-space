import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  showClose?: boolean;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  showClose = true,
}: DialogProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    // Lock body scroll when dialog is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className={cn(
          "relative z-10 mx-4 w-full max-w-lg animate-scale-in rounded-xl border border-border bg-surface-raised shadow-2xl",
          className
        )}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4 p-6 pb-0">
            <div>
              {title && (
                <h2 className="font-display text-xl text-foreground">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted">{description}</p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="shrink-0 text-muted transition-colors hover:text-foreground focus-ring rounded-md p-1"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
