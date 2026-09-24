import { Download } from "lucide-react";

import { listQuotes } from "@/lib/admin/quotes";
import { isOrder } from "@/lib/admin/format";
import { Button } from "@/components/ui/button";
import { QuotesTable } from "@/components/admin/quotes-table";

export const metadata = { title: "Quotes" };

export default async function AdminQuotesPage() {
  const quotes = (await listQuotes()).filter((q) => !isOrder(q));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-h2">Quotes</h1>
          <p className="text-small mt-1">
            Requests not confirmed yet ({quotes.length}). Confirming one moves it to Orders.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href="/admin/export?type=quotes" download>
            <Download /> Download as spreadsheet
          </a>
        </Button>
      </div>
      <div className="mt-6">
        <QuotesTable quotes={quotes} statuses={["new", "reviewing", "quoted", "cancelled"]} />
      </div>
    </div>
  );
}
