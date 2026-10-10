import { getTierTotal } from "./index";
import type { ProductionPackage } from "./types";

export interface ChooserTier {
  slug: string;
  label: string;
  /** The tier's day rate — OUTTA's flat quote, or the live item sum when it has none. */
  amount: number;
  currency: string;
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
          },
        ];
      }),
    }));
}
