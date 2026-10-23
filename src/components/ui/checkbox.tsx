import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  id,
  disabled,
  ...props
}: CheckboxProps) {
  return (
    <button
      id={id}
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded border border-input transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "border-accent bg-accent" : "bg-surface"
      )}
      aria-label={props["aria-label"]}
    >
      {checked && <Check className="h-3.5 w-3.5 text-accent-foreground" />}
    </button>
  );
}
