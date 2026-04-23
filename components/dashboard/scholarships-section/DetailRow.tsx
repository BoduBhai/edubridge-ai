import type { ReactNode } from "react";

type DetailRowProps = {
  label: string;
  value: ReactNode;
};

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="border-border/60 grid grid-cols-[160px_1fr] gap-3 border-b py-2 text-sm last:border-b-0">
      <p className="text-muted-foreground font-medium">{label}</p>
      <div className="text-foreground">{value}</div>
    </div>
  );
}
