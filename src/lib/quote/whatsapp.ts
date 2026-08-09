export interface WhatsAppMessageInput {
  /** Omit or leave empty for a general inquiry with no kit attached. */
  items?: { name: string; quantity: number }[];
  startDate?: string;
  endDate?: string;
  projectLabel?: string;
  location?: string;
  /** Defaults to "Please send me a quotation." — override for non-kit messages. */
  closingLine?: string;
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
  const items = input.items ?? [];
  const lines: string[] = ["OUTTA RENTALS — KIT REQUEST", ""];

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
      lines.push(`${item.name} × ${item.quantity}`);
    }
    lines.push("");
  }

  if (input.location) {
    lines.push("Location:", input.location, "");
  }

  lines.push(input.closingLine ?? "Please send me a quotation.");

  return lines.join("\n");
}

/** Reads the configured WhatsApp number. Never hardcode a fallback number here. */
export function getWhatsAppNumber(): string | null {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return number && number.trim() ? number.trim() : null;
}

export function getWhatsAppLink(input: WhatsAppMessageInput): string | null {
  const number = getWhatsAppNumber();
  if (!number) return null;
  const digitsOnly = number.replace(/[^\d]/g, "");
  const message = buildWhatsAppMessage(input);
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
