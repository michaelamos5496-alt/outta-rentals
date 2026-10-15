import "server-only";

import { getProductBySlug } from "@/lib/catalogue";
import { loadLiveCatalogue } from "@/lib/catalogue/live-server";
import { getAllPackages, getTierPrice } from "@/lib/packages";
import { getDefaultPackage } from "@/lib/packages/live";
import { invalidateLivePackages } from "@/lib/packages/live-server";
import type { PackageRole, PackageTier, ProductionPackage } from "@/lib/packages/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const PACKAGE_ROLES: PackageRole[] = [
  "Camera",
  "Lens",
  "Lighting",
  "Audio",
  "Support",
  "Accessories",
  "Monitoring",
];

export interface AdminPackageInput {
  slug: string;
  name: string;
  description: string;
  tiers: {
    slug: string;
    label: string;
    discountPercent: number;
    items: {
      role: PackageRole;
      productSlug: string;
      orProductSlug?: string;
      dayRate?: number;
      quantity: number;
    }[];
  }[];
}

export type SavePackageResult = { ok: true } | { ok: false; error: string };

/** The published packages as they currently are — saved edits applied. */
export async function listAdminPackages(): Promise<ProductionPackage[]> {
  await loadLiveCatalogue();
  return structuredClone(getAllPackages());
}

export async function getAdminPackage(slug: string): Promise<ProductionPackage | undefined> {
  return (await listAdminPackages()).find((p) => p.slug === slug);
}

/** True when the package has been edited away from its built-in default. */
export async function isPackageEdited(slug: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;
  const { data } = await supabase.from("packages").select("slug").eq("slug", slug).maybeSingle();
  return Boolean(data);
}

function fail(error: string): SavePackageResult {
  return { ok: false, error };
}

export async function savePackage(input: AdminPackageInput): Promise<SavePackageResult> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return fail("The database isn't connected, so edits can't be saved.");

  await loadLiveCatalogue();
  const existing = getAllPackages().find((p) => p.slug === input.slug);
  if (!existing) return fail("That package doesn't exist.");

  const name = input.name.trim().slice(0, 80);
  if (!name) return fail("The package needs a name.");
  const description = input.description.trim().slice(0, 300);
  if (input.tiers.length === 0 || input.tiers.length > 8) return fail("A package needs between 1 and 8 tiers.");

  const tiers: PackageTier[] = [];
  for (const tierInput of input.tiers) {
    const current = existing.tiers.find((t) => t.slug === tierInput.slug);
    if (!current) return fail(`Unknown tier "${tierInput.slug}".`);
    const label = tierInput.label.trim().slice(0, 30);
    if (!label) return fail("Every tier needs a label.");
    const discount = Number(tierInput.discountPercent);
    if (!Number.isFinite(discount) || discount < 0 || discount > 90) {
      return fail(`${label}: the discount must be between 0 and 90%.`);
    }
    if (tierInput.items.length === 0 || tierInput.items.length > 40) {
      return fail(`${label}: a tier needs between 1 and 40 items.`);
    }

    const items: PackageTier["items"] = [];
    for (const item of tierInput.items) {
      if (!PACKAGE_ROLES.includes(item.role)) return fail(`${label}: invalid item role.`);
      if (!getProductBySlug(item.productSlug)) return fail(`${label}: "${item.productSlug}" isn't a product.`);
      if (item.orProductSlug && !getProductBySlug(item.orProductSlug)) {
        return fail(`${label}: "${item.orProductSlug}" isn't a product.`);
      }
      const quantity = Math.floor(Number(item.quantity));
      if (!Number.isFinite(quantity) || quantity < 1 || quantity > 99) return fail(`${label}: quantity must be 1–99.`);
      const clean: PackageTier["items"][number] = { role: item.role, productSlug: item.productSlug, quantity };
      if (item.orProductSlug && item.orProductSlug !== item.productSlug) clean.orProductSlug = item.orProductSlug;
      if (item.dayRate !== undefined && item.dayRate !== null && `${item.dayRate}` !== "") {
        const rate = Number(item.dayRate);
        if (!Number.isFinite(rate) || rate < 0 || rate > 1_000_000) return fail(`${label}: invalid day rate.`);
        clean.dayRate = rate;
      }
      items.push(clean);
    }

    const tier: PackageTier = {
      slug: current.slug,
      label,
      currency: current.currency ?? "GHS",
      discountPercent: discount,
      items,
    };
    // Keep the stored flat price in step as a fallback; the live price is
    // always worked out from the items and the discount.
    const price = getTierPrice(tier);
    if (price) tier.price = price.amount;
    tiers.push(tier);
  }

  const { error } = await supabase
    .from("packages")
    .upsert({ slug: input.slug, name, description, tiers, updated_at: new Date().toISOString() });
  if (error) {
    if (/relation .*packages|schema cache|does not exist/i.test(error.message)) {
      return fail("The packages table doesn't exist yet. Run migration 006_packages.sql in Supabase, then try again.");
    }
    return fail(`Couldn't save: ${error.message}`);
  }
  invalidateLivePackages();
  return { ok: true };
}

export async function resetPackage(slug: string): Promise<SavePackageResult> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return fail("The database isn't connected.");
  if (!getDefaultPackage(slug)) return fail("That package doesn't exist.");
  const { error } = await supabase.from("packages").delete().eq("slug", slug);
  if (error) return fail(`Couldn't reset: ${error.message}`);
  invalidateLivePackages();
  return { ok: true };
}
