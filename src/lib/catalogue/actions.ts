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
  /** Why it isn't available: out of service (maintenance etc.) or booked by a confirmed order. */
  reason: "out_of_service" | "booked" | null;
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
      reason: !inService
        ? "out_of_service"
        : free !== undefined && free < item.quantity
          ? "booked"
          : null,
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
  dayRate: number;
  currency: string;
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
      dayRate: p.dayRate,
      currency: p.currency,
    }));
}

export interface QuickViewAddOn {
  slug: string;
  name: string;
  dayRate: number;
  currency: string;
  imageUrl: string | null;
  categorySlug: string;
  sku: string;
  /** Units free for the chosen dates; `null` when stock isn't tracked. */
  free: number | null;
}

/**
 * Add-on suggestions for the equipment popup's "Add to your booking" list:
 * in-service items sharing the product's brand, plus its listed accessories
 * and compatible gear, with how many units are free for the dates.
 */
export async function getQuickViewAddOns(
  productSlug: string,
  startDate: string,
  endDate: string
): Promise<QuickViewAddOn[]> {
  if (typeof productSlug !== "string" || typeof startDate !== "string" || typeof endDate !== "string") {
    return [];
  }
  const [all, product] = await Promise.all([fetchAllProducts(), fetchProductBySlug(productSlug)]);
  if (!product) return [];

  const listed = new Set([...product.accessorySlugs, ...product.compatibleSlugs]);
  const candidates = all
    .filter(
      (p) =>
        p.slug !== product.slug &&
        p.availability === "available" &&
        p.dayRate > 0 &&
        (listed.has(p.slug) || p.brandSlug === product.brandSlug)
    )
    // Explicitly listed accessories first, then same-brand gear, cheapest first.
    .sort((a, b) => Number(listed.has(b.slug)) - Number(listed.has(a.slug)) || a.dayRate - b.dayRate)
    .slice(0, 12);

  const free = validateDateRange(startDate, endDate).valid
    ? await getAvailableUnits(candidates.map((p) => p.slug), startDate, endDate)
    : null;

  return candidates
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      dayRate: p.dayRate,
      currency: p.currency,
      imageUrl: p.images?.[0]?.url ?? null,
      categorySlug: p.categorySlug,
      sku: p.sku,
      free: free?.get(p.slug) ?? null,
    }))
    .filter((p) => p.free === null || p.free > 0);
}
