import { getProductBySlug, type DemoProduct } from "@/lib/catalogue";
import { packages } from "./data";
import type { PackageTier, ProductionPackage } from "./types";

export type { PackageRole, PackageLineItem, PackageTier, ProductionPackage } from "./types";
export { packages } from "./data";

export function getAllPackages(): ProductionPackage[] {
  return packages;
}

export function getPackageBySlug(slug: string): ProductionPackage | undefined {
  return packages.find((p) => p.slug === slug);
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
  return packages.filter((p) =>
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
