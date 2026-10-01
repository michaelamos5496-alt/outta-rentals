"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { PackageEquipmentGrid } from "@/components/packages/package-equipment-grid";
import { formatTotal } from "@/lib/currency";
import { getTierTotal, type PackageTier, type ProductionPackage } from "@/lib/packages";

// Featured packages use the same green card as the catalogue grid — one
// card per tier (Commercial's TOP BOY and YOLO each get their own), with
// the package name kept as a small label so it's still clear both belong
// to Commercial.
function FeaturedCard({ pkg, tier }: { pkg: ProductionPackage; tier: PackageTier }) {
  const href = `/packages/${pkg.slug}?tier=${tier.slug}`;
  const rates = getTierTotal(tier);

  return (
    <motion.article
      variants={slideUp()}
      className="group/product relative flex flex-col overflow-hidden rounded-2xl bg-brand"
    >
      <Link href={href} className="flex flex-1 flex-col active:opacity-80">
        <div className="flex items-start justify-between gap-2 p-2.5 pb-1 sm:p-3 sm:pb-1">
          <div className="min-w-0">
            <p className="text-[0.625rem] leading-tight font-semibold tracking-wide text-brand-foreground/70 uppercase">
              {pkg.name}
            </p>
            <p className="mt-0.5 font-mono text-[0.8125rem] leading-none font-bold text-brand-foreground">
              {tier.label}
            </p>
            {rates.length > 0 ? (
              <p className="mt-1 font-mono text-[0.75rem] leading-none font-semibold text-brand-foreground/90">
                {formatTotal(rates)}/day
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative mt-1 flex-1">
          <div className="aspect-[16/11] w-full" />
          <PackageEquipmentGrid
            items={tier.items}
            className="absolute inset-0 h-full w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
          />
        </div>
      </Link>

      <Link
        href={href}
        aria-label={`View ${pkg.name} ${tier.label} package`}
        className="absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full bg-white text-foreground transition-transform active:scale-90"
      >
        <ArrowUpRight className="size-3.5" />
      </Link>
    </motion.article>
  );
}

function FeaturedEquipment({ packages }: { packages: ProductionPackage[] }) {
  const tierCards = packages.flatMap((pkg) => pkg.tiers.map((tier) => ({ pkg, tier })));

  return (
    <Section>
      <div className="flex flex-col items-center gap-4 text-center">
        <Heading level="h2" eyebrow="Package Rentals" eyebrowClassName="text-[clamp(1.75rem,3vw,2.75rem)]">
          Built for the shoot you&rsquo;re on.
        </Heading>
        <p className="text-small max-w-sm">
          Preset kits for documentary and commercial work — customizable before you add them to your kit.
        </p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.06)}
        className="mt-10 grid grid-cols-2 gap-x-2.5 gap-y-3 sm:gap-x-4 sm:gap-y-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {tierCards.map(({ pkg, tier }) => (
          <FeaturedCard key={`${pkg.slug}-${tier.slug}`} pkg={pkg} tier={tier} />
        ))}
      </motion.div>
    </Section>
  );
}

export { FeaturedEquipment };
