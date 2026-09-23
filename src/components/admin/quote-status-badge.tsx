import { cn } from "@/lib/utils";
import type { AdminQuoteStatus } from "@/lib/admin/types";

export const quoteStatusLabels: Record<AdminQuoteStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  quoted: "Quoted",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

// One colour per step so the pipeline reads at a glance.
const quoteStatusStyle: Record<AdminQuoteStatus, string> = {
  new: "bg-brand text-brand-foreground",
  reviewing: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  quoted: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  confirmed: "bg-brand/15 text-brand",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

export const quoteStatuses: AdminQuoteStatus[] = [
  "new",
  "reviewing",
  "quoted",
  "confirmed",
  "completed",
  "cancelled",
];

function QuoteStatusBadge({ status }: { status: AdminQuoteStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        quoteStatusStyle[status]
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {quoteStatusLabels[status]}
    </span>
  );
}

export { QuoteStatusBadge };
