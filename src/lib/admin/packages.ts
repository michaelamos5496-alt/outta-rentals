import "server-only";

import { getProductBySlug } from "@/lib/catalogue";
import { loadLiveCatalogue } from "@/lib/catalogue/live-server";
import { getAllPackages, getTierPrice } from "@/lib/packages";
import { getDefaultPackage } from "@/lib/packages/live";
import { readSavedPackages, writeSavedPackages } from "@/lib/packages/live-server";
import type { PackageRole, PackageTier, ProductionPackage } from "@/lib/packages/types";
import { packages as allPackages } from "@/lib/packages/data";
import type { LivePackageRow } from "@/lib/packages/live";

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
  /** Omitted when creating a new package; the slug is made from the name. */
  slug?: string;
  name: string;
  description: string;
  tiers: {
    /** Omitted for a tier added in this edit; the slug is made from its label. */
    slug?: string;
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

export type SavePackageResult = { ok: true; slug: string } | { ok: false; error: string };

/** The published packages as they currently are — saved edits applied. */
export async function listAdminPackages(): Promise<ProductionPackage[]> {
  await loadLiveCatalogue();
  return structuredClone(getAllPackages());
}

export async function getAdminPackage(slug: string): Promise<ProductionPackage | undefined> {
  return (await listAdminPackages()).find((p) => p.slug === slug);
}

/** True when a built-in package has been edited away from its original. */
export async function isPackageEdited(slug: string): Promise<boolean> {
  return (await readSavedPackages()).some((r) => r.slug === slug && !r.custom);
}

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || "item";
  let slug = root;
  for (let n = 2; taken.has(slug); n++) slug = `${root}-${n}`;
  return slug;
}

export async function savePackage(input: AdminPackageInput): Promise<SavePackageResult> {
  await loadLiveCatalogue();
  const saved = await readSavedPackages();

  const name = input.name.trim().slice(0, 80);
  if (!name) return fail("The package needs a name.");
  const description = input.description.trim().slice(0, 300);
  if (input.tiers.length === 0 || input.tiers.length > 8) return fail("A package needs between 1 and 8 tiers.");

  const creating = !input.slug;
  let slug = input.slug ?? "";
  if (creating) {
    const taken = new Set([...allPackages.map((p) => p.slug), ...saved.map((r) => r.slug)]);
    slug = uniqueSlug(slugify(name), taken);
  }
  const existing = getAllPackages().find((p) => p.slug === slug);
  if (!creating && !existing) return fail("That package doesn't exist.");

  const tiers: PackageTier[] = [];
  const usedTierSlugs = new Set(input.tiers.flatMap((t) => (t.slug ? [t.slug] : [])));
  for (const tierInput of input.tiers) {
    const label = tierInput.label.trim().slice(0, 30);
    if (!label) return fail("Every tier needs a name.");
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
      if (!getProductBySlug(item.productSlug)) return fail(`${label}: pick a product for every item.`);
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

    let tierSlug = tierInput.slug;
    if (!tierSlug) {
      tierSlug = uniqueSlug(slugify(label), usedTierSlugs);
      usedTierSlugs.add(tierSlug);
    }
    const current = existing?.tiers.find((t) => t.slug === tierSlug);
    const tier: PackageTier = {
      slug: tierSlug,
      label,
      currency: current?.currency ?? "GHS",
      discountPercent: discount,
      items,
    };
    // Keep the stored flat price in step as a fallback; the live price is
    // always worked out from the items and the discount.
    const price = getTierPrice(tier);
    if (price) tier.price = price.amount;
    tiers.push(tier);
  }

  const row: LivePackageRow = { slug, name, description, tiers, ...(creating || existing?.custom ? { custom: true } : {}) };
  const next = [...saved.filter((r) => r.slug !== slug), row];
  const error = await writeSavedPackages(next);
  if (error) return fail(error);
  return { ok: true, slug };
}

/** Puts a built-in package back to its original items and prices. */
export async function resetPackage(slug: string): Promise<SavePackageResult> {
  if (!getDefaultPackage(slug)) return fail("That package doesn't exist.");
  const saved = await readSavedPackages();
  const error = await writeSavedPackages(saved.filter((r) => r.slug !== slug));
  return error ? fail(error) : { ok: true, slug };
}

/** Deletes a package that was created in the admin. The built-in ones can't be deleted. */
export async function deletePackage(slug: string): Promise<SavePackageResult> {
  const saved = await readSavedPackages();
  const row = saved.find((r) => r.slug === slug);
  if (!row?.custom) return fail("Only packages you created can be deleted.");
  const error = await writeSavedPackages(saved.filter((r) => r.slug !== slug));
  return error ? fail(error) : { ok: true, slug };
}
