import { getAdminSession } from "@/lib/admin/auth";
import { quoteCustomerLabel, quoteHref } from "@/lib/admin/format";
import { listQuotes } from "@/lib/admin/quotes";
import { listEnquiries } from "@/lib/admin/enquiries";
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

// New-request/enquiry alerts only look back this far, so turning notifications
// on for the first time doesn't fire a backlog of every "new" quote or
// enquiry that's ever been sitting unactioned.
const RECENT_MS = 3 * 24 * 60 * 60 * 1000;

/** Lightweight alert list for the sidebar badge and browser notifications. Admin only. */
export async function GET() {
  if (!(await getAdminSession())) return new Response("Not authorized", { status: 401 });

  const today = todayIso();
  const cutoff = Date.now() - RECENT_MS;
  const [quotes, enquiries] = await Promise.all([listQuotes(), listEnquiries()]);

  const rentalAlertSummaries: AlertSummary[] = rentalAlerts(quotes, today).map((a) => ({
    // Includes the date so each day's reminder notifies once.
    key: `${today}:${a.kind}:${a.quote.id}`,
    href: quoteHref(a.quote),
    label: alertLabels[a.kind],
    customer: quoteCustomerLabel(a.quote),
    urgent: isUrgent(a.kind),
  }));

  const newRequestAlerts: AlertSummary[] = quotes
    .filter((q) => q.status === "new" && Date.parse(q.createdAt) >= cutoff)
    .map((q) => ({
      // No date in the key — a new request should only ever notify once.
      key: `new-request:${q.id}`,
      href: quoteHref(q),
      label: "New request",
      customer: quoteCustomerLabel(q),
      urgent: false,
    }));

  const newEnquiryAlerts: AlertSummary[] = enquiries
    .filter((e) => Date.parse(e.createdAt) >= cutoff)
    .map((e) => ({
      key: `new-enquiry:${e.id}`,
      href: "/admin/enquiries",
      label: e.kind === "consultation" ? "New consultation request" : "New enquiry",
      customer: e.name || e.phone || e.email || "Someone",
      urgent: false,
    }));

  const alerts = [...rentalAlertSummaries, ...newRequestAlerts, ...newEnquiryAlerts];

  return Response.json({ alerts }, { headers: { "Cache-Control": "no-store" } });
}
