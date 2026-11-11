"use client";

import { motion } from "framer-motion";

import { slideUp, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { PackageChooser } from "@/components/packages/package-chooser";
import type { ChooserPackage } from "@/lib/packages/chooser";

function FeaturedEquipment({ packages }: { packages: ChooserPackage[] }) {
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
        <p className="font-mono text-sm tracking-[0.08em] text-muted-foreground uppercase">
          20% Package Discount • All Rates in Ghana Cedis (GHC)
        </p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={slideUp()}
        className="mt-10"
      >
        <h3 className="text-h3 mb-6 text-center tracking-wide uppercase">
          Choose your production package
        </h3>
        <PackageChooser packages={packages} />
      </motion.div>
    </Section>
  );
}

export { FeaturedEquipment };
