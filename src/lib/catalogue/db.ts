import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { listProducts as listAdminProducts } from "@/lib/admin/store";
import { categories as staticCategories } from "./categories";
import { brands as staticBrands } from "./brands";
import type { DemoProduct, DemoProductSpec, ProductAvailability } from "./types";
import type { Category, Brand } from "@/types";
import type {
  ProductQueryRow,
  ProductAccessoryRow,
  ProductCompatibilityRow,
  CategoryRow,
  BrandRow,
} from "@/lib/supabase/database.types";

/**
 * Database-or-fallback product retrieval.
 *
 * When a Supabase project is connected (`NEXT_PUBLIC_SUPABASE_URL` +
 * `SUPABASE_SERVICE_ROLE_KEY` set), every function here queries it and maps
 * rows onto the same `DemoProduct` shape the rest of the app already
 * consumes — so no UI code needs to change. Until then, it transparently
 * falls back to the static demo catalogue (`src/lib/catalogue/products.ts`),
 * which is why the app keeps working today with no project connected.
 *
 * Server-only by design: catalogue reads happen in Server Components (see
 * `src/app/equipment/**`), which keeps the service-role key off the client
 * and lets the client-side `CatalogueView` keep doing synchronous
 * search/filter/sort over an already-fetched array, unchanged from before
 * this phase.
 */

let cachedProducts: DemoProduct[] | null = null;

async function fetchAllProductsFromDb(): Promise<DemoProduct[] | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data: rows, error } = await supabase
    .from("products")
    .select(
      `
        id, slug, sku, name, short_description, description, status,
        stock_quantity, tags, included, featured, is_new,
        brand:brands ( slug ),
        category:categories ( slug ),
        product_images ( url, alt, is_primary, order ),
        product_specifications ( label, value, unit, group, order ),
        rental_rates ( period, price, currency )
      `
    )
    .order("name")
    .returns<ProductQueryRow[]>();

  if (error || !rows) {
    console.error("[catalogue/db] Failed to fetch products:", error?.message);
    return null;
  }

  const ids = rows.map((r) => r.id);

  const [{ data: accessoryRows }, { data: compatRows }] = await Promise.all([
    supabase
      .from("product_accessories")
      .select(
        "product_id, accessory:products!product_accessories_accessory_product_id_fkey(slug)"
      )
      .in("product_id", ids)
      .returns<ProductAccessoryRow[]>(),
    supabase
      .from("product_compatibility")
      .select(
        "product_id, compatible:products!product_compatibility_compatible_product_id_fkey(slug)"
      )
      .in("product_id", ids)
      .returns<ProductCompatibilityRow[]>(),
  ]);

  const accessoryMap = new Map<string, string[]>();
  for (const row of accessoryRows ?? []) {
    const slug = row.accessory?.slug;
    if (!slug) continue;
    const list = accessoryMap.get(row.product_id) ?? [];
    list.push(slug);
    accessoryMap.set(row.product_id, list);
  }

  const compatMap = new Map<string, string[]>();
  for (const row of compatRows ?? []) {
    const slug = row.compatible?.slug;
    if (!slug) continue;
    const list = compatMap.get(row.product_id) ?? [];
    list.push(slug);
    compatMap.set(row.product_id, list);
  }

  return rows.map((row): DemoProduct => {
    const dayRate = row.rental_rates.find((r) => r.period === "day");
    const weekRate = row.rental_rates.find((r) => r.period === "week");
    const specifications: DemoProductSpec[] = [...row.product_specifications]
      .sort((a, b) => a.order - b.order)
      .map((s) => ({ label: s.label, value: s.value, group: s.group ?? undefined }));

    return {
      id: row.id,
      slug: row.slug,
      sku: row.sku,
      name: row.name,
      brandSlug: row.brand?.slug ?? "",
      categorySlug: row.category?.slug ?? "",
      tags: row.tags ?? [],
      shortDescription: row.short_description,
      description: row.description ?? "",
      dayRate: dayRate?.price ?? 0,
      weekRate: weekRate?.price ?? 0,
      currency: dayRate?.currency ?? weekRate?.currency ?? "GHS",
      availability: row.status as ProductAvailability,
      featured: row.featured,
      isNew: row.is_new,
      specifications,
      included: row.included ?? [],
      accessorySlugs: accessoryMap.get(row.id) ?? [],
      compatibleSlugs: compatMap.get(row.id) ?? [],
    };
  });
}

/**
 * Without a live Supabase project, the "database" the storefront reads is
 * the admin store (`src/lib/admin/store.ts`) — seeded from the static demo
 * catalogue, then mutated directly by admin CRUD. That's what makes admin
 * edits show up on the public site in this environment: archived products
 * are excluded, and the admin-only `images`/`archived` fields are stripped
 * back down to the plain `DemoProduct` shape the storefront expects.
 */
function getFallbackProducts(): DemoProduct[] {
  return listAdminProducts()
    .filter((p) => !p.archived)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ images, archived, ...product }) => product);
}

/** Fetches once per request/build and reuses the result for every helper below. */
async function getProductPool(): Promise<{ products: DemoProduct[]; fromDb: boolean }> {
  if (cachedProducts) return { products: cachedProducts, fromDb: true };

  const dbProducts = await fetchAllProductsFromDb();
  if (dbProducts && dbProducts.length > 0) {
    cachedProducts = dbProducts;
    return { products: dbProducts, fromDb: true };
  }

  return { products: getFallbackProducts(), fromDb: false };
}

export async function fetchAllProducts(): Promise<DemoProduct[]> {
  const { products } = await getProductPool();
  return products;
}

export async function fetchProductsByCategory(categorySlug: string): Promise<DemoProduct[]> {
  const { products } = await getProductPool();
  return products.filter((p) => p.categorySlug === categorySlug);
}

export async function fetchProductBySlug(slug: string): Promise<DemoProduct | undefined> {
  const { products, fromDb } = await getProductPool();
  const found = products.find((p) => p.slug === slug);
  if (found) return found;
  // Belt-and-suspenders: if the DB pool was fetched but somehow doesn't
  // contain this slug (e.g. stale cache), fall back to the admin store
  // rather than showing a false "not found."
  return fromDb ? getFallbackProducts().find((p) => p.slug === slug) : undefined;
}

export interface AvailabilityResult {
  available: boolean;
  /** Units free for the range, when known (Supabase-backed only). */
  availableQuantity: number | null;
  source: "database" | "status-only";
}

/**
 * Checks whether a product can be rented for a date range without
 * double-booking. Backed by `get_available_quantity()` / `is_product_available()`
 * in `schema.sql` when Supabase is connected (see that file for how
 * overlapping `rental_bookings` are excluded). Without a live project,
 * falls back to the product's static `status` field only — i.e. "available"
 * unless it's flagged unavailable/maintenance/reserved/coming soon, with no
 * real date-range checking possible yet.
 */
export async function checkProductAvailability(
  product: DemoProduct,
  startDate: string,
  endDate: string,
  quantity = 1
): Promise<AvailabilityResult> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      available: product.availability === "available",
      availableQuantity: null,
      source: "status-only",
    };
  }

  const { data: availableQuantity, error } = await supabase.rpc("get_available_quantity", {
    p_product_id: product.id,
    p_start: startDate,
    p_end: endDate,
  });

  if (error || availableQuantity === null || availableQuantity === undefined) {
    console.error("[catalogue/db] Availability check failed:", error?.message);
    return {
      available: product.availability === "available",
      availableQuantity: null,
      source: "status-only",
    };
  }

  return {
    available: product.availability === "available" && availableQuantity >= quantity,
    availableQuantity,
    source: "database",
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return staticCategories;

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, parent_id, image_url")
    .order("name")
    .returns<CategoryRow[]>();

  if (error || !data) {
    console.error("[catalogue/db] Failed to fetch categories:", error?.message);
    return staticCategories;
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    parentId: row.parent_id,
    imageUrl: row.image_url ?? undefined,
  }));
}

export async function fetchBrands(): Promise<Brand[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return staticBrands;

  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, logo_url, description")
    .order("name")
    .returns<BrandRow[]>();

  if (error || !data) {
    console.error("[catalogue/db] Failed to fetch brands:", error?.message);
    return staticBrands;
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url ?? undefined,
    description: row.description ?? undefined,
  }));
}
