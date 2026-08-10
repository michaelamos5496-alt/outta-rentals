import Link from "next/link";

import { getCustomerByEmail } from "@/lib/admin/store";
import { EmptyState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { QuoteStatusBadge } from "@/components/admin/quote-status-badge";
import { formatPrice } from "@/lib/currency";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Customer" };

export default async function AdminCustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const email = decodeURIComponent(id);
  const customer = getCustomerByEmail(email);

  if (!customer) {
    return (
      <EmptyState
        title="Customer not found"
        action={
          <Button asChild variant="outline">
            <Link href="/admin/customers">Back to customers</Link>
          </Button>
        }
      />
    );
  }

  const completedRentals = customer.quotes.filter(
    (q) => q.status === "completed" || q.status === "confirmed"
  );

  return (
    <div>
      <p className="text-small mb-2">
        <Link href="/admin/customers" className="hover:text-foreground">
          Customers
        </Link>
        <span className="mx-2 text-muted-foreground/50">/</span>
        <span className="text-foreground">{customer.name}</span>
      </p>
      <h1 className="text-h2">{customer.name}</h1>
      <p className="text-small mt-1">{customer.company}</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-3">
          <p className="text-label">Email</p>
          <p className="mt-1 text-sm">{customer.email}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-label">Phone</p>
          <p className="mt-1 text-sm">{customer.phone}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-label">Total quotes</p>
          <p className="mt-1 text-sm">{customer.quotes.length}</p>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-label mb-3">
          Rental history
          <span className="ml-2 normal-case text-muted-foreground">
            (confirmed/completed quotes — no orders system connected yet)
          </span>
        </p>
        {completedRentals.length === 0 ? (
          <p className="text-small">No rental history yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {completedRentals.map((quote) => (
              <Link
                key={quote.id}
                href={`/admin/quotes/${quote.id}`}
                className="flex items-center justify-between p-3 text-sm hover:bg-secondary/40"
              >
                <span>{quote.projectName}</span>
                <span className="text-muted-foreground">
                  {new Date(quote.startDate).toLocaleDateString()} →{" "}
                  {new Date(quote.endDate).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <p className="text-label mb-3">Quote history</p>
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {customer.quotes.map((quote) => (
            <Link
              key={quote.id}
              href={`/admin/quotes/${quote.id}`}
              className="flex items-center justify-between p-3 text-sm hover:bg-secondary/40"
            >
              <span>{quote.projectName}</span>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  {formatPrice(quote.estimatedTotal)}
                </span>
                <QuoteStatusBadge status={quote.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
