import { formatPrice } from "@/lib/currency";
import type { AdminQuote } from "./types";

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
  const fmt = (iso: string) => new Date(iso).toLocaleDateString();
  return `${fmt(quote.startDate)} → ${fmt(quote.endDate)}`;
}

export function quoteTotal(quote: AdminQuote): string {
  return quote.estimatedTotal > 0 ? formatPrice(quote.estimatedTotal) : "—";
}
