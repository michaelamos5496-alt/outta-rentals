import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

import { listQuotes } from "@/lib/admin/quotes";
import { isOrder, quoteCustomerLabel, quoteDateRange, quoteHref, quoteTitle } from "@/lib/admin/format";
import { rentalStage, type RentalStage } from "@/lib/admin/rental";
import { todayIso } from "@/lib/kit/rental";
import { EmptyState } from "@/components/ui/state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const metadata = { title: "Orders" };

const stageLabels: Record<RentalStage | "completed", string> = {
  upcoming: "Upcoming",
  pickup_today: "Pickup today",
  pickup_late: "Not picked up",
  out: "Out on rental",
  due_today: "Due back today",
  overdue: "Overdue",
  returned: "Returned",
  completed: "Completed",
};

const stageStyles: Record<RentalStage | "completed", string> = {
  upcoming: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  pickup_today: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  pickup_late: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  out: "bg-brand text-brand-foreground",
  due_today: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  overdue: "bg-red-600 text-white",
  returned: "bg-muted text-muted-foreground",
  completed: "bg-muted text-muted-foreground",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const showCompleted = view === "completed";
  const today = todayIso();
  const orders = (await listQuotes()).filter(isOrder);

  const active = orders
    .filter((q) => q.status === "confirmed" && !q.returnedAt)
    .sort((a, b) => (a.startDate || "9999").localeCompare(b.startDate || "9999"));
  const completed = orders
    .filter((q) => q.status === "completed" || q.returnedAt)
    .sort((a, b) => (b.returnedAt || b.endDate).localeCompare(a.returnedAt || a.endDate));
  const rows = showCompleted ? completed : active;

  return (
    <div>
      <h1 className="text-h2">Orders</h1>
      <p className="text-small mt-1">
        Confirmed rentals — booked, out with customers, or returned. Confirming a quote moves it here.
      </p>

      <div className="mt-6 inline-flex rounded-full border border-border bg-card p-1 text-sm">
        {[
          { label: `Active (${active.length})`, href: "/admin/orders", on: !showCompleted },
          { label: `Completed (${completed.length})`, href: "/admin/orders?view=completed", on: showCompleted },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-full px-4 py-1.5 transition-colors",
              tab.on ? "bg-brand font-medium text-brand-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-4">
        {rows.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title={showCompleted ? "No completed orders yet" : "No active orders"}
            description={
              showCompleted
                ? "Orders appear here once they're marked returned."
                : "Confirm a quote and it will appear here until the equipment is returned."
            }
          />
        ) : (
          <div className="rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((quote) => {
                  const stage = rentalStage(quote, today) ?? "completed";
                  const href = quoteHref(quote);
                  return (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <Link href={href} className="block hover:text-brand">
                          <p className="font-medium">{quoteCustomerLabel(quote)}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{quoteTitle(quote)}</p>
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-72">
                        <Link href={href} className="line-clamp-2 block whitespace-normal">
                          {quote.kit.map((k) => `${k.productName} × ${k.quantity}`).join(", ")}
                        </Link>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{quoteDateRange(quote)}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                            stageStyles[stage]
                          )}
                        >
                          {stageLabels[stage]}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
