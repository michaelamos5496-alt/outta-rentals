import { formatPrice } from "@/lib/currency";

export interface WhatsAppMessageInput {
  /** Omit or leave empty for a general inquiry with no kit attached. */
  items?: {
    name: string;
    quantity: number;
    /** Day rate and line total — when known, each item lists its own price so the message carries enough to confirm payment on, not just a list of gear. */
    dayRate?: number;
    lineTotal?: number;
    currency?: string;
  }[];
  startDate?: string;
  endDate?: string;
  /** Grand total across every item, formatted (e.g. "₵2,360") — shown as "Total:" when set. */
  total?: string;
  projectLabel?: string;
  location?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  /** Defaults to asking how to pay (prices are already fixed) — override for non-kit messages. */
  closingLine?: string;
  /** Defaults to "OUTTA RENTALS — KIT REQUEST". */
  heading?: string;
  /** Send this text as-is instead of building the structured message. */
  message?: string;
}

function formatShortDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(date);
}

/**
 * Builds the "OUTTA RENTALS — KIT REQUEST" message shared to WhatsApp.
 * Sections with no data (no project label, no location) are omitted rather
 * than rendered empty.
 */
export function buildWhatsAppMessage(input: WhatsAppMessageInput): string {
  if (input.message) return input.message;
  const items = input.items ?? [];
  const lines: string[] = [input.heading ?? "OUTTA RENTALS — KIT REQUEST", ""];

  if (input.projectLabel) {
    lines.push("Project:", input.projectLabel, "");
  }

  if (input.startDate && input.endDate) {
    const range =
      input.startDate === input.endDate
        ? formatShortDate(input.startDate)
        : `${formatShortDate(input.startDate)} – ${formatShortDate(input.endDate)}`;
    lines.push("Dates:", range, "");
  }

  if (items.length > 0) {
    lines.push("Equipment:", "");
    for (const item of items) {
      const hasPrice = typeof item.lineTotal === "number";
      const priceSuffix = hasPrice
        ? ` — ${formatPrice(item.lineTotal!, item.currency)}`
        : typeof item.dayRate === "number"
          ? ` — ${formatPrice(item.dayRate, item.currency)}/day`
          : "";
      lines.push(`${item.name} × ${item.quantity}${priceSuffix}`);
    }
    lines.push("");
  }

  if (input.total) {
    lines.push(`Total: ${input.total}`, "");
  }

  if (input.location) {
    lines.push("Location:", input.location, "");
  }

  if (input.customerName || input.customerPhone || input.customerEmail) {
    lines.push("Contact:");
    if (input.customerName) lines.push(input.customerName);
    if (input.customerPhone) lines.push(input.customerPhone);
    if (input.customerEmail) lines.push(input.customerEmail);
    lines.push("");
  }

  if (input.notes) {
    lines.push("Notes:", input.notes, "");
  }

  const closingLine = input.closingLine ?? "Please confirm this order and let me know the payment method.";
  if (closingLine) lines.push(closingLine);

  return lines.join("\n").trimEnd();
}

/** Reads the configured WhatsApp number. Never hardcode a fallback number here. */
export function getWhatsAppNumber(): string | null {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return number && number.trim() ? number.trim() : null;
}

/** Links to OUTTA's number by default; pass `to` to message someone else (e.g. a customer from admin). */
export function getWhatsAppLink(input: WhatsAppMessageInput, to?: string): string | null {
  const number = to ?? getWhatsAppNumber();
  if (!number) return null;
  let digitsOnly = number.replace(/[^\d]/g, "");
  // wa.me needs the country code — local Ghanaian numbers ("024…") become "23324…".
  if (digitsOnly.startsWith("00")) digitsOnly = digitsOnly.slice(2);
  else if (digitsOnly.startsWith("0")) digitsOnly = `233${digitsOnly.slice(1)}`;
  if (!digitsOnly) return null;
  const message = buildWhatsAppMessage(input);
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
