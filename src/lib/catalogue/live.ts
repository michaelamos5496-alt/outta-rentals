import type { DemoProduct, ProductAvailability } from "./types";

/**
 * The few fields of each product that the synchronous, static-catalogue
 * helpers (`getProductBySlug`, `getProductImage`) need to agree with the
 * database: name, price, status, main photo. Packages and the cart price
 * and picture their items through those helpers, so without this they'd
 * keep showing the original rate-sheet numbers and stock photos after an
 * admin edits a product.
 */
export interface LiveProductFields {
  slug: string;
  sku: string;
  name: string;
  brandSlug: string;
  categorySlug: string;
  dayRate: number;
  currency: string;
  availability: ProductAvailability;
  imageUrl: string | null;
}

let live = new Map<string, LiveProductFields>();

export function applyLiveCatalogue(items: LiveProductFields[]): void {
  if (items.length > 0) live = new Map(items.map((i) => [i.slug, i]));
}

export function getLiveFields(slug: string): LiveProductFields | undefined {
  return live.get(slug);
}

export function toLiveFields(p: DemoProduct): LiveProductFields {
  return {
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    brandSlug: p.brandSlug,
    categorySlug: p.categorySlug,
    dayRate: p.dayRate,
    currency: p.currency,
    availability: p.availability,
    imageUrl: p.images?.[0]?.url ?? null,
  };
}
