import { getBrandBySlug } from "./brands";
import { getCategoryBySlug } from "./categories";
import { products } from "./products";
import { getLiveFields } from "./live";
import type { DemoProduct } from "./types";

export type { DemoProduct, DemoProductSpec, DemoProductImage, ProductAvailability } from "./types";
export { brands, getBrandBySlug } from "./brands";
export { categories, categoryIcons, getCategoryBySlug, getCategoryIcon, categorySlugs } from "./categories";
export { products } from "./products";

export function getAllProducts(): DemoProduct[] {
  return products;
}

/**
 * The static catalogue entry, with its name, price, status and main photo
 * overlaid from the database when known (see `./live`) — so packages and
 * the cart show the same numbers and pictures as the equipment pages.
 * Products that only exist in the database come back as a minimal entry.
 */
export function getProductBySlug(slug: string): DemoProduct | undefined {
  const base = products.find((p) => p.slug === slug);
  const liveFields = getLiveFields(slug);
  if (!liveFields) return base;
  const image = liveFields.imageUrl ? [{ url: liveFields.imageUrl, alt: liveFields.name }] : undefined;
  if (!base) {
    return {
      id: `live-${slug}`,
      slug,
      sku: liveFields.sku,
      name: liveFields.name,
      brandSlug: liveFields.brandSlug,
      categorySlug: liveFields.categorySlug,
      tags: [],
      shortDescription: "",
      description: "",
      dayRate: liveFields.dayRate,
      currency: liveFields.currency,
      availability: liveFields.availability,
      specifications: [],
      included: [],
      accessorySlugs: [],
      compatibleSlugs: [],
      images: image,
    };
  }
  return {
    ...base,
    name: liveFields.name,
    dayRate: liveFields.dayRate,
    currency: liveFields.currency,
    availability: liveFields.availability,
    images: image ?? base.images,
  };
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
  reserved: "Reserved",
  maintenance: "Maintenance",
  "coming_soon": "Coming Soon",
  unavailable: "Unavailable",
};

/** Badge variant per status — shared across product cards, product pages and filters. */
export const availabilityVariant = {
  available: "outline",
  reserved: "technical",
  maintenance: "destructive",
  "coming_soon": "secondary",
  unavailable: "ghost",
} as const;
