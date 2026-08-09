import { Badge } from "@/components/ui/badge";
import type { AdminQuoteStatus } from "@/lib/admin/types";

export const quoteStatusLabels: Record<AdminQuoteStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  quoted: "Quoted",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const quoteStatusVariant: Record<AdminQuoteStatus, "outline" | "technical" | "secondary" | "destructive" | "brand"> = {
  new: "brand",
  reviewing: "technical",
  quoted: "secondary",
  confirmed: "outline",
  completed: "outline",
  cancelled: "destructive",
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
  return <Badge variant={quoteStatusVariant[status]}>{quoteStatusLabels[status]}</Badge>;
}

export { QuoteStatusBadge };
