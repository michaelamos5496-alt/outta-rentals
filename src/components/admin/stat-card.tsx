import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  /** Draws attention (green) when there's something to act on. */
  highlight?: boolean;
}

function StatCard({ label, value, icon: Icon, hint, highlight }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        highlight ? "border-brand bg-brand text-brand-foreground" : "border-border bg-card"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cn("text-sm font-medium", highlight ? "text-brand-foreground/85" : "text-muted-foreground")}>
          {label}
        </p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            highlight ? "bg-brand-foreground/15" : "bg-brand/10 text-brand"
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-heading text-3xl font-semibold tabular-nums">{value}</p>
      {hint ? (
        <p className={cn("mt-1 text-xs", highlight ? "text-brand-foreground/75" : "text-muted-foreground")}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export { StatCard };
