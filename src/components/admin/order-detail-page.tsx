import Link from "next/link";
import { redirect } from "next/navigation";

import { getQuoteById } from "@/lib/admin/quotes";
import {
  formatDateTime,
  isOrder,
  quoteCustomerLabel,
  quoteHref,
  quoteDateRange,
  quoteTitle,
  quoteTotal,
} from "@/lib/admin/format";
import { EmptyState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { QuoteDetailActions } from "@/components/admin/quote-detail-actions";
import { RentalTimeline } from "@/components/admin/rental-timeline";
import { todayIso } from "@/lib/kit/rental";
import { formatPrice } from "@/lib/currency";
import { PackageBadge } from "@/components/admin/package-badge";
import { groupQuoteKit } from "@/lib/admin/order-view";

/**
 * One page for a request, shown under Quotes until it's confirmed and under
 * Orders after. Visiting it under the wrong section redirects to the right one.
 */
export async function OrderDetailPage({ id, section }: { id: string; section: "quotes" | "orders" }) {
  const quote = await getQuoteById(id);

  if (!quote) {
    return (
      <EmptyState
        title={section === "orders" ? "Order not found" : "Quote not found"}
        description="It may have been deleted."
        action={
          <Button asChild variant="outline">
            <Link prefetch={false} href={`/admin/${section}`}>Back to {section}</Link>
          </Button>
        }
      />
    );
  }

  if (isOrder(quote) !== (section === "orders")) redirect(quoteHref(quote));

  const kitView = groupQuoteKit(quote.kit);

  return (
    <div>
      <p className="text-small mb-2">
        <Link prefetch={false} href={`/admin/${section}`} className="hover:text-foreground">
          {section === "orders" ? "Orders" : "Quotes"}
        </Link>
        <span className="mx-2 text-muted-foreground/50">/</span>
        <span className="text-foreground">{quoteTitle(quote)}</span>
      </p>
      <h1 className="text-h2">{quoteTitle(quote)}</h1>
      <p className="text-small mt-1">
        Received {formatDateTime(quote.createdAt)}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          <RentalTimeline quote={quote} today={todayIso()} />

          <section>
            <p className="text-label mb-3">Customer</p>
            <div className="rounded-2xl border border-border bg-card p-4 text-sm">
              <p className="font-medium">{quoteCustomerLabel(quote)}</p>
              {quote.customerCompany ? (
                <p className="text-small mt-1">{quote.customerCompany}</p>
              ) : null}
              {quote.customerEmail ? <p className="text-small mt-1">{quote.customerEmail}</p> : null}
              {quote.customerPhone ? <p className="text-small mt-1">{quote.customerPhone}</p> : null}
              {!quote.customerName && !quote.customerPhone && !quote.customerEmail ? (
                <p className="text-small mt-1">
                  No contact details were entered — check the WhatsApp chat for this request.
                </p>
              ) : null}
            </div>
          </section>

          <section>
            <p className="text-label mb-3">Project</p>
            <div className="rounded-2xl border border-border bg-card p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span>{quote.projectType || "—"}</span>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span>{quote.shootLocation || "—"}</span>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dates</span>
                <span>
                  {quoteDateRange(quote)}
                  {quote.rentalDays > 0 ? ` (${quote.rentalDays}d)` : ""}
                </span>
              </div>
            </div>
          </section>

          {quote.projectNotes ? (
            <section>
              <p className="text-label mb-3">Customer notes</p>
              <p className="rounded-2xl border border-border bg-card p-4 text-sm whitespace-pre-wrap">
                {quote.projectNotes}
              </p>
            </section>
          ) : null}

          <section>
            <p className="text-label mb-3">{kitView.packages.length > 0 ? "Booking" : "Equipment"}</p>
            <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
              {kitView.packages.map((pkg) => (
                <div key={pkg.key} className="p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <PackageBadge />
                      <p className="mt-1.5 text-base font-semibold">
                        {pkg.name}
                        {pkg.tierLabel ? ` — ${pkg.tierLabel}` : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Package price {formatPrice(pkg.dayPrice, pkg.currency)}/day · Quantity {pkg.quantity}
                        {quote.rentalDays > 0 ? ` · ${quote.rentalDays} day${quote.rentalDays === 1 ? "" : "s"}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 font-medium">
                      {quote.rentalDays > 0
                        ? formatPrice(pkg.dayPrice * pkg.quantity * quote.rentalDays, pkg.currency)
                        : `${formatPrice(pkg.dayPrice * pkg.quantity, pkg.currency)}/day`}
                    </span>
                  </div>
                  <p className="text-label mt-3 mb-1.5">Equipment included</p>
                  <ul className="flex flex-col gap-0.5 text-muted-foreground">
                    {pkg.items.map((line) => (
                      <li key={line.productSlug}>
                        {line.productName} × {line.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {kitView.packages.length > 0 && kitView.individuals.length > 0 ? (
                <p className="text-label bg-muted/40 px-3 py-2">Additional equipment</p>
              ) : null}
              {kitView.individuals.map((line) => (
                <div key={line.productSlug} className="flex justify-between p-3 text-sm">
                  <span>
                    {line.productName} × {line.quantity}
                    {quote.rentalDays > 0 ? ` × ${quote.rentalDays}d` : ""}
                  </span>
                  <span>
                    {quote.rentalDays > 0
                      ? formatPrice(line.dayRate * line.quantity * quote.rentalDays)
                      : `${formatPrice(line.dayRate)}/day`}
                  </span>
                </div>
              ))}
              <div className="flex justify-between p-3 text-sm font-medium">
                <span>{kitView.packages.length > 0 ? "Total amount" : "Estimated total"}</span>
                <span>{quoteTotal(quote)}</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-6">
          {/* Keyed by status so the panel resets when the timeline changes it. */}
          <QuoteDetailActions key={quote.status} quote={quote} />
        </aside>
      </div>
    </div>
  );
}
