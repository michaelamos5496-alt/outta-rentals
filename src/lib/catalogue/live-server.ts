import "server-only";

import { fetchAllProducts } from "./db";
import { loadLivePackages } from "@/lib/packages/live-server";
import { applyLiveCatalogue, toLiveFields, type LiveProductFields } from "./live";

/**
 * Reads every product from the database (or admin-store fallback), applies
 * the slim price/name/photo fields for this server render, and returns them
 * so `LiveCatalogue` can hand the same fields to the browser.
 */
export async function loadLiveCatalogue(): Promise<LiveProductFields[]> {
  const items = (await fetchAllProducts()).map(toLiveFields);
  applyLiveCatalogue(items);
  // Packages price and list their items through the catalogue, so apply any
  // saved package edits alongside it — every page that loads one loads both.
  await loadLivePackages();
  return items;
}
