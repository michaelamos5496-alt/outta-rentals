"use client";

import { motion } from "framer-motion";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { TierCard } from "@/components/packages/tier-flyer";
import { type ProductionPackage } from "@/lib/packages";

function PackageCell({ pkg }: { pkg: ProductionPackage }) {
  // Fixed card width (not a container-filling grid column) so every tier
  // card is the same small size across every package, whether it has two
  // tiers (Documentary) or three (Commercial, Music Video).
  return (
    <motion.div
      variants={slideUp()}
      className="flex flex-col items-center gap-4 px-4 py-8 text-center sm:px-6 sm:py-10"
    >
      <h3 className="text-h3">{pkg.name}</h3>
      <div className="flex w-full flex-wrap justify-center gap-2.5 sm:gap-3">
        {pkg.tiers.map((tier, i) => (
          <div key={tier.slug} className="w-[31%] min-w-[80px]">
            <TierCard pkg={pkg} tier={tier} premium={i === 0} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function FeaturedEquipment({ packages }: { packages: ProductionPackage[] }) {
  // Two packages per row, so each row's own divide-x only lines up its own
  // pair — a plain divide-x/divide-y on one flat grid would also put a
  // vertical rule on the second row's left-hand cell, breaking the cross.
  const rows: ProductionPackage[][] = [];
  for (let i = 0; i < packages.length; i += 2) rows.push(packages.slice(i, i + 2));

  return (
    <Section>
      <div className="flex flex-col items-center gap-4 text-center">
        <Heading
          level="h2"
          eyebrow="Package Rentals"
          eyebrowClassName="text-[clamp(1.75rem,3vw,2.75rem)] text-foreground font-bold"
          className="text-base font-semibold text-brand"
        >
          Built for the shoot you&rsquo;re on.
        </Heading>
        <p className="text-small max-w-sm">
          Preset kits for documentary and commercial work — customizable before you add them to your kit.
        </p>
        <p className="text-meta">20% Package Discount • All Rates in Ghana Cedis (GHC)</p>
      </div>

      {/* A 2x2 grid with a full cross-divider — each quadrant is one
          package, its tiers side by side inside it as mini flyers. */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.06)}
        className="mt-10 divide-y divide-border border-t border-border"
      >
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x sm:divide-border">
            {row.map((pkg) => (
              <PackageCell key={pkg.slug} pkg={pkg} />
            ))}
          </div>
        ))}
      </motion.div>
    </Section>
  );
}

export { FeaturedEquipment };
