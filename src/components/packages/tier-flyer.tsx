import Link from "next/link";
import { ArrowUpRight, Briefcase, Clapperboard, Music2, Video, type LucideIcon } from "lucide-react";

import { getTierFullPrice, getTierTotal, type PackageTier, type ProductionPackage } from "@/lib/packages";
import { formatTotal } from "@/lib/currency";

// One distinct silhouette per package, not tied to any single piece of
// equipment, so the flyer reads as this package's own mark rather than a
// photo of whichever camera happens to be in the tier.
const PACKAGE_ICONS: Record<string, LucideIcon> = {
  commercial: Briefcase,
  documentary: Video,
  "music-video": Music2,
  "short-film": Clapperboard,
};

/**
 * A tier's card image as a designed flyer — no equipment photography, just
 * type and a watermark icon, same "numbered feature card" language as Why
 * OUTTA/Services. The first tier in a package (TOP BOY, LITE, …) gets the
 * dark/premium treatment; the second (YOLO) the lighter brand tint — so the
 * pair in each quadrant reads as a deliberate high/low pairing, not two
 * identical posters with different labels.
 */
function TierFlyer({
  pkg,
  tier,
  premium,
}: {
  pkg: ProductionPackage;
  tier: PackageTier;
  premium: boolean;
}) {
  const Icon = PACKAGE_ICONS[pkg.slug] ?? Video;
  const rates = getTierTotal(tier);
  // The flat quoted rate is already discounted off the sum of the tier's own
  // line items — show that full price struck through next to it, but only
  // when there's an actual flat rate to discount off of and a real saving.
  const fullPrice = getTierFullPrice(tier);
  const fullPriceAmount = fullPrice.reduce((sum, r) => sum + r.amount, 0);
  const discountedAmount = rates.reduce((sum, r) => sum + r.amount, 0);
  const showFullPrice =
    typeof tier.price === "number" && fullPrice.length > 0 && fullPriceAmount > discountedAmount;

  return (
    <div
      className={
        premium
          ? "absolute inset-0 overflow-hidden bg-foreground"
          : "absolute inset-0 overflow-hidden bg-brand"
      }
    >
      <Icon
        aria-hidden
        strokeWidth={1}
        className={
          premium
            ? "pointer-events-none absolute -right-5 -bottom-6 size-32 -rotate-12 text-background/10 select-none sm:size-36"
            : "pointer-events-none absolute -right-5 -bottom-6 size-32 -rotate-12 text-brand-foreground/15 select-none sm:size-36"
        }
      />

      <div className="relative flex h-full flex-col justify-between p-3 sm:p-4">
        <p
          className={
            premium
              ? "text-[0.625rem] font-semibold tracking-widest text-background/60 uppercase"
              : "text-[0.625rem] font-semibold tracking-widest text-brand-foreground/70 uppercase"
          }
        >
          {pkg.name}
        </p>
        <div>
          <p
            className={
              premium
                ? "font-heading text-xl leading-[0.95] font-bold text-background uppercase sm:text-2xl"
                : "font-heading text-xl leading-[0.95] font-bold text-brand-foreground uppercase sm:text-2xl"
            }
          >
            {tier.label}
          </p>
          {showFullPrice || rates.length > 0 ? (
            <div className="mt-1.5">
              {showFullPrice ? (
                <p
                  className={
                    premium
                      ? "font-mono text-sm font-medium text-background/80 line-through decoration-2 sm:text-base"
                      : "font-mono text-sm font-medium text-brand-foreground/85 line-through decoration-2 sm:text-base"
                  }
                >
                  {formatTotal(fullPrice)}/day
                </p>
              ) : null}
              {rates.length > 0 ? (
                <p
                  className={
                    premium
                      ? "font-mono text-lg font-bold text-background sm:text-xl"
                      : "font-mono text-lg font-bold text-brand-foreground sm:text-xl"
                  }
                >
                  {formatTotal(rates)}/day
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** The flyer wrapped in its card chrome — rounded corners, link, corner arrow. */
function TierCard({
  pkg,
  tier,
  premium = false,
}: {
  pkg: ProductionPackage;
  tier: PackageTier;
  premium?: boolean;
}) {
  const href = `/packages/${pkg.slug}?tier=${tier.slug}`;

  return (
    <article className="group/pkg relative aspect-[3/4] overflow-hidden rounded-2xl">
      <Link href={href} className="absolute inset-0 block active:opacity-80">
        <TierFlyer pkg={pkg} tier={tier} premium={premium} />
      </Link>

      <Link
        href={href}
        aria-label={`View ${pkg.name} ${tier.label} package`}
        className="absolute bottom-2 left-2 flex size-5 items-center justify-center rounded-full bg-white text-foreground transition-transform active:scale-90"
      >
        <ArrowUpRight className="size-3" />
      </Link>
    </article>
  );
}

export { TierFlyer, TierCard };
