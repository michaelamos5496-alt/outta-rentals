import { packages } from "./data";
import type { PackageTier, ProductionPackage } from "./types";

/**
 * A package as edited in the admin panel and saved to the database. Only the
 * parts an admin can change: the name, the blurb and the tiers (labels,
 * discount, line items).
 */
export interface LivePackageRow {
  slug: string;
  name: string;
  description: string;
  tiers: PackageTier[];
}

// Snapshot of the built-in packages, taken before anything is applied, so an
// edit can be undone ("reset to default") and the admin form has something
// to compare against.
const defaults: ProductionPackage[] = structuredClone(packages);

export function getDefaultPackage(slug: string): ProductionPackage | undefined {
  return defaults.find((p) => p.slug === slug);
}

/**
 * Overlays the saved edits onto the built-in packages, in place — the
 * package helpers (`getAllPackages`, the nav menu, the chooser) all read
 * that one array synchronously, so mutating it keeps every one of them in
 * step. Packages with no saved row go back to their defaults.
 */
export function applyLivePackages(rows: LivePackageRow[]): void {
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  for (const pkg of packages) {
    const base = defaults.find((d) => d.slug === pkg.slug);
    if (!base) continue;
    const row = bySlug.get(pkg.slug);
    const source = row ?? base;
    pkg.name = source.name;
    pkg.description = source.description;
    pkg.tiers = structuredClone(source.tiers);
  }
}
