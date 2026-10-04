/**
 * One-time catalogue seed: copies the static demo catalogue
 * (src/lib/catalogue/{products,categories,brands}.ts) into the real
 * Supabase tables (brands, categories, products, product_specifications,
 * rental_rates, product_accessories, product_compatibility), so the admin
 * panel's create/edit/delete actions have real data to work on and the
 * public site reads from the database instead of the static fallback.
 *
 * Safe to re-run: it clears the catalogue tables first, then re-inserts
 * everything from the static source fresh.
 *
 * Run with: npx tsx scripts/seed-supabase.ts
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

import { products } from "../src/lib/catalogue/products";
import { categories } from "../src/lib/catalogue/categories";
import { brands } from "../src/lib/catalogue/brands";

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

  console.log("Clearing existing catalogue rows…");
  // Children first (FK references), then parents. Empty-table deletes are
  // no-ops, so this is safe whether or not anything was seeded before.
  for (const table of [
    "product_compatibility",
    "product_accessories",
    "rental_rates",
    "product_specifications",
    "product_images",
    "products",
    "categories",
    "brands",
  ]) {
    const { error } = await supabase.from(table).delete().not("id", "is", null);
    if (error) throw new Error(`Failed clearing ${table}: ${error.message}`);
  }

  console.log(`Inserting ${brands.length} brands…`);
  const { data: brandRows, error: brandErr } = await supabase
    .from("brands")
    .insert(brands.map((b) => ({ name: b.name, slug: b.slug, logo_url: b.logoUrl ?? null, description: b.description ?? null })))
    .select("id, slug");
  if (brandErr) throw new Error(`Failed inserting brands: ${brandErr.message}`);
  const brandIdBySlug = new Map((brandRows ?? []).map((r) => [r.slug, r.id as string]));

  console.log(`Inserting ${categories.length} categories…`);
  const { data: categoryRows, error: categoryErr } = await supabase
    .from("categories")
    .insert(
      categories.map((c) => ({
        name: c.name,
        slug: c.slug,
        description: c.description ?? null,
        image_url: c.imageUrl ?? null,
      }))
    )
    .select("id, slug");
  if (categoryErr) throw new Error(`Failed inserting categories: ${categoryErr.message}`);
  const categoryIdBySlug = new Map((categoryRows ?? []).map((r) => [r.slug, r.id as string]));

  console.log(`Inserting ${products.length} products…`);
  const { data: productRows, error: productErr } = await supabase
    .from("products")
    .insert(
      products.map((p) => ({
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        brand_id: brandIdBySlug.get(p.brandSlug) ?? null,
        category_id: categoryIdBySlug.get(p.categorySlug) ?? null,
        short_description: p.shortDescription,
        description: p.description,
        status: p.availability,
        stock_quantity: 1,
        tags: p.tags,
        included: p.included,
        featured: Boolean(p.featured),
        is_new: Boolean(p.isNew),
      }))
    )
    .select("id, slug");
  if (productErr) throw new Error(`Failed inserting products: ${productErr.message}`);
  const productIdBySlug = new Map((productRows ?? []).map((r) => [r.slug, r.id as string]));

  const rateRows = products
    .map((p) => {
      const productId = productIdBySlug.get(p.slug);
      if (!productId) return null;
      return { product_id: productId, period: "day", price: p.dayRate, currency: p.currency };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
  console.log(`Inserting ${rateRows.length} rental rates…`);
  const { error: rateErr } = await supabase.from("rental_rates").insert(rateRows);
  if (rateErr) throw new Error(`Failed inserting rental_rates: ${rateErr.message}`);

  const specRows = products.flatMap((p) => {
    const productId = productIdBySlug.get(p.slug);
    if (!productId) return [];
    return p.specifications.map((s, order) => ({
      product_id: productId,
      label: s.label,
      value: s.value,
      group: s.group ?? null,
      order,
    }));
  });
  console.log(`Inserting ${specRows.length} specifications…`);
  if (specRows.length > 0) {
    const { error: specErr } = await supabase.from("product_specifications").insert(specRows);
    if (specErr) throw new Error(`Failed inserting product_specifications: ${specErr.message}`);
  }

  const accessoryRows = products.flatMap((p) => {
    const productId = productIdBySlug.get(p.slug);
    if (!productId) return [];
    return p.accessorySlugs
      .map((slug) => productIdBySlug.get(slug))
      .filter((id): id is string => Boolean(id))
      .map((accessoryId) => ({
        product_id: productId,
        accessory_product_id: accessoryId,
        included: false,
        quantity: 1,
      }));
  });
  console.log(`Inserting ${accessoryRows.length} accessory links…`);
  if (accessoryRows.length > 0) {
    const { error: accErr } = await supabase.from("product_accessories").insert(accessoryRows);
    if (accErr) throw new Error(`Failed inserting product_accessories: ${accErr.message}`);
  }

  const compatRows = products.flatMap((p) => {
    const productId = productIdBySlug.get(p.slug);
    if (!productId) return [];
    return p.compatibleSlugs
      .map((slug) => productIdBySlug.get(slug))
      .filter((id): id is string => Boolean(id))
      .map((compatibleId) => ({ product_id: productId, compatible_product_id: compatibleId }));
  });
  console.log(`Inserting ${compatRows.length} compatibility links…`);
  if (compatRows.length > 0) {
    const { error: compatErr } = await supabase.from("product_compatibility").insert(compatRows);
    if (compatErr) throw new Error(`Failed inserting product_compatibility: ${compatErr.message}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
