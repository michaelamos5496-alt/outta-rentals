"use client";

import { applyLivePackages, type LivePackageRow } from "@/lib/packages/live";

/**
 * Feeds the browser-side package helpers the admin's saved package edits.
 * Applied during render, like `LiveCatalogue`, so the first paint already
 * shows the right items and prices.
 */
function LivePackages({ rows }: { rows: LivePackageRow[] }) {
  applyLivePackages(rows);
  return null;
}

export { LivePackages };
