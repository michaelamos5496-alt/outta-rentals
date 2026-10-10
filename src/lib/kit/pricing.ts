import { getProductBySlug, type DemoProduct } from "@/lib/catalogue";
import { getPackageBySlug, getTierBySlug } from "@/lib/packages";
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

function slugQuantityTotals(items: { productSlug: string; quantity: number }[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const item of items) {
    totals.set(item.productSlug, (totals.get(item.productSlug) ?? 0) + item.quantity);
  }
  return totals;
}

/**
 * What the tier's group should contain. An "X or Y" line accepts either
 * option: if the group holds the alternative (and not the default), the
 * alternative is expected in its place.
 */
function expectedTierTotals(
  tier: { items: { productSlug: string; orProductSlug?: string; quantity: number }[] },
  groupItems: KitLineItem[]
): Map<string, number> {
  const held = slugQuantityTotals(groupItems);
  return slugQuantityTotals(
    tier.items.map((item) => {
      const useAlt =
        item.orProductSlug && !held.has(item.productSlug) && held.has(item.orProductSlug);
      return { productSlug: useAlt ? item.orProductSlug! : item.productSlug, quantity: item.quantity };
    })
  );
}

function slugQuantityMapsEqual(a: Map<string, number>, b: Map<string, number>): boolean {
  if (a.size !== b.size) return false;
  for (const [slug, quantity] of a) {
    if (b.get(slug) !== quantity) return false;
  }
  return true;
}

/**
 * Totals a kit the way OUTTA actually quotes it: items tagged with a
 * package/tier (via "Add Entire Package to Cart") are priced as a group at
 * that tier's flat day rate as long as the group still matches the tier
 * exactly — same products, same quantities. The moment a customer removes,
 * resizes or adds to one of those items, the group no longer matches and
 * falls back to summing each item's own day rate, same as anything added
 * individually.
 */
export function resolveKitPricing(items: KitLineItem[], rentalDays: number): KitPricingResult {
  const days = Math.max(rentalDays, 0);
  const totalByCurrency = new Map<string, number>();
  const subtotalByCurrency = new Map<string, number>();
  let hasPackageDiscount = false;

  function addAmount(map: Map<string, number>, currency: string, amount: number) {
    map.set(currency, (map.get(currency) ?? 0) + amount);
  }

  function addItemAmount(map: Map<string, number>, item: KitLineItem) {
    const product = getProductBySlug(item.productSlug);
    if (!product) return;
    addAmount(map, product.currency, product.dayRate * item.quantity * days);
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
    for (const item of groupItems) addItemAmount(subtotalByCurrency, item);

    const { packageSlug, packageTierSlug } = groupItems[0];
    const pkg = packageSlug ? getPackageBySlug(packageSlug) : undefined;
    const tier = pkg && packageTierSlug ? getTierBySlug(pkg, packageTierSlug) : undefined;
    const matches =
      tier &&
      typeof tier.price === "number" &&
      tier.currency &&
      slugQuantityMapsEqual(slugQuantityTotals(groupItems), expectedTierTotals(tier, groupItems));

    if (matches) {
      hasPackageDiscount = true;
      addAmount(totalByCurrency, tier.currency!, tier.price! * days);
    } else {
      for (const item of groupItems) addItemAmount(totalByCurrency, item);
    }
  }

  for (const item of ungrouped) {
    addItemAmount(subtotalByCurrency, item);
    addItemAmount(totalByCurrency, item);
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
    hasPackageDiscount,
  };
}
