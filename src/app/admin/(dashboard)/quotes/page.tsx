import { listQuotes } from "@/lib/admin/store";
import { QuotesTable } from "@/components/admin/quotes-table";

export const metadata = { title: "Quotes" };

export default function AdminQuotesPage() {
  const quotes = listQuotes();

  return (
    <div>
      <h1 className="text-h2">Quotes</h1>
      <p className="text-small mt-1">{quotes.length} total</p>
      <div className="mt-6">
        <QuotesTable quotes={quotes} />
      </div>
    </div>
  );
}
