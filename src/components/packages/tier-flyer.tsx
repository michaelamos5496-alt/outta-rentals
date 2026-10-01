import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getProductBySlug } from "@/lib/catalogue";
import { getProductImage } from "@/lib/editorial-images";
import { getTierTotal, type PackageTier, type ProductionPackage } from "@/lib/packages";
import { formatTotal } from "@/lib/currency";

/**
 * A tier's card image as a mini movie-poster flyer — the tier's hero item
 * photographed full-bleed, dark scrim, package name small and tier name
 * big in brand green, same "near-black photo + bold brand-color type"
 * language as the homepage hero — instead of the equipment contact-sheet.
 */
function TierFlyer({ pkg, tier }: { pkg: ProductionPackage; tier: PackageTier }) {
  const heroItem = tier.items.find((i) => i.role === "Camera") ?? tier.items[0];
  const heroProduct = heroItem ? getProductBySlug(heroItem.productSlug) : undefined;
  const photo = heroProduct ? getProductImage(heroProduct.slug, heroProduct.categorySlug) : undefined;
  const rates = getTierTotal(tier);

  return (
    <div className="absolute inset-0 bg-black">
      {photo ? (
        <Image
          src={photo}
          alt=""
          fill
          sizes="(min-width: 1024px) 20vw, 50vw"
          className="object-cover opacity-80 transition-transform duration-500 ease-[var(--ease-outta)] group-hover/pkg:scale-105"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />
      <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4">
        <p className="text-[0.625rem] font-semibold tracking-widest text-white/70 uppercase">{pkg.name}</p>
        <div>
          <p className="font-heading text-brand text-xl leading-[0.95] font-bold uppercase sm:text-2xl">
            {tier.label}
          </p>
          {rates.length > 0 ? (
            <p className="mt-1.5 font-mono text-xs font-semibold text-white">{formatTotal(rates)}/day</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** The flyer wrapped in its card chrome — rounded corners, link, corner arrow. */
function TierCard({ pkg, tier }: { pkg: ProductionPackage; tier: PackageTier }) {
  const href = `/packages/${pkg.slug}?tier=${tier.slug}`;

  return (
    <article className="group/pkg relative aspect-[3/4] overflow-hidden rounded-2xl">
      <Link href={href} className="absolute inset-0 block active:opacity-80">
        <TierFlyer pkg={pkg} tier={tier} />
      </Link>

      <Link
        href={href}
        aria-label={`View ${pkg.name} ${tier.label} package`}
        className="absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full bg-white text-foreground transition-transform active:scale-90"
      >
        <ArrowUpRight className="size-3.5" />
      </Link>
    </article>
  );
}

export { TierFlyer, TierCard };
