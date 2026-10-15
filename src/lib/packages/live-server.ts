import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { applyLivePackages, type LivePackageRow } from "./live";

/**
 * The admin's package edits and creations live in one small JSON file in a
 * private Supabase Storage bucket of its own — no database table to set up.
 * The file is `{ packages: LivePackageRow[] }`. (The product-photo bucket only
 * accepts images, so it can't hold this.)
 */
const BUCKET = "site-config";
const PATH = "config/packages.json";

let cached: LivePackageRow[] | null = null;
let cachedAt = 0;
// Same idea as the product cache: reuse for a short while, then re-read, so
// every server instance catches up with an admin edit within seconds.
const CACHE_MS = 30_000;

/** Call after saving so the next page load re-reads the file. */
export function invalidateLivePackages(): void {
  cached = null;
}

/**
 * Reads the saved packages (if any), applies them to this server's package
 * list, and returns them so the browser can apply the same. With no
 * database, or no file yet, it returns [] and the built-in packages are used
 * as they are.
 */
export async function loadLivePackages(): Promise<LivePackageRow[]> {
  if (!cached || Date.now() - cachedAt > CACHE_MS) {
    cached = await readSavedPackages();
    cachedAt = Date.now();
  }
  applyLivePackages(cached);
  return cached;
}

/** A fresh read of the file, bypassing the cache — for the admin's read-modify-write. */
export async function readSavedPackages(): Promise<LivePackageRow[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.storage.from(BUCKET).download(PATH);
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text()) as { packages?: LivePackageRow[] };
    return Array.isArray(parsed.packages) ? parsed.packages : [];
  } catch {
    return [];
  }
}

export async function writeSavedPackages(rows: LivePackageRow[]): Promise<string | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return "The database isn't connected, so edits can't be saved.";
  const body = new Blob([JSON.stringify({ packages: rows }, null, 2)], { type: "application/json" });
  const upload = () =>
    supabase.storage.from(BUCKET).upload(PATH, body, {
      contentType: "application/json",
      upsert: true,
      cacheControl: "0",
    });

  let { error } = await upload();
  if (error && /bucket not found/i.test(error.message)) {
    // First save ever: make the (private) bucket, then try again.
    const created = await supabase.storage.createBucket(BUCKET, { public: false });
    if (created.error && !/already exists/i.test(created.error.message)) {
      return `Couldn't set up storage: ${created.error.message}`;
    }
    ({ error } = await upload());
  }
  if (error) return `Couldn't save: ${error.message}`;
  invalidateLivePackages();
  return null;
}
