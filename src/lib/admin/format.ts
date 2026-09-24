import { formatPrice } from "@/lib/currency";
import type { AdminQuote } from "./types";

// Admin dates always show Ghana-style (25/09/2026) in Accra time, whatever
// the server's or browser's own locale is.
const DATE = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Accra", dateStyle: "medium" });
const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Accra",
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : DATE.format(date);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : DATE_TIME.format(date);
}

// Send Kit orders can arrive without a name, project or valid dates — these
// keep every admin view readable instead of showing blanks or "Invalid Date".

export function quoteCustomerLabel(quote: AdminQuote): string {
  return quote.customerName || quote.customerPhone || quote.customerEmail || "Unnamed customer";
}

export function quoteTitle(quote: AdminQuote): string {
  if (quote.projectName) return quote.projectName;
  const items = quote.kit.reduce((n, line) => n + line.quantity, 0);
  return `Kit request · ${items} item${items === 1 ? "" : "s"}`;
}

export function quoteDateRange(quote: AdminQuote): string {
  if (!quote.startDate || !quote.endDate) return "No dates";
  return `${formatDate(quote.startDate)} → ${formatDate(quote.endDate)}`;
}

export function quoteTotal(quote: AdminQuote): string {
  return quote.estimatedTotal > 0 ? formatPrice(quote.estimatedTotal) : "—";
}

/** Confirmed (and completed) requests are orders; everything else is a quote. */
export function isOrder(quote: Pick<AdminQuote, "status">): boolean {
  return quote.status === "confirmed" || quote.status === "completed";
}

/** The admin page for a request — under Orders once confirmed, else Quotes. */
export function quoteHref(quote: Pick<AdminQuote, "id" | "status">): string {
  return `${isOrder(quote) ? "/admin/orders" : "/admin/quotes"}/${quote.id}`;
}
