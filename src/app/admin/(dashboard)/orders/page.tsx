import { ClipboardList } from "lucide-react";

import { EmptyState } from "@/components/ui/state";

export const metadata = { title: "Orders" };

const plannedFields = [
  { field: "Rental dates", detail: "Start / end date, derived from the confirmed quote" },
  { field: "Equipment", detail: "Line items with quantity, sourced from the quote's kit snapshot" },
  { field: "Customer", detail: "Linked customer record (name, company, email, phone)" },
  { field: "Status", detail: "draft → confirmed → out → returned / cancelled" },
  { field: "Amount", detail: "Total charge for the rental period" },
  { field: "Deposit", detail: "Refundable hold taken against equipment value" },
  { field: "Payment status", detail: "unpaid / deposit paid / paid in full / refunded" },
];

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="text-h2">Orders</h1>
      <p className="text-small mt-1">
        Architecture prepared, not yet wired up — orders will be created from
        confirmed quotes once payments are connected.
      </p>

      <div className="mt-6">
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="Confirmed quotes don't automatically become orders in this phase. The table below is the schema this page will read from (see orders in schema.sql)."
        />
      </div>

      <div className="mt-8 rounded-lg border border-border">
        <div className="border-b border-border p-4">
          <p className="text-sm font-medium">Planned fields</p>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {plannedFields.map((row) => (
            <div key={row.field} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-6">
              <p className="w-40 shrink-0 text-sm font-medium">{row.field}</p>
              <p className="text-small">{row.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
