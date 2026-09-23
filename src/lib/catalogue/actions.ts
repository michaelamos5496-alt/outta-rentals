"use server";

import { checkProductAvailability, fetchAllProducts, fetchProductBySlug } from "./db";
import { getBrandBySlug, getCategoryBySlug } from "./index";
import type { ProductAvailability } from "./types";

export interface KitAvailabilityCheckItem {
  productSlug: string;
  quantity: number;
}

export interface KitAvailabilityResult {
  productSlug: string;
  productName: string;
  available: boolean;
  availableQuantity: number | null;
  source: "database" | "status-only";
}

const MAX_AVAILABILITY_ITEMS = 100;

/**
 * Checks every kit line against the requested rental dates. Used by the
 * "Check availability" action on `/kit` — the real, callable entry point
 * for the availability system `checkProductAvailability()` implements (see
 * `src/lib/catalogue/db.ts` and `get_available_quantity()` in `schema.sql`).
 */
export async function checkKitAvailability(
  items: KitAvailabilityCheckItem[],
  startDate: string,
  endDate: string
): Promise<KitAvailabilityResult[]> {
  const results: KitAvailabilityResult[] = [];
  // Public server action — never trust the payload shape or size.
  if (!Array.isArray(items) || typeof startDate !== "string" || typeof endDate !== "string") {
    return results;
  }
  const safeItems = items
    .filter(
      (item) =>
        item &&
        typeof item.productSlug === "string" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    )
    .slice(0, MAX_AVAILABILITY_ITEMS);

  for (const item of safeItems) {
    const product = await fetchProductBySlug(item.productSlug);
    if (!product) continue;

    const result = await checkProductAvailability(product, startDate, endDate, item.quantity);
    results.push({
      productSlug: product.slug,
      productName: product.name,
      available: result.available,
      availableQuantity: result.availableQuantity,
      source: result.source,
    });
  }

  return results;
}

export interface CatalogueSearchResult {
  slug: string;
  name: string;
  brandName: string;
  categoryName: string;
  categorySlug: string;
  availability: ProductAvailability;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Powers the navbar's search modal. Queries the same DB-or-fallback product
 * pool the storefront reads (`fetchAllProducts`), so results reflect admin
 * edits — same matching rules as `searchProducts` in `./index`, just async
 * and callable from a client component.
 */
export async function searchCatalogueAction(query: string): Promise<CatalogueSearchResult[]> {
  if (typeof query !== "string") return [];
  const q = normalize(query.slice(0, 100));
  if (!q) return [];

  const products = await fetchAllProducts();

  return products
    .filter((p) => {
      const brandName = getBrandBySlug(p.brandSlug)?.name ?? "";
      const categoryName = getCategoryBySlug(p.categorySlug)?.name ?? "";
      const haystack = [p.name, brandName, categoryName, ...p.tags].map(normalize).join(" ");
      return haystack.includes(q);
    })
    .slice(0, 8)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      brandName: getBrandBySlug(p.brandSlug)?.name ?? p.brandSlug,
      categoryName: getCategoryBySlug(p.categorySlug)?.name ?? p.categorySlug,
      categorySlug: p.categorySlug,
      availability: p.availability,
    }));
}
