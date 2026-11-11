import { getAllProducts, getProductBySlug, type DemoProduct } from "@/lib/catalogue";
import { listLiveFields } from "@/lib/catalogue/live";
import { similarityKey } from "@/lib/catalogue/similarity";
import type { PackageLineItem, PackageTier } from "./types";

/**
 * What a customer may swap a package line for: similar equipment — the same
 * kind of gear (see `similarityKey`), in the same currency, currently
 * available — at any price. The package discount is then applied to the new
 * total. Gear already part of the package is never offered, so a swap can't
 * double up an item.
 */
export function getSwapOptions(line: PackageLineItem, tier: Pick<PackageTier, "items">): DemoProduct[] {
  const base = getProductBySlug(line.productSlug);
  if (!base) return [];
  const inTier = new Set(
    tier.items.flatMap((i) => [i.productSlug, ...(i.orProductSlug ? [i.orProductSlug] : [])])
  );
  const key = similarityKey(base);
  const slugs = new Set([...getAllProducts().map((p) => p.slug), ...listLiveFields().map((f) => f.slug)]);
  const options: DemoProduct[] = [];
  for (const slug of slugs) {
    if (inTier.has(slug)) continue;
    const product = getProductBySlug(slug);
    if (!product || product.availability !== "available" || product.dayRate <= 0) continue;
    if (product.currency !== base.currency || similarityKey(product) !== key) continue;
    options.push(product);
  }
  return options.sort((a, b) => a.name.localeCompare(b.name));
}

/** Every product that can fill a line: the quoted item, its quoted alternative, then similar gear. */
export function getLineChoices(line: PackageLineItem, tier: Pick<PackageTier, "items">): DemoProduct[] {
  const quoted = [line.productSlug, line.orProductSlug]
    .flatMap((slug) => (slug ? [getProductBySlug(slug)] : []))
    .filter((p): p is DemoProduct => Boolean(p));
  return [...quoted, ...getSwapOptions(line, tier)];
}
