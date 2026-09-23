import Link from "next/link";
import {
  CalendarCheck2,
  CalendarClock,
  FileQuestion,
  Inbox,
  PackageX,
  Sparkles,
} from "lucide-react";

import { listProducts } from "@/lib/admin/store";
import { listProductStock, listQuotes } from "@/lib/admin/quotes";
import { listEnquiries } from "@/lib/admin/enquiries";
import {
  formatDateTime,
  quoteCustomerLabel,
  quoteDateRange,
  quoteTitle,
} from "@/lib/admin/format";
import { todayIso } from "@/lib/kit/rental";
import { StatCard } from "@/components/admin/stat-card";
import { QuoteStatusBadge } from "@/components/admin/quote-status-badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Dashboard" };

const DAY_MS = 86_400_000;

export default async function AdminDashboardPage() {
  const [quotes, enquiries, stock] = await Promise.all([
    listQuotes(),
    listEnquiries(),
    listProductStock(),
  ]);
  const today = todayIso();
  const monthAgo = new Date(`${today}T00:00:00Z`).getTime() - 30 * DAY_MS;

  const confirmed = quotes.filter((q) => q.status === "confirmed" && q.startDate && q.endDate);
  const outNow = confirmed.filter((q) => q.startDate <= today && q.endDate >= today);
  const upcoming = confirmed.filter((q) => q.startDate > today);
  const newOrders = quotes.filter((q) => q.status === "new");
  const inProgress = quotes.filter((q) => q.status === "reviewing" || q.status === "quoted");
  const recentEnquiries = enquiries.filter((e) => new Date(e.createdAt).getTime() >= monthAgo);
  const outOfService = listProducts().filter((p) => {
    const status = stock.get(p.slug)?.status ?? p.availability;
    return !p.archived && (status === "maintenance" || status === "unavailable");
  });

  return (
    <div>
      <h1 className="text-h2">Dashboard</h1>
      <p className="text-small mt-1">Your record of orders and enquiries from the website.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="New orders"
          value={newOrders.length}
          icon={Sparkles}
          hint="Not looked at yet"
          highlight={newOrders.length > 0}
        />
        <StatCard
          label="In progress"
          value={inProgress.length}
          icon={FileQuestion}
          hint="Reviewing or quoted"
        />
        <StatCard label="Out now" value={outNow.length} icon={CalendarCheck2} hint="Confirmed, dates include today" />
        <StatCard label="Upcoming" value={upcoming.length} icon={CalendarClock} hint="Confirmed, starting later" />
        <StatCard label="Enquiries" value={recentEnquiries.length} icon={Inbox} hint="Last 30 days" />
        <StatCard
          label="Out of service"
          value={outOfService.length}
          icon={PackageX}
          hint="Maintenance or unavailable"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Recent orders</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/quotes">View all</Link>
            </Button>
          </div>
          <div className="mt-3 flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
            {quotes.length === 0 ? (
              <p className="text-small p-4">No orders yet. Send Kit orders from the website appear here.</p>
            ) : (
              quotes.slice(0, 6).map((quote) => (
                <Link
                  key={quote.id}
                  href={`/admin/quotes/${quote.id}`}
                  className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-secondary/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{quoteCustomerLabel(quote)}</p>
                    <p className="text-small mt-0.5 truncate">
                      {quoteTitle(quote)} · {quoteDateRange(quote)}
                    </p>
                  </div>
                  <QuoteStatusBadge status={quote.status} />
                </Link>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Recent enquiries</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/enquiries">View all</Link>
            </Button>
          </div>
          <div className="mt-3 flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
            {enquiries.length === 0 ? (
              <p className="text-small p-4">
                No enquiries yet. Contact form and consultation messages appear here.
              </p>
            ) : (
              enquiries.slice(0, 6).map((enquiry) => (
                <Link
                  key={enquiry.id}
                  href="/admin/enquiries"
                  className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-secondary/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{enquiry.name || enquiry.phone || "Unnamed"}</p>
                    <p className="text-small mt-0.5 truncate">{enquiry.message}</p>
                  </div>
                  <span className="text-meta shrink-0">{formatDateTime(enquiry.createdAt)}</span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
