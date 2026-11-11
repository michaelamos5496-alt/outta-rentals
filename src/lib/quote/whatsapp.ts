import { formatPrice } from "@/lib/currency";
import { formatTime } from "@/lib/kit/rental";

/** A package booking, with prices already formatted (e.g. "₵2,600"). */
export interface WhatsAppPackageInput {
  /** Display name, e.g. "Commercial Package". */
  name: string;
  /** Tier, e.g. "LITE". */
  tierLabel?: string;
  /** Copies of the package booked. */
  quantity: number;
  /** One package for one day. */
  dayPrice: string;
  /** This package's total for the whole rental, when dates are valid. */
  total?: string;
  /** The equipment it includes, for one copy of the package × `quantity`. */
  items: { name: string; quantity: number }[];
}

export interface WhatsAppMessageInput {
  /**
   * Set for a kit order: "package" when it includes a package, "individual"
   * for plain equipment. Switches the message to the booking layout (booking
   * type, package name/price, total, customer details, status). Leave unset
   * for enquiries and other messages.
   */
  bookingType?: "package" | "individual";
  /** Packages in the order, when `bookingType` is "package". `items` then holds any extra, individually priced equipment. */
  packages?: WhatsAppPackageInput[];
  /** Rental length in days, when the dates are valid. */
  rentalDays?: number;
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
  /** Pickup / return times, 24h "HH:MM" — shown beside the dates when set. */
  startTime?: string;
  endTime?: string;
  /** Grand total across every item, formatted (e.g. "₵2,360") — shown as "Total:" when set. */
  total?: string;
  /**
   * Full-price sum before any package discount, formatted — when set
   * (alongside a lower `total`), shown as "Subtotal:" / "Package discount
   * applied" so the two numbers don't read as a math error.
   */
  subtotal?: string;
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
  if (input.bookingType) return buildBookingMessage(input);
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
    if (input.startTime && input.endTime) {
      lines.push(`Pickup ${formatTime(input.startTime)} · Return ${formatTime(input.endTime)}`, "");
    }
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

  if (input.subtotal && input.total && input.subtotal !== input.total) {
    lines.push(`Subtotal: ${input.subtotal}`, "Package discount applied", `Total: ${input.total}`, "");
  } else if (input.total) {
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

function dateRangeLine(input: WhatsAppMessageInput): string[] {
  if (!input.startDate || !input.endDate) return [];
  const range =
    input.startDate === input.endDate
      ? formatShortDate(input.startDate)
      : `${formatShortDate(input.startDate)} – ${formatShortDate(input.endDate)}`;
  const out = [`Dates: ${range}`];
  if (input.startTime && input.endTime) {
    out.push(`Pickup ${formatTime(input.startTime)} · Return ${formatTime(input.endTime)}`);
  }
  return out;
}

function durationLine(days: number | undefined): string[] {
  return days && days > 0 ? [`Rental Duration: ${days} day${days === 1 ? "" : "s"}`] : [];
}

/**
 * The kit-order message: says outright whether it's a package booking or an
 * individual rental, shows the package name and price (or each item's rate)
 * and the order total, then who it's for. Empty sections are left out.
 */
function buildBookingMessage(input: WhatsAppMessageInput): string {
  const isPackage = input.bookingType === "package" && (input.packages?.length ?? 0) > 0;
  const packages = isPackage ? (input.packages ?? []) : [];
  const items = input.items ?? [];
  const days = input.rentalDays;
  const lines: string[] = [
    isPackage ? "OUTTA RENTALS — PACKAGE BOOKING" : "OUTTA RENTALS — INDIVIDUAL RENTAL",
    "",
    `Booking Type: ${isPackage ? "Equipment Package" : "Individual Equipment Rental"}`,
    "",
  ];

  if (isPackage) {
    // One package and nothing else: the total sits right under the package price.
    const simple = packages.length === 1 && items.length === 0;
    for (const pkg of packages) {
      lines.push(`Package: ${pkg.name}${pkg.tierLabel ? ` — ${pkg.tierLabel}` : ""}`);
      lines.push(...durationLine(days));
      lines.push(`Package Price: ${pkg.dayPrice}/day`, `Quantity: ${pkg.quantity}`);
      if (simple && input.total) lines.push(`Total Amount: ${input.total}`);
      else if (pkg.total) lines.push(`Package Total: ${pkg.total}`);
      lines.push("", "Equipment Included:");
      for (const item of pkg.items) lines.push(`- ${item.name} × ${item.quantity}`);
      lines.push("");
    }
    if (items.length > 0) {
      lines.push("Additional Equipment:");
      for (const item of items) lines.push(`- ${itemLine(item)}`);
      lines.push("");
    }
    if (!simple && input.total) lines.push(`Total Amount: ${input.total}`, "");
  } else {
    if (items.length > 0) {
      lines.push("Equipment:");
      for (const item of items) lines.push(`- ${itemLine(item)}`);
      lines.push("");
    }
    lines.push(...durationLine(days));
    if (input.total) lines.push(`Total Amount: ${input.total}`);
    if (days || input.total) lines.push("");
  }

  const dates = dateRangeLine(input);
  if (dates.length > 0) lines.push(...dates, "");
  if (input.location) lines.push(`Location: ${input.location}`, "");

  if (input.customerName || input.customerPhone || input.customerEmail || input.projectLabel) {
    lines.push("Customer Details:");
    if (input.customerName) lines.push(`Name: ${input.customerName}`);
    if (input.customerPhone) lines.push(`Phone: ${input.customerPhone}`);
    if (input.customerEmail) lines.push(`Email: ${input.customerEmail}`);
    if (input.projectLabel) lines.push(`Project: ${input.projectLabel}`);
    lines.push("");
  }
  if (input.notes) lines.push("Notes:", input.notes, "");

  lines.push("Booking Status: Pending Confirmation");
  const closing = input.closingLine ?? "Please confirm this order and let me know the payment method.";
  if (closing) lines.push("", closing);
  return lines.join("\n").trimEnd();
}

function itemLine(item: NonNullable<WhatsAppMessageInput["items"]>[number]): string {
  const rate = typeof item.dayRate === "number" ? ` — ${formatPrice(item.dayRate, item.currency)}/day` : "";
  return `${item.name} × ${item.quantity}${rate}`;
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
