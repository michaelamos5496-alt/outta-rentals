import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import * as memory from "./store";
import type { AdminCategory, AdminProduct, AdminProductImage } from "./types";
import type { ProductAvailability, DemoProductSpec } from "@/lib/catalogue";

/**
 * Admin catalogue CRUD (products and categories).
 *
 * Reads and writes the real `products` / `categories` / `product_images` /
 * `product_specifications` / `rental_rates` / `product_accessories` /
 * `product_compatibility` tables in Supabase via the service role when a
 * project is connected; otherwise falls back to the in-memory demo store
 * (`./store`) so the dashboard still works in local development without a
 * project. Callers must already have checked `getAdminSession()`.
 *
 * `invalidateProductCache()` clears `src/lib/catalogue/db.ts`'s in-process
 * product cache after a write, so the public storefront reflects the change
 * on its very next request instead of whatever was cached earlier in this
 * server instance's lifetime.
 */

interface ProductRow {
  id: string;
  slug: string;
  sku: string;
  name: string;
  short_description: string;
  description: string | null;
  status: ProductAvailability;
  tags: string[];
  included: string[];
  featured: boolean;
  is_new: boolean;
  archived: boolean;
  brand: { slug: string } | null;
  category: { slug: string } | null;
  product_images: { url: string; alt: string; order: number }[];
  product_specifications: { label: string; value: string; group: string | null; order: number }[];
  rental_rates: { price: number; currency: string; period: string }[];
}

const PRODUCT_COLUMNS = `
  id, slug, sku, name, short_description, description, status, tags, included,
  featured, is_new, archived,
  brand:brands ( slug ),
  category:categories ( slug ),
  product_images ( url, alt, order ),
  product_specifications ( label, value, group, order ),
  rental_rates ( price, currency, period )
`;

async function resolveAccessorySlugs(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  productId: string
): Promise<string[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("product_accessories")
    .select("accessory:products!product_accessories_accessory_product_id_fkey(slug)")
    .eq("product_id", productId)
    .returns<{ accessory: { slug: string } | null }[]>();
  return (data ?? []).map((r) => r.accessory?.slug).filter((s): s is string => Boolean(s));
}

async function resolveCompatibleSlugs(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  productId: string
): Promise<string[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("product_compatibility")
    .select("compatible:products!product_compatibility_compatible_product_id_fkey(slug)")
    .eq("product_id", productId)
    .returns<{ compatible: { slug: string } | null }[]>();
  return (data ?? []).map((r) => r.compatible?.slug).filter((s): s is string => Boolean(s));
}

async function toAdminProduct(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  row: ProductRow
): Promise<AdminProduct> {
  const dayRate = row.rental_rates.find((r) => r.period === "day");
  const specifications: DemoProductSpec[] = [...row.product_specifications]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({ label: s.label, value: s.value, group: s.group ?? undefined }));
  const images: AdminProductImage[] = [...row.product_images]
    .sort((a, b) => a.order - b.order)
    .map((img) => ({ url: img.url, alt: img.alt }));

  const [accessorySlugs, compatibleSlugs] = await Promise.all([
    resolveAccessorySlugs(supabase, row.id),
    resolveCompatibleSlugs(supabase, row.id),
  ]);

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
    availability: row.status,
    featured: row.featured,
    isNew: row.is_new,
    specifications,
    included: row.included ?? [],
    accessorySlugs,
    compatibleSlugs,
    images,
    archived: row.archived,
  };
}

export async function listProducts(): Promise<AdminProduct[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return memory.listProducts();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("name")
    .returns<ProductRow[]>();
  if (error) {
    // Most likely cause: migration 005 (adds `products.archived`) hasn't
    // been run yet. Degrade to the in-memory demo list rather than crashing
    // the whole admin dashboard over one missing column.
    console.error("[admin/catalogue] Failed to load products, falling back to demo data:", error.message);
    return memory.listProducts();
  }
  return Promise.all((data ?? []).map((row) => toAdminProduct(supabase, row)));
}

export async function getProductById(id: string): Promise<AdminProduct | undefined> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return memory.getProductById(id);
  if (!/^[0-9a-f-]{36}$/i.test(id)) return memory.getProductById(id);

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("id", id)
    .maybeSingle<ProductRow>();
  if (error) {
    console.error("[admin/catalogue] Failed to load product, falling back to demo data:", error.message);
    return memory.getProductById(id);
  }
  if (!data) return undefined;
  return toAdminProduct(supabase, data);
}

export type AdminProductInput = Omit<AdminProduct, "id">;

async function resolveBrandId(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  brandSlug: string
): Promise<string | null> {
  if (!brandSlug) return null;
  const { data } = await supabase.from("brands").select("id").eq("slug", brandSlug).maybeSingle();
  return data?.id ?? null;
}

async function resolveCategoryId(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  categorySlug: string
): Promise<string | null> {
  if (!categorySlug) return null;
  const { data } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Replaces a product's specs, images, rental rate, accessories and
 * compatibility links to match `input` exactly — delete-then-reinsert is
 * simpler and just as correct as diffing for admin-sized lists like these.
 */
async function writeProductRelations(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  productId: string,
  input: AdminProductInput
): Promise<void> {
  await Promise.all([
    supabase.from("product_specifications").delete().eq("product_id", productId),
    supabase.from("product_images").delete().eq("product_id", productId),
    supabase.from("rental_rates").delete().eq("product_id", productId),
    supabase.from("product_accessories").delete().eq("product_id", productId),
    supabase.from("product_compatibility").delete().eq("product_id", productId),
  ]);

  const tasks: PromiseLike<unknown>[] = [];

  if (input.specifications.length > 0) {
    tasks.push(
      supabase.from("product_specifications").insert(
        input.specifications.map((s, order) => ({
          product_id: productId,
          label: s.label,
          value: s.value,
          group: s.group ?? null,
          order,
        }))
      )
    );
  }

  if (input.images.length > 0) {
    tasks.push(
      supabase.from("product_images").insert(
        input.images.map((img, order) => ({
          product_id: productId,
          url: img.url,
          alt: img.alt,
          is_primary: order === 0,
          order,
        }))
      )
    );
  }

  tasks.push(
    supabase
      .from("rental_rates")
      .insert({ product_id: productId, period: "day", price: input.dayRate, currency: input.currency })
  );

  if (input.accessorySlugs.length > 0) {
    const { data: accessoryProducts } = await supabase
      .from("products")
      .select("id, slug")
      .in("slug", input.accessorySlugs);
    const idBySlug = new Map((accessoryProducts ?? []).map((p) => [p.slug, p.id as string]));
    const rows = input.accessorySlugs
      .map((slug) => idBySlug.get(slug))
      .filter((id): id is string => Boolean(id))
      .map((accessoryProductId) => ({
        product_id: productId,
        accessory_product_id: accessoryProductId,
        included: false,
        quantity: 1,
      }));
    if (rows.length > 0) tasks.push(supabase.from("product_accessories").insert(rows));
  }

  if (input.compatibleSlugs.length > 0) {
    const { data: compatibleProducts } = await supabase
      .from("products")
      .select("id, slug")
      .in("slug", input.compatibleSlugs);
    const idBySlug = new Map((compatibleProducts ?? []).map((p) => [p.slug, p.id as string]));
    const rows = input.compatibleSlugs
      .map((slug) => idBySlug.get(slug))
      .filter((id): id is string => Boolean(id))
      .map((compatibleProductId) => ({ product_id: productId, compatible_product_id: compatibleProductId }));
    if (rows.length > 0) tasks.push(supabase.from("product_compatibility").insert(rows));
  }

  await Promise.all(tasks);
}

export async function createProduct(input: AdminProductInput): Promise<AdminProduct> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return memory.createProduct(input);

  const [brandId, categoryId] = await Promise.all([
    resolveBrandId(supabase, input.brandSlug),
    resolveCategoryId(supabase, input.categorySlug),
  ]);

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      slug: input.slug,
      sku: input.sku,
      brand_id: brandId,
      category_id: categoryId,
      short_description: input.shortDescription,
      description: input.description,
      status: input.availability,
      tags: input.tags,
      included: input.included,
      featured: input.featured ?? false,
      is_new: input.isNew ?? false,
      archived: input.archived,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Couldn't create product: ${error?.message}`);

  await writeProductRelations(supabase, data.id, input);
  const created = await getProductById(data.id);
  if (!created) throw new Error("Product created but couldn't be re-read.");
  return created;
}

export async function updateProduct(
  id: string,
  patch: Partial<AdminProductInput>
): Promise<AdminProduct | undefined> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return memory.updateProduct(id, patch);

  const existing = await getProductById(id);
  if (!existing) return undefined;
  const merged: AdminProductInput = { ...existing, ...patch };

  const [brandId, categoryId] = await Promise.all([
    resolveBrandId(supabase, merged.brandSlug),
    resolveCategoryId(supabase, merged.categorySlug),
  ]);

  const { error } = await supabase
    .from("products")
    .update({
      name: merged.name,
      slug: merged.slug,
      sku: merged.sku,
      brand_id: brandId,
      category_id: categoryId,
      short_description: merged.shortDescription,
      description: merged.description,
      status: merged.availability,
      tags: merged.tags,
      included: merged.included,
      featured: merged.featured ?? false,
      is_new: merged.isNew ?? false,
      archived: merged.archived,
    })
    .eq("id", id);
  if (error) throw new Error(`Couldn't update product: ${error.message}`);

  await writeProductRelations(supabase, id, merged);
  return getProductById(id);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return memory.deleteProduct(id);
  // Related rows (images/specs/rates/accessories/compatibility) cascade.
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(`Couldn't delete product: ${error.message}`);
  return true;
}

export async function setProductArchived(id: string, archived: boolean): Promise<AdminProduct | undefined> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return memory.setProductArchived(id, archived);
  const { error } = await supabase.from("products").update({ archived }).eq("id", id);
  if (error) throw new Error(`Couldn't archive product: ${error.message}`);
  return getProductById(id);
}

// -------------------------------------------------------------- Categories

export async function listCategories(): Promise<AdminCategory[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return memory.listCategories();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("name");
  if (error) throw new Error(`Couldn't load categories: ${error.message}`);
  return (data ?? []).map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? "" }));
}

export async function getCategoryById(id: string): Promise<AdminCategory | undefined> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return memory.getCategoryById(id);
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Couldn't load category: ${error.message}`);
  if (!data) return undefined;
  return { id: data.id, name: data.name, slug: data.slug, description: data.description ?? "" };
}

export type AdminCategoryInput = Omit<AdminCategory, "id">;

export async function createCategory(input: AdminCategoryInput): Promise<AdminCategory> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return memory.createCategory(input);
  const { data, error } = await supabase
    .from("categories")
    .insert({ name: input.name, slug: input.slug, description: input.description || null })
    .select("id, name, slug, description")
    .single();
  if (error || !data) throw new Error(`Couldn't create category: ${error?.message}`);
  return { id: data.id, name: data.name, slug: data.slug, description: data.description ?? "" };
}

export async function updateCategory(
  id: string,
  patch: Partial<AdminCategoryInput>
): Promise<AdminCategory | undefined> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return memory.updateCategory(id, patch);
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.slug !== undefined) update.slug = patch.slug;
  if (patch.description !== undefined) update.description = patch.description || null;
  const { data, error } = await supabase
    .from("categories")
    .update(update)
    .eq("id", id)
    .select("id, name, slug, description")
    .maybeSingle();
  if (error) throw new Error(`Couldn't update category: ${error.message}`);
  if (!data) return undefined;
  return { id: data.id, name: data.name, slug: data.slug, description: data.description ?? "" };
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return memory.deleteCategory(id);
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(`Couldn't delete category: ${error.message}`);
  return true;
}
