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
      currency: dayRate?.currency ?? "GHS",
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

const STATUSES: ProductAvailability[] = [
  "available",
  "reserved",
  "maintenance",
  "coming_soon",
  "unavailable",
];

/**
 * Stock status set on the admin Inventory page (`product_stock.status`),
 * keyed by slug. Overrides the catalogue's default status on the live site.
 */
async function fetchStatusOverrides(): Promise<Map<string, ProductAvailability>> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return new Map();
  const { data, error } = await supabase
    .from("product_stock")
    .select("product_slug, status")
    .not("status", "is", null);
  if (error) {
    console.error("[catalogue/db] Failed to fetch stock status:", error.message);
    return new Map();
  }
  return new Map(
    (data ?? [])
      .filter((row) => STATUSES.includes(row.status))
      .map((row) => [row.product_slug as string, row.status as ProductAvailability])
  );
}

function applyStatus(
  products: DemoProduct[],
  overrides: Map<string, ProductAvailability>
): DemoProduct[] {
  if (overrides.size === 0) return products;
  return products.map((p) => {
    const status = overrides.get(p.slug);
    return status && status !== p.availability ? { ...p, availability: status } : p;
  });
}

/** Fetches once per request/build and reuses the result for every helper below. */
async function getProductPool(): Promise<{ products: DemoProduct[]; fromDb: boolean }> {
  const overridesPromise = fetchStatusOverrides();
  if (cachedProducts) {
    return { products: applyStatus(cachedProducts, await overridesPromise), fromDb: true };
  }

  const dbProducts = await fetchAllProductsFromDb();
  if (dbProducts && dbProducts.length > 0) {
    cachedProducts = dbProducts;
    return { products: applyStatus(dbProducts, await overridesPromise), fromDb: true };
  }

  return { products: applyStatus(getFallbackProducts(), await overridesPromise), fromDb: false };
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

/**
 * Units of each product still free for a date range: units owned
 * (`product_stock`, default 1) minus overlapping confirmed bookings
 * (`rental_bookings`, created when an order is confirmed in admin).
 * Returns `null` when Supabase isn't connected or the lookup fails.
 */
export async function getAvailableUnits(
  slugs: string[],
  startDate: string,
  endDate: string
): Promise<Map<string, number> | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase || slugs.length === 0) return null;

  const [stock, bookings] = await Promise.all([
    supabase.from("product_stock").select("product_slug, units").in("product_slug", slugs),
    supabase
      .from("rental_bookings")
      .select("product_slug, quantity")
      .in("product_slug", slugs)
      .in("status", ["held", "confirmed"])
      .lte("start_date", endDate)
      .gte("end_date", startDate),
  ]);
  if (stock.error || bookings.error) {
    console.error(
      "[catalogue/db] Availability lookup failed:",
      stock.error?.message ?? bookings.error?.message
    );
    return null;
  }

  const units = new Map<string, number>(slugs.map((slug) => [slug, 1]));
  for (const row of stock.data ?? []) units.set(row.product_slug, row.units);
  for (const row of bookings.data ?? []) {
    units.set(row.product_slug, (units.get(row.product_slug) ?? 1) - row.quantity);
  }
  for (const [slug, free] of units) units.set(slug, Math.max(free, 0));
  return units;
}

export interface BookedRange {
  /** ISO dates, inclusive. */
  start: string;
  end: string;
}

const DAY_MS = 86_400_000;
const addDays = (iso: string, n: number) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);

/**
 * Upcoming date ranges when every unit of a product is taken by confirmed
 * orders — i.e. the dates a customer can't rent it. With several units owned,
 * a day only counts once all of them are booked. Empty without Supabase.
 */
export async function getBookedRanges(slug: string, today: string): Promise<BookedRange[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const horizon = addDays(today, 366);

  const [stock, bookings] = await Promise.all([
    supabase.from("product_stock").select("units").eq("product_slug", slug).maybeSingle(),
    supabase
      .from("rental_bookings")
      .select("start_date, end_date, quantity")
      .eq("product_slug", slug)
      .in("status", ["held", "confirmed"])
      .gte("end_date", today)
      .lte("start_date", horizon),
  ]);
  if (stock.error || bookings.error || !bookings.data?.length) return [];
  const units = stock.data?.units ?? 1;

  // Units booked per day, then merge consecutive fully-booked days.
  const perDay = new Map<string, number>();
  for (const b of bookings.data) {
    let day = b.start_date < today ? today : b.start_date;
    const last = b.end_date > horizon ? horizon : b.end_date;
    while (day <= last) {
      perDay.set(day, (perDay.get(day) ?? 0) + b.quantity);
      day = addDays(day, 1);
    }
  }
  const fullDays = [...perDay.entries()]
    .filter(([, booked]) => booked >= units)
    .map(([day]) => day)
    .sort();

  const ranges: BookedRange[] = [];
  for (const day of fullDays) {
    const current = ranges[ranges.length - 1];
    if (current && addDays(current.end, 1) === day) current.end = day;
    else ranges.push({ start: day, end: day });
  }
  return ranges;
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
  // Tables exist but haven't been populated yet — keep the built-in list.
  if (data.length === 0) return staticCategories;

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
  // Tables exist but haven't been populated yet — keep the built-in list.
  if (data.length === 0) return staticBrands;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url ?? undefined,
    description: row.description ?? undefined,
  }));
}
