"use server";

import { validateDateRange } from "@/lib/kit/rental";
import { fetchAllProducts, fetchProductBySlug, getAvailableUnits } from "./db";
import { getBrandBySlug, getCategoryBySlug } from "./index";
import type { ProductAvailability } from "./types";

export interface KitAvailabilityCheckItem {
  productSlug: string;
  quantity: number;
}

export interface KitAvailabilityResult {
  productSlug: string;
  productName: string;
  available: boolean;
  availableQuantity: number | null;
  /** Why it isn't available: out of service (maintenance etc.) or booked by a confirmed order. */
  reason: "out_of_service" | "booked" | null;
  source: "database" | "status-only";
}

const MAX_AVAILABILITY_ITEMS = 100;

/**
 * Checks every kit line against the requested rental dates — flags items
 * that are out of service or already booked by a confirmed order (see
 * `getAvailableUnits()` in `src/lib/catalogue/db.ts`). Used by `/kit`.
 */
export async function checkKitAvailability(
  items: KitAvailabilityCheckItem[],
  startDate: string,
  endDate: string
): Promise<KitAvailabilityResult[]> {
  const results: KitAvailabilityResult[] = [];
  // Public server action — never trust the payload shape or size.
  if (!Array.isArray(items) || typeof startDate !== "string" || typeof endDate !== "string") {
    return results;
  }
  const safeItems = items
    .filter(
      (item) =>
        item &&
        typeof item.productSlug === "string" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    )
    .slice(0, MAX_AVAILABILITY_ITEMS);

  const datesValid = validateDateRange(startDate, endDate).valid;
  const freeUnits = datesValid
    ? await getAvailableUnits([...new Set(safeItems.map((i) => i.productSlug))], startDate, endDate)
    : null;

  for (const item of safeItems) {
    const product = await fetchProductBySlug(item.productSlug);
    if (!product) continue;
    const inService = product.availability === "available";
    const free = freeUnits?.get(product.slug);

    results.push({
      productSlug: product.slug,
      productName: product.name,
      available: inService && (free === undefined || free >= item.quantity),
      availableQuantity: inService ? (free ?? null) : 0,
      reason: !inService
        ? "out_of_service"
        : free !== undefined && free < item.quantity
          ? "booked"
          : null,
      source: freeUnits ? "database" : "status-only",
    });
  }

  return results;
}

export interface CatalogueSearchResult {
  slug: string;
  name: string;
  brandName: string;
  categoryName: string;
  categorySlug: string;
  availability: ProductAvailability;
  dayRate: number;
  currency: string;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Powers the navbar's search modal. Queries the same DB-or-fallback product
 * pool the storefront reads (`fetchAllProducts`), so results reflect admin
 * edits — same matching rules as `searchProducts` in `./index`, just async
 * and callable from a client component.
 */
export async function searchCatalogueAction(query: string): Promise<CatalogueSearchResult[]> {
  if (typeof query !== "string") return [];
  const q = normalize(query.slice(0, 100));
  if (!q) return [];

  const products = await fetchAllProducts();

  return products
    .filter((p) => {
      const brandName = getBrandBySlug(p.brandSlug)?.name ?? "";
      const categoryName = getCategoryBySlug(p.categorySlug)?.name ?? "";
      const haystack = [p.name, brandName, categoryName, ...p.tags].map(normalize).join(" ");
      return haystack.includes(q);
    })
    .slice(0, 8)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      brandName: getBrandBySlug(p.brandSlug)?.name ?? p.brandSlug,
      categoryName: getCategoryBySlug(p.categorySlug)?.name ?? p.categorySlug,
      categorySlug: p.categorySlug,
      availability: p.availability,
      dayRate: p.dayRate,
      currency: p.currency,
    }));
}

export interface QuickViewAddOn {
  slug: string;
  name: string;
  dayRate: number;
  currency: string;
  imageUrl: string | null;
  categorySlug: string;
  sku: string;
}

/** Which categories work alongside each category — drives cross-category add-on suggestions. */
const ADD_ON_CATEGORIES: Record<string, string[]> = {
  // Order matters: categories are listed in this order, each as its own group.
  // A camera suggests lenses, grip, camera accessories (wireless video/control) and monitors; a lens matte boxes, filters and lens control.
  cameras: ["lenses", "grip", "camera-accessories", "monitors"],
  lenses: ["matte-boxes", "filters", "camera-accessories"],
  // A light suggests its modifiers and the grip to rig it.
  lighting: ["lighting-modifiers", "grip"],
  "lighting-modifiers": ["lighting", "grip"],
  grip: ["camera-accessories", "monitors"],
  monitors: ["camera-accessories", "cameras"],
  "camera-accessories": ["cameras", "monitors", "matte-boxes"],
  filters: ["matte-boxes", "lenses", "cameras"],
  "matte-boxes": ["filters", "lenses", "cameras"],
  audio: ["audio"],
};

/** Generic utility items that aren't camera gear — never auto-suggested on a camera or lens. */
const NOT_CAMERA_GEAR = new Set(["extension-cable"]);

/**
 * Grip that rigs lights (stands), as opposed to the rest of the grip category,
 * which supports cameras (tripods, gimbals, sliders, jibs…). A camera never
 * gets stands suggested and a light never gets tripods.
 */
const LIGHT_RIGGING = new Set(["c-stand-kit", "american-stand"]);

/** The camera accessories that control a lens — all a lens gets from that category. */
const LENS_CONTROL = new Set(["wireless-focus-system", "lidar-focus-pro"]);

/** In the modifiers category but effects, not something that shapes a light — not suggested with one. */
const NOT_A_MODIFIER = new Set(["haze-machine", "smoke-machine"]);

/** Most suggestions taken from any one category, so no single category floods the list. */
const MAX_PER_CATEGORY = 4;

const MOUNT_PATTERN = /\b(e|ef|rf|pl|lpl|mft|m|z|l|x)[- ]?mount\b/gi;

function mountsOf(p: { tags: string[]; name: string; specifications: { value: string }[] }): Set<string> {
  const text = [p.name, ...p.tags, ...p.specifications.map((s) => s.value)].join(" ");
  return new Set([...text.matchAll(MOUNT_PATTERN)].map((m) => m[1].toLowerCase()));
}

/**
 * Add-on suggestions for the equipment popup's "Add to your booking" list:
 * the product's listed accessories and compatible gear first, then in-service
 * items from categories that work alongside it (a camera suggests lenses,
 * grip, camera accessories and monitors; a lens, matte boxes, filters and lens control; a light, modifiers and grip;
 * audio, other audio). Lens-mount
 * items that don't match the product's mount are left out. Items are grouped by
 * category, each capped so one category can't crowd out the rest.
 */
export async function getQuickViewAddOns(
  productSlug: string,
  startDate: string,
  endDate: string
): Promise<QuickViewAddOn[]> {
  if (typeof productSlug !== "string" || typeof startDate !== "string" || typeof endDate !== "string") {
    return [];
  }
  const [all, product] = await Promise.all([fetchAllProducts(), fetchProductBySlug(productSlug)]);
  if (!product) return [];

  const listed = new Set([...product.accessorySlugs, ...product.compatibleSlugs]);
  // A stand is light gear: it suggests lights and modifiers, not camera gear.
  const productIsLightRigging = LIGHT_RIGGING.has(product.slug);
  const allowed = productIsLightRigging
    ? ["lighting", "lighting-modifiers"]
    : (ADD_ON_CATEGORIES[product.categorySlug] ?? []);
  const lightSide = product.categorySlug === "lighting" || product.categorySlug === "lighting-modifiers";
  const mine = mountsOf(product);

  const eligible = all.filter((p) => {
    if (p.slug === product.slug || p.availability !== "available" || p.dayRate <= 0) return false;
    if (listed.has(p.slug)) return true;
    if (NOT_CAMERA_GEAR.has(p.slug) && (product.categorySlug === "cameras" || product.categorySlug === "lenses")) {
      return false;
    }
    if (!allowed.includes(p.categorySlug)) return false;
    // Within a category, keep only what relates closely to this product.
    if (p.categorySlug === "grip" && LIGHT_RIGGING.has(p.slug) !== lightSide) return false;
    if (lightSide && NOT_A_MODIFIER.has(p.slug)) return false;
    if (product.categorySlug === "lenses" && p.categorySlug === "camera-accessories" && !LENS_CONTROL.has(p.slug)) {
      return false;
    }
    // Don't suggest a lens/camera on a different mount.
    const theirs = mountsOf(p);
    if (mine.size > 0 && theirs.size > 0 && ![...theirs].some((m) => mine.has(m))) return false;
    return true;
  });

  const score = (p: (typeof eligible)[number]) =>
    (listed.has(p.slug) ? 100 : 0) +
    p.tags.filter((t) => product.tags.includes(t)).length * 5 +
    ([...mountsOf(p)].some((m) => mine.has(m)) ? 10 : 0);

  // Round-robin across categories, best-scored first within each.
  const buckets = new Map<string, typeof eligible>();
  for (const p of [...eligible].sort((a, b) => score(b) - score(a) || a.dayRate - b.dayRate)) {
    const bucket = buckets.get(p.categorySlug) ?? [];
    if (bucket.length < MAX_PER_CATEGORY) buckets.set(p.categorySlug, [...bucket, p]);
  }
  const order = [...buckets.keys()].sort(
    (a, b) => (allowed.indexOf(a) + 1 || 99) - (allowed.indexOf(b) + 1 || 99)
  );
  // Grouped by category in the order above (not interleaved), so the list
  // reads "lenses, then grip, then lights".
  const candidates: typeof eligible = order.flatMap((c) => buckets.get(c) ?? []).slice(0, 16);

  return candidates.map((p) => ({
    slug: p.slug,
    name: p.name,
    dayRate: p.dayRate,
    currency: p.currency,
    imageUrl: p.images?.[0]?.url ?? null,
    categorySlug: p.categorySlug,
    sku: p.sku,
  }));
}
