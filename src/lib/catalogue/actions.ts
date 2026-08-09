"use server";

import { checkProductAvailability, fetchProductBySlug } from "./db";

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

  for (const item of items) {
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
