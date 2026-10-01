import { getProductBySlug, type DemoProduct } from "@/lib/catalogue";
import { packages } from "./data";
import type { PackageTier, ProductionPackage } from "./types";

export type { PackageRole, PackageLineItem, PackageTier, ProductionPackage } from "./types";
export { packages } from "./data";

/**
 * Only these packages are published. Commercial and Documentary have real,
 * confirmed flat pricing from OUTTA. Music Video and Short Film don't have
 * a flat rate yet — their tiers have no `price`, so the site computes a
 * live total from each item's day rate instead (see getFromPrice). The
 * rest (wedding, feature-film, interview, content, live-production) stay
 * in `data.ts` with old placeholder pricing until they're ready — add a
 * slug here to bring one live.
 */
const LIVE_PACKAGE_SLUGS = new Set(["commercial", "documentary", "music-video", "short-film"]);

function isLive(pkg: ProductionPackage): boolean {
  return LIVE_PACKAGE_SLUGS.has(pkg.slug);
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
 * The cheapest quoted tier price for a package's card — "From ₵X/day".
 * Packages with no flat-priced tier (their price is computed live from
 * item day rates instead) return null.
 */
export function getFromPrice(pkg: ProductionPackage): { amount: number; currency: string } | null {
  const priced = pkg.tiers.filter(
    (t): t is PackageTier & { price: number; currency: string } =>
      typeof t.price === "number" && Boolean(t.currency)
  );
  if (priced.length === 0) return null;
  const cheapest = priced.reduce((min, t) => (t.price < min.price ? t : min));
  return { amount: cheapest.price, currency: cheapest.currency };
}

export function getPackagesContainingProduct(productSlug: string): ProductionPackage[] {
  return getAllPackages().filter((p) =>
    p.tiers.some((tier) => tier.items.some((item) => item.productSlug === productSlug))
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
