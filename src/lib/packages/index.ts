import { getProductBySlug, type DemoProduct } from "@/lib/catalogue";
import { packages } from "./data";
import type { ProductionPackage } from "./types";

export type { PackageRole, PackageLineItem, ProductionPackage } from "./types";
export { packages } from "./data";

export function getAllPackages(): ProductionPackage[] {
  return packages;
}

export function getPackageBySlug(slug: string): ProductionPackage | undefined {
  return packages.find((p) => p.slug === slug);
}

export function getPackagesContainingProduct(productSlug: string): ProductionPackage[] {
  return packages.filter((p) => p.items.some((item) => item.productSlug === productSlug));
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
    for (const item of pkg.items) {
      if (seen.has(item.productSlug)) continue;
      const resolved = getProductBySlug(item.productSlug);
      if (!resolved) continue;
      seen.add(item.productSlug);
      recommended.push(resolved);
      if (recommended.length >= limit) return recommended;
    }
  }

  return recommended;
}
