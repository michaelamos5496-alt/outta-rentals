import Link from "next/link";

import { getQuoteById } from "@/lib/admin/quotes";
import {
  formatDateTime,
  quoteCustomerLabel,
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

interface QuoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Quote" };

export default async function AdminQuoteDetailPage({ params }: QuoteDetailPageProps) {
  const { id } = await params;
  const quote = await getQuoteById(id);

  if (!quote) {
    return (
      <EmptyState
        title="Quote not found"
        description="It may have been removed."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/quotes">Back to quotes</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <p className="text-small mb-2">
        <Link href="/admin/quotes" className="hover:text-foreground">
          Quotes
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
            <p className="text-label mb-3">Equipment</p>
            <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
              {quote.kit.map((line) => (
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
                <span>Estimated total</span>
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
