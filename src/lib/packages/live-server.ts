import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { applyLivePackages, type LivePackageRow } from "./live";
import type { PackageTier } from "./types";

let cached: LivePackageRow[] | null = null;
let cachedAt = 0;
// Same idea as the product cache: reuse for a short while, then re-read, so
// every server instance catches up with an admin edit within seconds.
const CACHE_MS = 30_000;

/** Call after saving or resetting a package so the next page load re-reads. */
export function invalidateLivePackages(): void {
  cached = null;
}

/**
 * Reads the admin's saved package edits (if any), applies them to this
 * server's package list, and returns them so the browser can apply the same.
 * With no database, or before the `packages` table exists, it returns [] and
 * the built-in packages are used as they are.
 */
export async function loadLivePackages(): Promise<LivePackageRow[]> {
  if (!cached || Date.now() - cachedAt > CACHE_MS) {
    cached = await fetchRows();
    cachedAt = Date.now();
  }
  applyLivePackages(cached);
  return cached;
}

async function fetchRows(): Promise<LivePackageRow[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("packages").select("slug, name, description, tiers");
  if (error || !data) return [];
  return data.map((row) => ({
    slug: row.slug as string,
    name: row.name as string,
    description: (row.description as string) ?? "",
    tiers: row.tiers as PackageTier[],
  }));
}
