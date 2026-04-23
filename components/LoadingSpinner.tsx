import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  label?: string;
  className?: string;
  spinnerClassName?: string;
};

export default function LoadingSpinner({
  label = "Loading...",
  className,
  spinnerClassName,
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "text-muted-foreground flex items-center justify-center gap-2 text-sm",
        className,
      )}
    >
      <Loader2Icon
        className={cn("text-primary size-4 animate-spin", spinnerClassName)}
      />
      <span>{label}</span>
    </div>
  );
}
