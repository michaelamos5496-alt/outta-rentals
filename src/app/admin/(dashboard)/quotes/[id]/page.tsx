import Link from "next/link";

import { getQuoteById } from "@/lib/admin/store";
import { EmptyState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { QuoteDetailActions } from "@/components/admin/quote-detail-actions";

interface QuoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Quote" };

export default async function AdminQuoteDetailPage({ params }: QuoteDetailPageProps) {
  const { id } = await params;
  const quote = getQuoteById(id);

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
        <span className="text-foreground">{quote.projectName}</span>
      </p>
      <h1 className="text-h2">{quote.projectName}</h1>
      <p className="text-small mt-1">
        Submitted {new Date(quote.createdAt).toLocaleString()}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          <section>
            <p className="text-label mb-3">Customer</p>
            <div className="rounded-lg border border-border p-4 text-sm">
              <p className="font-medium">{quote.customerName}</p>
              <p className="text-small mt-1">{quote.customerCompany}</p>
              <p className="text-small mt-1">{quote.customerEmail}</p>
              <p className="text-small mt-1">{quote.customerPhone}</p>
            </div>
          </section>

          <section>
            <p className="text-label mb-3">Project</p>
            <div className="rounded-lg border border-border p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span>{quote.projectType}</span>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span>{quote.shootLocation}</span>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dates</span>
                <span>
                  {new Date(quote.startDate).toLocaleDateString()} →{" "}
                  {new Date(quote.endDate).toLocaleDateString()} ({quote.rentalDays}d)
                </span>
              </div>
            </div>
          </section>

          <section>
            <p className="text-label mb-3">Equipment</p>
            <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {quote.kit.map((line) => (
                <div key={line.productSlug} className="flex justify-between p-3 text-sm">
                  <span>
                    {line.productName} × {line.quantity} × {quote.rentalDays}d
                  </span>
                  <span>
                    ${(line.dayRate * line.quantity * quote.rentalDays).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between p-3 text-sm font-medium">
                <span>Estimated total</span>
                <span>${quote.estimatedTotal.toLocaleString()}</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-border p-4 lg:sticky lg:top-6">
          <QuoteDetailActions quote={quote} />
        </aside>
      </div>
    </div>
  );
}
