import { getProductBySlug } from "@/lib/catalogue";
import { getProductGallery, getProductImage } from "@/lib/editorial-images";
import { getTierFullPrice, getTierTotal } from "./index";
import type { PackageLineItem, PackageTier, ProductionPackage } from "./types";

export interface ChooserTier {
  slug: string;
  label: string;
  /** The tier's day rate — OUTTA's flat quote, or the live item sum when it has none. */
  amount: number;
  currency: string;
  /** The pre-discount sum of each item's own day rate — set only when it's
   * actually higher than `amount`, so a card can show it struck through
   * next to OUTTA's flat quote. */
  fullAmount?: number;
  /** A representative photo — the tier's main camera, when it has one. */
  imageUrl?: string;
  /** Passed through so a card can quick-add the whole tier to the kit. */
  items: PackageLineItem[];
}

/**
 * Manual photo swaps, keyed `${packageSlug}:${tierSlug}` — for a tier whose
 * auto-derived Camera-role photo would otherwise match a sibling tier's in
 * the same package. A different photo of the *same* product (Music Video's
 * and Documentary's TOP GUY and YOLO are both quoted on the same camera —
 * TOP GUY gets its second gallery shot instead). Purely cosmetic for the
 * card — the tier's actual gear/pricing is untouched either way.
 */
const TIER_IMAGE_OVERRIDES: Record<string, () => string | undefined> = {
  "music-video:top-guy": () => getProductGallery("arri-alexa-mini")[1],
  "documentary:top-guy": () => getProductGallery("sony-fx6")[1],
};

/** The tier's hero shot — its Camera-role line item's photo, else its first item's. */
function getTierImage(pkg: ProductionPackage, tier: PackageTier): string | undefined {
  const override = TIER_IMAGE_OVERRIDES[`${pkg.slug}:${tier.slug}`];
  if (override) return override();
  const line = tier.items.find((i) => i.role === "Camera") ?? tier.items[0];
  if (!line) return undefined;
  const product = getProductBySlug(line.productSlug);
  if (!product) return undefined;
  return product.images?.[0]?.url ?? getProductImage(product.slug);
}

export interface ChooserPackage {
  slug: string;
  name: string;
  tiers: ChooserTier[];
}

/** Order the package names appear in the chooser's tabs. */
const TAB_ORDER = ["documentary", "commercial", "short-film", "music-video"];

/** The plain, serializable data the package chooser needs (prices resolved on the server). */
export function toChooserData(packages: ProductionPackage[]): ChooserPackage[] {
  const rank = (slug: string) => {
    const i = TAB_ORDER.indexOf(slug);
    return i === -1 ? TAB_ORDER.length : i;
  };
  return [...packages]
    .sort((a, b) => rank(a.slug) - rank(b.slug))
    .map((pkg) => ({
      slug: pkg.slug,
      name: pkg.name,
      tiers: pkg.tiers.flatMap((tier) => {
        const total = getTierTotal(tier);
        if (total.length === 0) return [];
        const amount = total.reduce((sum, t) => sum + t.amount, 0);
        const fullPrice = getTierFullPrice(tier);
        const fullAmount = fullPrice.reduce((sum, t) => sum + t.amount, 0);
        // Only worth showing struck through when there's a real flat quote
        // (not just a live item sum) and an actual saving off it.
        const showFullPrice = typeof tier.price === "number" && fullPrice.length > 0 && fullAmount > amount;
        return [
          {
            slug: tier.slug,
            label: tier.label,
            amount,
            currency: total[0].currency,
            fullAmount: showFullPrice ? fullAmount : undefined,
            imageUrl: getTierImage(pkg, tier),
            items: tier.items,
          },
        ];
      }),
    }));
}
