import { getProductBySlug } from "@/lib/catalogue";
import { getPackageBySlug, getTierBySlug } from "@/lib/packages";
import { resolveKitBreakdown } from "@/lib/kit/pricing";
import { calculateRentalDays, validateDateRange } from "@/lib/kit/rental";
import type { KitLineItem } from "@/lib/kit/types";

/**
 * Turns a submitted kit request into the order record OUTTA stores — pure
 * and free of any database or browser code so it can be tested directly.
 *
 * Nothing the customer's browser says about prices is believed. Product
 * names and rates come from the catalogue, and a package's name, tier and
 * price come from OUTTA's own package data, looked up by slug. A package
 * claim only counts if the cart still holds exactly that package's
 * equipment; otherwise the items are priced one by one.
 */

export const MAX_ITEMS = 100;
export const MAX_QUANTITY = 999;

/** One equipment line as stored in `quote_requests.kit_snapshot`. */
export interface BookingLine {
  productSlug: string;
  productName: string;
  quantity: number;
  /** The item's own day rate (what it costs rented on its own). */
  dayRate: number;
  /** Set on every line that belongs to a package booking. */
  packageSlug?: string;
  packageName?: string;
  packageTierSlug?: string;
  packageTierLabel?: string;
  /** How many copies of the package were booked (usually 1). */
  packageQuantity?: number;
  /** One package's price for one day — the configured package price. */
  packageDayPrice?: number;
  currency?: string;
}

export interface BookingInput {
  items: unknown;
  startDate?: unknown;
  endDate?: unknown;
}

export type BuiltBooking =
  | {
      ok: true;
      kit: BookingLine[];
      rentalDays: number | null;
      /** Server-calculated total in the order's currency; null without valid dates. */
      estimatedTotal: number | null;
      startDate: string;
      endDate: string;
      /** True when the order contains at least one package. */
      hasPackage: boolean;
      /** Package claims that couldn't be verified and were priced item by item. */
      warnings: string[];
    }
  | { ok: false; error: string };

function clean(items: unknown): { items: KitLineItem[]; claimed: Set<string> } {
  const out: KitLineItem[] = [];
  const claimed = new Set<string>();
  if (!Array.isArray(items)) return { items: out, claimed };
  for (const raw of items.slice(0, MAX_ITEMS)) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    if (typeof item.productSlug !== "string") continue;
    if (!Number.isInteger(item.quantity) || (item.quantity as number) < 1) continue;
    if (!getProductBySlug(item.productSlug)) continue;
    const line: KitLineItem = {
      productSlug: item.productSlug,
      quantity: Math.min(item.quantity as number, MAX_QUANTITY),
    };
    if (typeof item.packageSlug === "string" && typeof item.packageTierSlug === "string") {
      // The slugs are only a claim; whether they're real is checked below.
      line.packageSlug = item.packageSlug.slice(0, 80);
      line.packageTierSlug = item.packageTierSlug.slice(0, 80);
      claimed.add(`${line.packageSlug}::${line.packageTierSlug}`);
    }
    out.push(line);
  }
  return { items: out, claimed };
}

export function buildBooking(input: BookingInput): BuiltBooking {
  if (!input || typeof input !== "object") return { ok: false, error: "No request." };
  const { items, claimed } = clean(input.items);
  if (items.length === 0) return { ok: false, error: "The request has no valid equipment." };

  const startDate = typeof input.startDate === "string" ? input.startDate : "";
  const endDate = typeof input.endDate === "string" ? input.endDate : "";
  const datesValid = validateDateRange(startDate, endDate).valid;
  const rentalDays = datesValid ? calculateRentalDays(startDate, endDate) : null;

  // Priced as one day when there are no valid dates, just to work out which
  // package groups are genuine; the stored total stays null in that case.
  const breakdown = resolveKitBreakdown(items, rentalDays ?? 1);

  const kit: BookingLine[] = [];
  for (const group of breakdown.packages) {
    for (const line of group.items) {
      kit.push({
        productSlug: line.product.slug,
        productName: line.product.name,
        quantity: line.quantity,
        dayRate: line.product.dayRate,
        packageSlug: group.packageSlug,
        packageName: group.packageName,
        packageTierSlug: group.tierSlug,
        packageTierLabel: group.tierLabel,
        packageQuantity: group.quantity,
        packageDayPrice: group.dayPrice,
        currency: group.currency,
      });
    }
  }
  for (const line of breakdown.individuals) {
    kit.push({
      productSlug: line.product.slug,
      productName: line.product.name,
      quantity: line.quantity,
      dayRate: line.product.dayRate,
      currency: line.product.currency,
    });
  }

  const warnings: string[] = [];
  const verified = new Set(breakdown.packages.map((g) => `${g.packageSlug}::${g.tierSlug}`));
  for (const key of claimed) {
    if (verified.has(key)) continue;
    const [packageSlug, tierSlug] = key.split("::");
    const pkg = getPackageBySlug(packageSlug);
    const known = pkg && getTierBySlug(pkg, tierSlug);
    warnings.push(
      known
        ? `Package "${pkg.name} — ${known.label}" was changed in the cart, so it was priced item by item.`
        : `A package ("${packageSlug}") couldn't be verified, so its items were priced one by one.`
    );
  }

  const estimatedTotal = rentalDays
    ? breakdown.totalEntries.reduce((sum, entry) => sum + entry.amount, 0)
    : null;

  return {
    ok: true,
    kit,
    rentalDays,
    estimatedTotal,
    startDate: datesValid ? startDate : "",
    endDate: datesValid ? endDate : "",
    hasPackage: breakdown.packages.length > 0,
    warnings,
  };
}
