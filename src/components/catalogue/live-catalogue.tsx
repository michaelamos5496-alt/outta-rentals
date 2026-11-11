"use client";

import { applyLiveCatalogue, type LiveProductFields } from "@/lib/catalogue/live";

/**
 * Feeds the browser-side catalogue helpers the database's current prices,
 * names and photos. Applied during render (not in an effect) so the very
 * first paint of the package and cart prices is already correct.
 */
function LiveCatalogue({ items }: { items: LiveProductFields[] }) {
  applyLiveCatalogue(items);
  return null;
}

export { LiveCatalogue };
