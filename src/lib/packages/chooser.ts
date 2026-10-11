import { getProductBySlug } from "@/lib/catalogue";
import { getProductImage } from "@/lib/editorial-images";
import { getTierTotal } from "./index";
import type { PackageLineItem, PackageTier, ProductionPackage } from "./types";

export interface ChooserTier {
  slug: string;
  label: string;
  /** The tier's day rate — OUTTA's flat quote, or the live item sum when it has none. */
  amount: number;
  currency: string;
  /** A representative photo — the tier's main camera, when it has one. */
  imageUrl?: string;
  /** Passed through so a card can quick-add the whole tier to the kit. */
  items: PackageLineItem[];
}

/** The tier's hero shot — its Camera-role line item's photo, else its first item's. */
function getTierImage(tier: PackageTier): string | undefined {
  const line = tier.items.find((i) => i.role === "Camera") ?? tier.items[0];
  if (!line) return undefined;
  const product = getProductBySlug(line.productSlug);
  if (!product) return undefined;
  return product.images?.[0]?.url ?? getProductImage(product.slug, product.categorySlug);
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
        return [
          {
            slug: tier.slug,
            label: tier.label,
            amount: total.reduce((sum, t) => sum + t.amount, 0),
            currency: total[0].currency,
            imageUrl: getTierImage(tier),
            items: tier.items,
          },
        ];
      }),
    }));
}
