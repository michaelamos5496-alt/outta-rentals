/**
 * One-time backfill: copies the real per-product photography that already
 * existed before the admin image-upload feature (src/lib/editorial-images.ts
 * productImages/extraProductImages — mostly real local files under
 * public/equipment/, plus a few per-product stock picks) into the real
 * `product_images` table, so the admin panel's Images section correctly
 * shows "this item already has photos" instead of looking empty for
 * equipment that's actually fully photographed on the live site.
 *
 * Never touches a product that already has product_images rows (e.g. one
 * you've since uploaded a real photo for via the admin panel) — only fills
 * in products with zero rows there. Capped at 4 images per product, same
 * as the admin form's limit. Safe to re-run: products that already have
 * rows (from this script or from a real upload) are skipped.
 *
 * Run with: npx tsx scripts/backfill-existing-images.ts
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

import { products } from "../src/lib/catalogue/products";
import { getProductGallery } from "../src/lib/editorial-images";

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

const MAX_IMAGES = 4;

async function main() {
  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }
  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

  const { data: dbProducts, error: productsErr } = await supabase.from("products").select("id, slug, name");
  if (productsErr) throw new Error(`Couldn't load products: ${productsErr.message}`);

  const { data: existingImageRows, error: imagesErr } = await supabase
    .from("product_images")
    .select("product_id");
  if (imagesErr) throw new Error(`Couldn't load product_images: ${imagesErr.message}`);
  const hasImages = new Set((existingImageRows ?? []).map((r) => r.product_id as string));

  let skippedHasImages = 0;
  let skippedNoGallery = 0;
  let skippedNoDbRow = 0;
  const rows: { product_id: string; url: string; alt: string; is_primary: boolean; order: number }[] = [];

  for (const product of products) {
    const dbRow = dbProducts?.find((p) => p.slug === product.slug);
    if (!dbRow) {
      skippedNoDbRow++;
      continue;
    }
    if (hasImages.has(dbRow.id)) {
      skippedHasImages++;
      continue;
    }
    const gallery = getProductGallery(product.slug).slice(0, MAX_IMAGES);
    if (gallery.length === 0) {
      skippedNoGallery++;
      continue;
    }
    gallery.forEach((imgUrl, i) => {
      rows.push({
        product_id: dbRow.id,
        url: imgUrl,
        alt: `${product.name}${gallery.length > 1 ? ` ${i + 1}` : ""}`,
        is_primary: i === 0,
        order: i,
      });
    });
  }

  console.log(
    `Backfilling ${rows.length} images across ${rows.filter((r) => r.is_primary).length} products. ` +
      `Skipped: ${skippedHasImages} already have images, ${skippedNoGallery} have no real photo, ${skippedNoDbRow} not in DB.`
  );

  if (rows.length > 0) {
    const { error: insertErr } = await supabase.from("product_images").insert(rows);
    if (insertErr) throw new Error(`Couldn't insert product_images: ${insertErr.message}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
