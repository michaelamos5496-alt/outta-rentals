/**
 * Adds specific static-catalogue products to the live Supabase tables
 * WITHOUT clearing anything (unlike seed-supabase.ts). Skips slugs that
 * already exist.
 *
 * Run with: npx tsx scripts/add-products-to-db.ts <slug> [<slug>…]
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

import { products } from "../src/lib/catalogue/products";

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
  const slugs = process.argv.slice(2);
  if (slugs.length === 0) throw new Error("Pass at least one product slug.");
  const env = loadEnvLocal();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const [{ data: brands }, { data: categories }] = await Promise.all([
    supabase.from("brands").select("id, slug"),
    supabase.from("categories").select("id, slug"),
  ]);
  const brandId = new Map((brands ?? []).map((b) => [b.slug, b.id as string]));
  const categoryId = new Map((categories ?? []).map((c) => [c.slug, c.id as string]));

  for (const slug of slugs) {
    const p = products.find((x) => x.slug === slug);
    if (!p) throw new Error(`No static product with slug ${slug}`);
    const { data: existing } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
    if (existing) {
      console.log(`${slug}: already in the database, skipped`);
      continue;
    }
    const { data: row, error } = await supabase
      .from("products")
      .insert({
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        brand_id: brandId.get(p.brandSlug) ?? null,
        category_id: categoryId.get(p.categorySlug) ?? null,
        short_description: p.shortDescription,
        description: p.description,
        status: p.availability,
        stock_quantity: 1,
        tags: p.tags,
        included: p.included,
        featured: Boolean(p.featured),
        is_new: Boolean(p.isNew),
      })
      .select("id")
      .single();
    if (error || !row) throw new Error(`Insert ${slug} failed: ${error?.message}`);
    const { error: rateErr } = await supabase
      .from("rental_rates")
      .insert({ product_id: row.id, period: "day", price: p.dayRate, currency: p.currency });
    if (rateErr) throw new Error(`Rate for ${slug} failed: ${rateErr.message}`);
    console.log(`${slug}: added (GHS ${p.dayRate}/day)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
