import { getProductBySlug, type DemoProduct } from "@/lib/catalogue";
import { getPackageBySlug, getTierBySlug, getTierFullPrice, getTierPrice } from "@/lib/packages";
import { getLineChoices } from "@/lib/packages/swaps";
import type { PackageLineItem } from "@/lib/packages/types";
import type { KitLineItem } from "./types";

export interface ResolvedKitLine {
  product: DemoProduct;
  quantity: number;
  rentalDays: number;
  lineTotal: number;
}

/** Daily Rate × Quantity × Rental Days, skipping any items whose product no longer exists. */
export function resolveKitLines(items: KitLineItem[], rentalDays: number): ResolvedKitLine[] {
  const days = Math.max(rentalDays, 0);
  return items.reduce<ResolvedKitLine[]>((lines, item) => {
    const product = getProductBySlug(item.productSlug);
    if (!product) return lines;
    lines.push({
      product,
      quantity: item.quantity,
      rentalDays: days,
      lineTotal: product.dayRate * item.quantity * days,
    });
    return lines;
  }, []);
}

export function getKitTotal(lines: ResolvedKitLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0);
}

export interface KitPricingResult {
  /** Per-currency total — a matched, unmodified package group is priced at
   * OUTTA's flat quoted rate; everything else sums its own day rate. */
  totalEntries: { amount: number; currency: string }[];
  /** Per-currency sum of every line's own day rate, ignoring any package
   * discount — the "full price" baseline a discount is measured against. */
  subtotalEntries: { amount: number; currency: string }[];
  /** Per-currency savings from matched package groups (subtotal − total). */
  discountEntries: { amount: number; currency: string }[];
  /** True once at least one package group kept its flat quoted rate. */
  hasPackageDiscount: boolean;
}

/** A package in the cart that still matches its tier exactly, priced as one unit. */
export interface ResolvedPackageGroup {
  packageSlug: string;
  packageName: string;
  tierSlug: string;
  tierLabel: string;
  /** How many of the package are in the cart (normally 1). */
  quantity: number;
  /** One package's price for one day. */
  dayPrice: number;
  currency: string;
  rentalDays: number;
  /** dayPrice × quantity × rentalDays. */
  total: number;
  /** The same equipment at each item's own day rate — what the package saves against. */
  fullTotal: number;
  /** The equipment in the package, as it sits in the cart (quantities already × package quantity). */
  items: ResolvedKitLine[];
}

export interface KitBreakdown extends KitPricingResult {
  /** Package groups that kept their quoted price. */
  packages: ResolvedPackageGroup[];
  /** Everything else, each priced at its own day rate (including a package
   * group that no longer matches its tier). */
  individuals: ResolvedKitLine[];
}

function slugQuantityTotals(items: { productSlug: string; quantity: number }[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const item of items) {
    totals.set(item.productSlug, (totals.get(item.productSlug) ?? 0) + item.quantity);
  }
  return totals;
}

interface TierAssignment {
  slug: string;
  quantity: number;
  /** The tier's own rate for the line, when the quoted item itself is held. */
  rate?: number;
  /** True when something other than the quoted item fills the line. */
  swapped: boolean;
}

/**
 * Checks that a group still is the tier: every line filled by its quoted
 * item, its quoted alternative, or similar equipment swapped in (see
 * `getLineChoices`), in whole copies of the package, with nothing extra and
 * nothing missing. Returns how many copies and what filled each line, or null.
 */
function matchTier(
  tier: { items: PackageLineItem[] },
  groupItems: KitLineItem[]
): { copies: number; assignments: TierAssignment[] } | null {
  const held = slugQuantityTotals(groupItems);
  const heldUnits = [...held.values()].reduce((n, q) => n + q, 0);
  const tierUnits = tier.items.reduce((n, i) => n + i.quantity, 0);
  if (tierUnits < 1 || heldUnits % tierUnits !== 0) return null;
  const copies = heldUnits / tierUnits;
  if (copies < 1) return null;

  const remaining = new Map(held);
  const assignments: TierAssignment[] = [];
  for (const line of tier.items) {
    const need = line.quantity * copies;
    const pick = getLineChoices(line, tier)
      .map((p) => p.slug)
      .find((slug) => (remaining.get(slug) ?? 0) >= need);
    if (!pick) return null;
    remaining.set(pick, (remaining.get(pick) ?? 0) - need);
    assignments.push({
      slug: pick,
      quantity: need,
      rate: pick === line.productSlug ? line.dayRate : undefined,
      swapped: pick !== line.productSlug,
    });
  }
  for (const left of remaining.values()) if (left !== 0) return null;
  return { copies, assignments };
}

/**
 * The package's price for one day. Untouched, it's the quoted package price.
 * Once an item has been swapped it's worked out again from what's actually
 * in the package — those items at their own day rates, less the package
 * discount — so a dearer swap costs more and a cheaper one less, always
 * with the discount applied.
 */
function packageDayPrice(
  tier: { items: PackageLineItem[]; discountPercent?: number },
  quoted: { amount: number },
  match: { copies: number; assignments: TierAssignment[] }
): number {
  if (!match.assignments.some((a) => a.swapped)) return quoted.amount;
  const perCopy =
    match.assignments.reduce((sum, a) => {
      const product = getProductBySlug(a.slug);
      return sum + (a.rate ?? product?.dayRate ?? 0) * a.quantity;
    }, 0) / match.copies;
  if (typeof tier.discountPercent === "number") {
    return Math.round((perCopy * (100 - tier.discountPercent)) / 100);
  }
  // A flat-priced tier: keep its quoted price and add the difference the swaps make.
  const original = getTierFullPrice(tier as never).reduce((n, e) => n + e.amount, 0);
  return Math.max(0, Math.round(quoted.amount + (perCopy - original)));
}

/**
 * Sorts a cart into package groups and individual items, and totals it the
 * way OUTTA actually quotes it: items tagged with a package/tier (via "Add
 * Entire Package to Cart") are priced as a group at that tier's flat day
 * rate as long as the group still matches the tier exactly — same products,
 * same quantities (or a whole multiple of them). The moment a customer
 * removes, resizes or adds to one of those items, the group no longer
 * matches and falls back to summing each item's own day rate, same as
 * anything added individually.
 *
 * The package, its tier and its price all come from OUTTA's own package
 * data, looked up by slug — never from anything the customer sends — so this
 * is safe to run again on the server to price a submitted order.
 */
export function resolveKitBreakdown(items: KitLineItem[], rentalDays: number): KitBreakdown {
  const days = Math.max(rentalDays, 0);
  const totalByCurrency = new Map<string, number>();
  const subtotalByCurrency = new Map<string, number>();
  const packages: ResolvedPackageGroup[] = [];
  const individuals: ResolvedKitLine[] = [];

  function addAmount(map: Map<string, number>, currency: string, amount: number) {
    map.set(currency, (map.get(currency) ?? 0) + amount);
  }

  function resolveLine(item: KitLineItem, rate?: number): ResolvedKitLine | null {
    const product = getProductBySlug(item.productSlug);
    if (!product) return null;
    return {
      product,
      quantity: item.quantity,
      rentalDays: days,
      lineTotal: (rate ?? product.dayRate) * item.quantity * days,
    };
  }

  const groups = new Map<string, KitLineItem[]>();
  const ungrouped: KitLineItem[] = [];
  for (const item of items) {
    if (item.packageSlug && item.packageTierSlug) {
      const key = `${item.packageSlug}::${item.packageTierSlug}`;
      const list = groups.get(key);
      if (list) list.push(item);
      else groups.set(key, [item]);
    } else {
      ungrouped.push(item);
    }
  }

  for (const groupItems of groups.values()) {
    const { packageSlug, packageTierSlug } = groupItems[0];
    const pkg = packageSlug ? getPackageBySlug(packageSlug) : undefined;
    const tier = pkg && packageTierSlug ? getTierBySlug(pkg, packageTierSlug) : undefined;
    const quoted = tier ? getTierPrice(tier) : null;
    const match = tier && quoted ? matchTier(tier, groupItems) : null;
    const copies = match?.copies ?? null;

    const lines: ResolvedKitLine[] = [];
    let fullTotal = 0;
    for (const item of groupItems) {
      // A tier can count a line at its own rate (see PackageLineItem.dayRate).
      const tierRate = tier?.items.find((t) => t.productSlug === item.productSlug)?.dayRate;
      const line = resolveLine(item, tierRate);
      if (!line) continue;
      lines.push(line);
      fullTotal += line.lineTotal;
      addAmount(subtotalByCurrency, line.product.currency, line.lineTotal);
    }

    if (pkg && tier && quoted && match && copies) {
      const dayPrice = packageDayPrice(tier, quoted, match);
      const total = dayPrice * copies * days;
      addAmount(totalByCurrency, quoted.currency, total);
      packages.push({
        packageSlug: pkg.slug,
        packageName: pkg.name,
        tierSlug: tier.slug,
        tierLabel: tier.label,
        quantity: copies,
        dayPrice,
        currency: quoted.currency,
        rentalDays: days,
        total,
        fullTotal,
        items: lines,
      });
    } else {
      // Not a package any more (or an unknown/unpriced one): each item at its own rate.
      for (const item of groupItems) {
        const line = resolveLine(item);
        if (!line) continue;
        individuals.push(line);
        addAmount(totalByCurrency, line.product.currency, line.lineTotal);
      }
    }
  }

  for (const item of ungrouped) {
    const line = resolveLine(item);
    if (!line) continue;
    individuals.push(line);
    addAmount(subtotalByCurrency, line.product.currency, line.lineTotal);
    addAmount(totalByCurrency, line.product.currency, line.lineTotal);
  }

  const toEntries = (map: Map<string, number>) =>
    [...map.entries()].map(([currency, amount]) => ({ amount, currency }));

  const discountByCurrency = new Map<string, number>();
  for (const [currency, subtotalAmount] of subtotalByCurrency) {
    const savings = subtotalAmount - (totalByCurrency.get(currency) ?? 0);
    if (savings > 0) discountByCurrency.set(currency, savings);
  }

  return {
    totalEntries: toEntries(totalByCurrency),
    subtotalEntries: toEntries(subtotalByCurrency),
    discountEntries: toEntries(discountByCurrency),
    hasPackageDiscount: packages.length > 0,
    packages,
    individuals,
  };
}

/** Totals for a cart — see `resolveKitBreakdown` for how packages are priced. */
export function resolveKitPricing(items: KitLineItem[], rentalDays: number): KitPricingResult {
  const { totalEntries, subtotalEntries, discountEntries, hasPackageDiscount } = resolveKitBreakdown(
    items,
    rentalDays
  );
  return { totalEntries, subtotalEntries, discountEntries, hasPackageDiscount };
}
