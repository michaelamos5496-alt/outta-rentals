import { getBrandBySlug } from "./brands";
import { getCategoryBySlug } from "./categories";
import { products } from "./products";
import type { DemoProduct } from "./types";

export type { DemoProduct, DemoProductSpec, ProductAvailability } from "./types";
export { brands, getBrandBySlug } from "./brands";
export { categories, categoryIcons, getCategoryBySlug, getCategoryIcon, categorySlugs } from "./categories";
export { products } from "./products";

export function getAllProducts(): DemoProduct[] {
  return products;
}

export function getProductBySlug(slug: string): DemoProduct | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): DemoProduct[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getProductsBySlugs(slugs: string[]): DemoProduct[] {
  return slugs
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is DemoProduct => Boolean(p));
}

/** Same category, excluding the product itself, ranked by shared tags. */
export function getRelatedProducts(product: DemoProduct, limit = 4): DemoProduct[] {
  return products
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
    .sort((a, b) => {
      const sharedA = a.tags.filter((t) => product.tags.includes(t)).length;
      const sharedB = b.tags.filter((t) => product.tags.includes(t)).length;
      return sharedB - sharedA;
    })
    .slice(0, limit);
}

export function getCompatibleProducts(product: DemoProduct): DemoProduct[] {
  return getProductsBySlugs(product.compatibleSlugs);
}

export function getAccessoryProducts(product: DemoProduct): DemoProduct[] {
  return getProductsBySlugs(product.accessorySlugs);
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function searchProducts(query: string, pool: DemoProduct[] = products): DemoProduct[] {
  const q = normalize(query);
  if (!q) return pool;

  return pool.filter((p) => {
    const brandName = getBrandBySlug(p.brandSlug)?.name ?? "";
    const categoryName = getCategoryBySlug(p.categorySlug)?.name ?? "";
    const haystack = [p.name, brandName, categoryName, ...p.tags].map(normalize).join(" ");
    return haystack.includes(q);
  });
}

export function getPriceBounds(pool: DemoProduct[] = products): [number, number] {
  if (pool.length === 0) return [0, 0];
  const rates = pool.map((p) => p.dayRate);
  return [Math.min(...rates), Math.max(...rates)];
}

export const availabilityLabels: Record<DemoProduct["availability"], string> = {
  available: "Available",
  limited: "Limited",
  "on-request": "On request",
};
