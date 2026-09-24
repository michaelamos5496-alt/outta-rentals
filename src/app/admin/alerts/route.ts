import { getAdminSession } from "@/lib/admin/auth";
import { quoteCustomerLabel, quoteHref } from "@/lib/admin/format";
import { listQuotes } from "@/lib/admin/quotes";
import { alertLabels, isUrgent, rentalAlerts } from "@/lib/admin/rental";
import { todayIso } from "@/lib/kit/rental";

export const dynamic = "force-dynamic";

export interface AlertSummary {
  key: string;
  href: string;
  label: string;
  customer: string;
  urgent: boolean;
}

/** Lightweight alert list for the sidebar badge and browser notifications. Admin only. */
export async function GET() {
  if (!(await getAdminSession())) return new Response("Not authorized", { status: 401 });

  const today = todayIso();
  const alerts: AlertSummary[] = rentalAlerts(await listQuotes(), today).map((a) => ({
    // Includes the date so each day's reminder notifies once.
    key: `${today}:${a.kind}:${a.quote.id}`,
    href: quoteHref(a.quote),
    label: alertLabels[a.kind],
    customer: quoteCustomerLabel(a.quote),
    urgent: isUrgent(a.kind),
  }));

  return Response.json({ alerts }, { headers: { "Cache-Control": "no-store" } });
}
