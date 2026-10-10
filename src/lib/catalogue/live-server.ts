import "server-only";

import { fetchAllProducts } from "./db";
import { applyLiveCatalogue, toLiveFields, type LiveProductFields } from "./live";

/**
 * Reads every product from the database (or admin-store fallback), applies
 * the slim price/name/photo fields for this server render, and returns them
 * so `LiveCatalogue` can hand the same fields to the browser.
 */
export async function loadLiveCatalogue(): Promise<LiveProductFields[]> {
  const items = (await fetchAllProducts()).map(toLiveFields);
  applyLiveCatalogue(items);
  return items;
}
