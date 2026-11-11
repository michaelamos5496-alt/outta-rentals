import Link from "next/link";
import { BellRing, CheckCircle2 } from "lucide-react";

import { WhatsAppButton } from "@/components/quote/whatsapp-button";
import { formatDate } from "@/lib/admin/format";
import {
  alertLabels,
  isUrgent,
  reminderMessage,
  type RentalAlert,
} from "@/lib/admin/rental";
import { quoteCustomerLabel, quoteHref } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

function alertDetail(alert: RentalAlert): string {
  const { quote } = alert;
  switch (alert.kind) {
    case "overdue":
      return `Was due back ${formatDate(quote.endDate)} — ${alert.days} day${alert.days === 1 ? "" : "s"} late`;
    case "pickup_late":
      return `Was due out ${formatDate(quote.startDate)} — not marked picked up`;
    case "due_today":
    case "due_tomorrow":
      return `Due back ${formatDate(quote.endDate)}`;
    default:
      return `Goes out ${formatDate(quote.startDate)}`;
  }
}

/** Dashboard "Needs attention": pickups and returns today/tomorrow, and anything late. */
function RentalAlertsPanel({ alerts, today }: { alerts: RentalAlert[]; today: string }) {
  return (
    <section className="mt-6">
      <h2 className="flex items-center gap-2 text-sm font-medium">
        <BellRing className="size-4 text-brand" /> Needs attention
      </h2>
      <div className="mt-3 flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
        {alerts.length === 0 ? (
          <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-brand" />
            Nothing due today or tomorrow, and nothing overdue.
          </p>
        ) : (
          alerts.map((alert) => {
            const urgent = isUrgent(alert.kind);
            const isReturn = alert.kind === "overdue" || alert.kind.startsWith("due_");
            const message = reminderMessage(alert.quote, isReturn ? "return" : "pickup", today);
            return (
              <div
                key={`${alert.kind}-${alert.quote.id}`}
                className={cn(
                  "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between",
                  urgent && "bg-destructive/5"
                )}
              >
                <Link prefetch={false} href={quoteHref(alert.quote)} className="min-w-0 hover:text-brand">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        urgent ? "bg-destructive text-white" : "bg-brand/15 text-brand"
                      )}
                    >
                      {alertLabels[alert.kind]}
                    </span>
                    {quoteCustomerLabel(alert.quote)}
                  </p>
                  <p className="text-small mt-1 truncate">
                    {alertDetail(alert)} · {alert.quote.kit.map((k) => k.productName).join(", ")}
                  </p>
                </Link>
                {alert.quote.customerPhone && message ? (
                  <WhatsAppButton
                    to={alert.quote.customerPhone}
                    message={message}
                    label="Remind"
                    size="sm"
                    variant={urgent ? "default" : "outline"}
                    className="shrink-0 self-start sm:self-center"
                  />
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export { RentalAlertsPanel };
