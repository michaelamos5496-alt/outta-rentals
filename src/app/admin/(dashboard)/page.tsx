import Link from "next/link";
import {
  Boxes,
  CalendarClock,
  CalendarCheck2,
  DollarSign,
  FileQuestion,
  PackageCheck,
  PackageX,
} from "lucide-react";

import { listProducts, listQuotes } from "@/lib/admin/store";
import { StatCard } from "@/components/admin/stat-card";
import { QuoteStatusBadge } from "@/components/admin/quote-status-badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";

export const metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  const products = listProducts().filter((p) => !p.archived);
  const quotes = listQuotes();
  const today = new Date();

  const activeRentals = quotes.filter(
    (q) => q.status === "confirmed" && new Date(q.startDate) <= today && new Date(q.endDate) >= today
  );
  const upcomingRentals = quotes.filter(
    (q) => q.status === "confirmed" && new Date(q.startDate) > today
  );
  const pendingQuotes = quotes.filter((q) => ["new", "reviewing", "quoted"].includes(q.status));
  const availableEquipment = products.filter((p) => p.availability === "available");
  const reservedEquipment = products.filter((p) => p.availability === "reserved");
  const revenue = quotes
    .filter((q) => q.status === "completed")
    .reduce((sum, q) => sum + q.estimatedTotal, 0);
  const recentEnquiries = quotes.slice(0, 6);

  return (
    <div>
      <h1 className="text-h2">Dashboard</h1>
      <p className="text-small mt-1">An overview of what needs attention.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Active rentals" value={activeRentals.length} icon={CalendarCheck2} />
        <StatCard label="Upcoming rentals" value={upcomingRentals.length} icon={CalendarClock} />
        <StatCard label="Pending quotes" value={pendingQuotes.length} icon={FileQuestion} />
        <StatCard label="Available equipment" value={availableEquipment.length} icon={PackageCheck} />
        <StatCard label="Reserved equipment" value={reservedEquipment.length} icon={PackageX} />
        <StatCard label="Total products" value={products.length} icon={Boxes} />
        <StatCard
          label="Revenue"
          value={formatPrice(revenue)}
          icon={DollarSign}
          hint="Placeholder — completed quotes only, no payments connected."
        />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Recent enquiries</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/quotes">View all</Link>
          </Button>
        </div>
        <div className="mt-3 flex flex-col divide-y divide-border rounded-lg border border-border">
          {recentEnquiries.length === 0 ? (
            <p className="text-small p-4">No enquiries yet.</p>
          ) : (
            recentEnquiries.map((quote) => (
              <Link
                key={quote.id}
                href={`/admin/quotes/${quote.id}`}
                className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-secondary/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{quote.customerName}</p>
                  <p className="text-small mt-0.5 truncate">
                    {quote.projectName} · {quote.projectType}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-small">{formatPrice(quote.estimatedTotal)}</span>
                  <QuoteStatusBadge status={quote.status} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
