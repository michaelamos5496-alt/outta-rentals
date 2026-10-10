/**
 * Snapshots the live catalogue tables (brands, categories, products,
 * product_images) to a single JSON file committed in git — a free,
 * version-controlled safety net independent of Supabase's own backup tier.
 *
 * product_images matters most here: it holds every real admin-uploaded
 * photo URL, which lives only in this table (the photo files themselves
 * are in Supabase Storage, but nothing else records which product a given
 * file belongs to). products matters because anything created straight in
 * the admin panel, rather than added to src/lib/catalogue/products.ts,
 * exists only in the database.
 *
 * Doesn't restore anything by itself — it's a point-in-time record. If data
 * is ever lost again, the most recent snapshot plus `git log` on this file
 * shows exactly what existed and when, which a human (or a future Claude
 * session) can use to write the specific recovery queries needed.
 *
 * Run with: npx tsx scripts/backup-catalogue-data.ts
 * Run it after any batch of admin uploads/edits you'd be upset to lose, and
 * commit the result — the file is small and diffs cleanly.
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal(): Record<string, string> {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const env: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    if (!line.includes("=") || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

async function main() {
  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }
  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

  const [brands, categories, products, productImages] = await Promise.all([
    supabase.from("brands").select("*"),
    supabase.from("categories").select("*"),
    supabase.from("products").select("*"),
    supabase.from("product_images").select("*"),
  ]);
  for (const [name, res] of [
    ["brands", brands],
    ["categories", categories],
    ["products", products],
    ["product_images", productImages],
  ] as const) {
    if (res.error) throw new Error(`Failed reading ${name}: ${res.error.message}`);
  }

  const snapshot = {
    takenAt: new Date().toISOString(),
    brands: brands.data,
    categories: categories.data,
    products: products.data,
    productImages: productImages.data,
  };

  mkdirSync(new URL("../backups", import.meta.url), { recursive: true });
  const outPath = new URL("../backups/catalogue-snapshot.json", import.meta.url);
  writeFileSync(outPath, JSON.stringify(snapshot, null, 2));

  console.log(
    `Snapshot written: ${brands.data?.length} brands, ${categories.data?.length} categories, ` +
      `${products.data?.length} products, ${productImages.data?.length} product_images.`
  );
  console.log("Commit this file so the snapshot is kept in git history.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
