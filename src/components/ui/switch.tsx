import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  id,
  disabled,
  ...props
}: SwitchProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-border transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-accent" : "bg-surface-hover"
      )}
      aria-label={props["aria-label"]}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-foreground shadow-lg transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
