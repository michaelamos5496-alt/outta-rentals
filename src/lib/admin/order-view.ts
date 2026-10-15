import type { AdminQuote, AdminQuoteKitLine } from "./types";

/** A package booking inside an order, rebuilt from the saved snapshot. */
export interface QuotePackage {
  key: string;
  /** e.g. "Commercial Package". */
  name: string;
  tierLabel: string;
  quantity: number;
  /** The package price for one day, as ordered. */
  dayPrice: number;
  currency: string;
  items: AdminQuoteKitLine[];
}

export interface QuoteKitView {
  packages: QuotePackage[];
  individuals: AdminQuoteKitLine[];
}

function isPackageLine(line: AdminQuoteKitLine): boolean {
  return (
    typeof line.packageSlug === "string" &&
    line.packageSlug !== "" &&
    typeof line.packageDayPrice === "number" &&
    Number.isFinite(line.packageDayPrice)
  );
}

/**
 * Splits an order's equipment into package bookings and individually rented
 * items. Older orders (and any line missing its package details) come out as
 * individual rentals, so every saved order stays readable.
 */
export function groupQuoteKit(kit: AdminQuoteKitLine[] | null | undefined): QuoteKitView {
  const packages = new Map<string, QuotePackage>();
  const individuals: AdminQuoteKitLine[] = [];
  for (const line of Array.isArray(kit) ? kit : []) {
    if (!line || typeof line !== "object") continue;
    if (!isPackageLine(line)) {
      individuals.push(line);
      continue;
    }
    const key = `${line.packageSlug}::${line.packageTierSlug ?? ""}`;
    const existing = packages.get(key);
    if (existing) {
      existing.items.push(line);
    } else {
      packages.set(key, {
        key,
        name: line.packageName || "Package",
        tierLabel: line.packageTierLabel ?? "",
        quantity: line.packageQuantity && line.packageQuantity > 0 ? line.packageQuantity : 1,
        dayPrice: line.packageDayPrice as number,
        currency: line.currency ?? "GHS",
        items: [line],
      });
    }
  }
  return { packages: [...packages.values()], individuals };
}

export function isPackageOrder(quote: Pick<AdminQuote, "kit">): boolean {
  return groupQuoteKit(quote.kit).packages.length > 0;
}

/** "Commercial Package — LITE", or several joined with " + ". Empty for a plain rental. */
export function quotePackageLabel(quote: Pick<AdminQuote, "kit">): string {
  return groupQuoteKit(quote.kit)
    .packages.map((p) => (p.tierLabel ? `${p.name} — ${p.tierLabel}` : p.name))
    .join(" + ");
}
