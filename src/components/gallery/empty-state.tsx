import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 text-center",
        className
      )}
    >
      {icon && <div className="text-muted">{icon}</div>}
      <h3 className="mt-4 font-display text-xl text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted text-pretty">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
