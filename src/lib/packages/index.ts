import { getProductBySlug, type DemoProduct } from "@/lib/catalogue";
import { packages } from "./data";
import type { PackageTier, ProductionPackage } from "./types";

export type { PackageRole, PackageLineItem, PackageTier, ProductionPackage } from "./types";
export { packages } from "./data";

/**
 * Only these packages are published. All four have real, confirmed flat
 * pricing from OUTTA's rate sheet (each tier's `price` is already
 * discounted off the sum of its line items). The rest (wedding,
 * feature-film, interview, content, live-production) stay in `data.ts`
 * with old placeholder pricing until they're ready — add a slug here to
 * bring one live.
 */
const LIVE_PACKAGE_SLUGS = new Set(["commercial", "documentary", "music-video", "short-film"]);

function isLive(pkg: ProductionPackage): boolean {
  // Packages created in the admin panel are published straight away.
  return pkg.custom === true || LIVE_PACKAGE_SLUGS.has(pkg.slug);
}

export function getAllPackages(): ProductionPackage[] {
  return packages.filter(isLive);
}

export function getPackageBySlug(slug: string): ProductionPackage | undefined {
  const pkg = packages.find((p) => p.slug === slug);
  return pkg && isLive(pkg) ? pkg : undefined;
}

/** The tier a package opens on — its first, e.g. "LITE" before "YOLO". */
export function getDefaultTier(pkg: ProductionPackage): PackageTier {
  return pkg.tiers[0];
}

export function getTierBySlug(pkg: ProductionPackage, tierSlug: string): PackageTier | undefined {
  return pkg.tiers.find((t) => t.slug === tierSlug);
}

/**
 * A tier's price per day. When the tier has a `discountPercent` it is worked
 * out here — the items' current day rates added up, less the discount — so
 * any change to the items or to a product's rate flows straight through.
 * Otherwise (or when the items mix currencies) it is the stored flat `price`.
 */
export function getTierPrice(tier: PackageTier): { amount: number; currency: string } | null {
  if (typeof tier.discountPercent === "number") {
    const items = getTierItemsTotal(tier);
    const currencies = new Set(items.map((i) => i.currency));
    if (items.length > 0 && currencies.size === 1) {
      const sum = items.reduce((total, i) => total + i.amount, 0);
      return {
        amount: Math.round((sum * (100 - tier.discountPercent)) / 100),
        currency: [...currencies][0],
      };
    }
  }
  if (typeof tier.price === "number" && tier.currency) {
    return { amount: tier.price, currency: tier.currency };
  }
  return null;
}

/**
 * The cheapest quoted tier price for a package's card — "From ₵X/day".
 * Packages with no priced tier (their price is computed live from item day
 * rates instead) return null.
 */
export function getFromPrice(pkg: ProductionPackage): { amount: number; currency: string } | null {
  const priced = pkg.tiers.flatMap((t) => {
    const price = getTierPrice(t);
    return price ? [price] : [];
  });
  if (priced.length === 0) return null;
  return priced.reduce((min, t) => (t.amount < min.amount ? t : min));
}

/** Sum of each line item's own day rate — the price before any package discount. */
function getTierItemsTotal(tier: PackageTier): { amount: number; currency: string }[] {
  return tier.items.flatMap((item) => {
    // An "X or Y" line counts at whichever option costs more.
    const options = [item.productSlug, item.orProductSlug]
      .flatMap((slug) => (slug ? [getProductBySlug(slug)] : []))
      .filter((p): p is DemoProduct => Boolean(p));
    if (options.length === 0) return [];
    const product = options.reduce((max, p) => (p.dayRate > max.dayRate ? p : max));
    return [{ amount: (item.dayRate ?? product.dayRate) * item.quantity, currency: product.currency }];
  });
}

/**
 * A tier's price as formattable entries — its flat quoted price when it has
 * one, otherwise each line item's day rate (for formatTotal, which sums per
 * currency). Used to show every tier's price on a package card, not just
 * the default tier's.
 */
export function getTierTotal(tier: PackageTier): { amount: number; currency: string }[] {
  const price = getTierPrice(tier);
  if (price) return [price];
  return getTierItemsTotal(tier);
}

/**
 * The tier's full price if every line item were rented at its own day rate —
 * the "before discount" figure shown struck through next to the flat quoted
 * rate. Only meaningful (and only worth showing) when it's actually higher
 * than `getTierTotal`; a tier with no flat price has nothing to compare
 * against, so callers should only show this alongside a real quoted price.
 */
export function getTierFullPrice(tier: PackageTier): { amount: number; currency: string }[] {
  return getTierItemsTotal(tier);
}

export function getPackagesContainingProduct(productSlug: string): ProductionPackage[] {
  return getAllPackages().filter((p) =>
    p.tiers.some((tier) => tier.items.some((item) => item.productSlug === productSlug || item.orProductSlug === productSlug))
  );
}

/**
 * Cross-category picks pulled from whichever preset packages this product
 * belongs to — the "an experienced tech would also grab..." recommendation,
 * distinct from same-category "related" or compatibility-tagged items.
 */
export function getRecommendedForShoot(product: DemoProduct, limit = 4): DemoProduct[] {
  const containingPackages = getPackagesContainingProduct(product.slug);
  const seen = new Set<string>([product.slug]);
  const recommended: DemoProduct[] = [];

  for (const pkg of containingPackages) {
    for (const tier of pkg.tiers) {
      for (const item of tier.items) {
        if (seen.has(item.productSlug)) continue;
        const resolved = getProductBySlug(item.productSlug);
        if (!resolved) continue;
        seen.add(item.productSlug);
        recommended.push(resolved);
        if (recommended.length >= limit) return recommended;
      }
    }
  }

  return recommended;
}
