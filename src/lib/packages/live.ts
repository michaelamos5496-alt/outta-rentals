import { packages } from "./data";
import type { PackageTier, ProductionPackage } from "./types";

/**
 * A package as edited in the admin panel and saved. For one of the built-in
 * packages it holds the edited name, blurb and tiers; for a package created
 * in the admin (`custom`) it is the whole package.
 */
export interface LivePackageRow {
  slug: string;
  name: string;
  description: string;
  tiers: PackageTier[];
  custom?: boolean;
}

// Deep copy of plain package data. Not structuredClone: this module ships to
// the browser, and older phone browsers (pre-2022 Chrome) don't have it, which
// crashed the whole site on load.
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// Snapshot of the built-in packages, taken before anything is applied, so an
// edit can be undone ("reset to original") and the admin form has something
// to compare against.
const defaults: ProductionPackage[] = clone(packages);

export function getDefaultPackage(slug: string): ProductionPackage | undefined {
  return defaults.find((p) => p.slug === slug);
}

/**
 * Overlays the saved packages onto the built-in ones, in place — the package
 * helpers (`getAllPackages`, the nav menu, the chooser) all read that one
 * array synchronously, so mutating it keeps every one of them in step.
 * Built-in packages with no saved row go back to their defaults, and
 * created packages that are no longer saved are dropped.
 */
export function applyLivePackages(rows: LivePackageRow[]): void {
  for (let i = packages.length - 1; i >= 0; i--) {
    if (packages[i].custom) packages.splice(i, 1);
  }

  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  for (const pkg of packages) {
    const base = defaults.find((d) => d.slug === pkg.slug);
    if (!base) continue;
    const source = bySlug.get(pkg.slug) ?? base;
    pkg.name = source.name;
    pkg.description = source.description;
    pkg.tiers = clone(source.tiers);
  }

  for (const row of rows) {
    if (!row.custom || packages.some((p) => p.slug === row.slug)) continue;
    packages.push({
      slug: row.slug,
      name: row.name,
      description: row.description,
      tiers: clone(row.tiers),
      custom: true,
    });
  }
}
