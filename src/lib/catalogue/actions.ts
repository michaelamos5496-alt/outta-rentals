"use server";

import { validateDateRange } from "@/lib/kit/rental";
import { fetchAllProducts, fetchProductBySlug, getAvailableUnits } from "./db";
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
 * Checks every kit line against the requested rental dates — flags items
 * that are out of service or already booked by a confirmed order (see
 * `getAvailableUnits()` in `src/lib/catalogue/db.ts`). Used by `/kit`.
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

  const datesValid = validateDateRange(startDate, endDate).valid;
  const freeUnits = datesValid
    ? await getAvailableUnits([...new Set(safeItems.map((i) => i.productSlug))], startDate, endDate)
    : null;

  for (const item of safeItems) {
    const product = await fetchProductBySlug(item.productSlug);
    if (!product) continue;
    const inService = product.availability === "available";
    const free = freeUnits?.get(product.slug);

    results.push({
      productSlug: product.slug,
      productName: product.name,
      available: inService && (free === undefined || free >= item.quantity),
      availableQuantity: inService ? (free ?? null) : 0,
      source: freeUnits ? "database" : "status-only",
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
