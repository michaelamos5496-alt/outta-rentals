import type { AdminQuote } from "./types";

/**
 * Where a confirmed rental is in its life, from the dates plus the two
 * one-tap marks in admin (picked up / returned). Pure and client-safe, so the
 * order page, dashboard alerts and browser notifications all agree.
 */
export type RentalStage =
  | "upcoming" // confirmed, pickup date still ahead
  | "pickup_today" // pickup/delivery is due today
  | "pickup_late" // start date passed, not marked picked up
  | "out" // picked up, return date still ahead
  | "due_today" // picked up, due back today
  | "overdue" // picked up, return date passed, not marked returned
  | "returned";

const DAY_MS = 86_400_000;

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round(
    (Date.parse(`${toIso.slice(0, 10)}T00:00:00Z`) - Date.parse(`${fromIso.slice(0, 10)}T00:00:00Z`)) /
      DAY_MS
  );
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function addDays(iso: string, n: number): string {
  return new Date(Date.parse(`${iso.slice(0, 10)}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
}

/** Null for orders that aren't (or never were) a confirmed rental with dates. */
export function rentalStage(quote: AdminQuote, today: string): RentalStage | null {
  if (quote.returnedAt) return "returned";
  if (quote.status !== "confirmed" || !quote.startDate || !quote.endDate) return null;
  const start = quote.startDate.slice(0, 10);
  const end = quote.endDate.slice(0, 10);

  if (!quote.pickedUpAt) {
    if (today < start) return "upcoming";
    if (today === start) return "pickup_today";
    return "pickup_late";
  }
  if (today < end) return "out";
  if (today === end) return "due_today";
  return "overdue";
}

export type RentalAlertKind =
  | "overdue"
  | "pickup_late"
  | "due_today"
  | "pickup_today"
  | "due_tomorrow"
  | "pickup_tomorrow";

export interface RentalAlert {
  kind: RentalAlertKind;
  quote: AdminQuote;
  /** Days overdue / late, for the two late kinds. */
  days: number;
}

const ORDER: RentalAlertKind[] = [
  "overdue",
  "pickup_late",
  "due_today",
  "pickup_today",
  "due_tomorrow",
  "pickup_tomorrow",
];

/** Everything that needs attention today or tomorrow, most urgent first. */
export function rentalAlerts(quotes: AdminQuote[], today: string): RentalAlert[] {
  const tomorrow = addDays(today, 1);
  const alerts: RentalAlert[] = [];

  for (const quote of quotes) {
    const stage = rentalStage(quote, today);
    if (!stage || stage === "returned") continue;
    const start = quote.startDate.slice(0, 10);
    const end = quote.endDate.slice(0, 10);

    if (stage === "overdue") alerts.push({ kind: "overdue", quote, days: daysBetween(end, today) });
    else if (stage === "pickup_late")
      alerts.push({ kind: "pickup_late", quote, days: daysBetween(start, today) });
    else if (stage === "due_today") alerts.push({ kind: "due_today", quote, days: 0 });
    else if (stage === "pickup_today") alerts.push({ kind: "pickup_today", quote, days: 0 });
    else if (stage === "out" && end === tomorrow) alerts.push({ kind: "due_tomorrow", quote, days: 0 });
    else if (stage === "upcoming" && start === tomorrow)
      alerts.push({ kind: "pickup_tomorrow", quote, days: 0 });
  }

  return alerts.sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || b.days - a.days);
}

export const alertLabels: Record<RentalAlertKind, string> = {
  overdue: "Overdue return",
  pickup_late: "Not picked up yet",
  due_today: "Due back today",
  pickup_today: "Pickup today",
  due_tomorrow: "Due back tomorrow",
  pickup_tomorrow: "Pickup tomorrow",
};

/** Overdue and late ones are urgent (red); the rest are heads-ups. */
export function isUrgent(kind: RentalAlertKind): boolean {
  return kind === "overdue" || kind === "pickup_late";
}

// ------------------------------------------------------ Customer reminders

function kitSummary(quote: AdminQuote): string {
  return quote.kit.map((k) => `• ${k.productName} × ${k.quantity}`).join("\n");
}

function prettyDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Accra",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
}

/** Ready-written WhatsApp reminder to the customer, or null if not applicable. */
export function reminderMessage(
  quote: AdminQuote,
  kind: "pickup" | "return",
  today: string
): string | null {
  if (!quote.startDate || !quote.endDate) return null;
  const hi = quote.customerName ? `Hi ${quote.customerName.split(" ")[0]},` : "Hi,";
  const items = kitSummary(quote);

  if (kind === "pickup") {
    if (today > quote.startDate.slice(0, 10)) {
      return `${hi} this is OUTTA RENTALS. Your kit has been ready since ${prettyDate(quote.startDate)}:\n\n${items}\n\nPlease let us know when you'd like to collect it.`;
    }
    const when = quote.startDate.slice(0, 10) === today ? "today" : `on ${prettyDate(quote.startDate)}`;
    const how = quote.deliveryMethod === "delivery" ? "will be delivered" : "is ready for pickup";
    return `${hi} a quick reminder from OUTTA RENTALS — your kit ${how} ${when}:\n\n${items}\n\nSee you then!`;
  }

  const end = quote.endDate.slice(0, 10);
  if (today > end) {
    return `${hi} this is OUTTA RENTALS. Your kit was due back on ${prettyDate(end)}:\n\n${items}\n\nPlease let us know when you can return it. Thank you!`;
  }
  const when = end === today ? "today" : `on ${prettyDate(end)}`;
  return `${hi} a friendly reminder from OUTTA RENTALS — your kit is due back ${when}:\n\n${items}\n\nThank you for renting with us!`;
}
