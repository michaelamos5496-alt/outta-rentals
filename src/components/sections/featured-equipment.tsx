"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { getCategoryIcon, getProductBySlug } from "@/lib/catalogue";
import { themeImages } from "@/lib/editorial-images";
import { formatTotal } from "@/lib/currency";
import type { ProductionPackage } from "@/lib/packages";

// Featured packages use the same green card as the catalogue grid.
function FeaturedCard({ pkg }: { pkg: ProductionPackage }) {
  const href = `/packages/${pkg.slug}`;
  const heroItem = pkg.items.find((i) => i.role === "Camera") ?? pkg.items[0];
  const heroProduct = heroItem ? getProductBySlug(heroItem.productSlug) : undefined;
  const icon = getCategoryIcon(heroProduct?.categorySlug ?? "cameras");
  const dayRates = pkg.items.flatMap((item) => {
    const product = getProductBySlug(item.productSlug);
    return product ? [{ amount: product.dayRate * item.quantity, currency: product.currency }] : [];
  });

  return (
    <motion.article
      variants={slideUp()}
      className="group/product relative overflow-hidden rounded-2xl bg-brand"
    >
      <Link href={href} className="block active:opacity-80">
        <div className="flex items-start justify-between gap-2 p-3 pb-1.5 sm:p-3.5 sm:pb-1.5">
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-bold leading-tight text-brand-foreground">
              {pkg.name}
            </p>
            <p className="mt-1 text-[0.6875rem] text-brand-foreground/70">
              {pkg.items.length} {pkg.items.length === 1 ? "role" : "roles"} included
            </p>
            {dayRates.length > 0 ? (
              <p className="mt-1.5 font-mono text-sm leading-none font-bold text-brand-foreground">
                From {formatTotal(dayRates)}/day
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative mt-1">
          <MediaPlaceholder
            src={themeImages[pkg.slug]}
            alt={pkg.name}
            icon={icon}
            className="aspect-[16/11] w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
          />
        </div>
      </Link>

      <Link
        href={href}
        aria-label={`View ${pkg.name} package`}
        className="absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full bg-foreground text-background transition-transform active:scale-90"
      >
        <ArrowUpRight className="size-3.5" />
      </Link>
    </motion.article>
  );
}

function FeaturedEquipment({ packages }: { packages: ProductionPackage[] }) {
  return (
    <Section>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <Heading level="h2" eyebrow="Package Rentals">
          Built for the shoot you&rsquo;re on.
        </Heading>
        <p className="text-small max-w-sm">
          Preset kits for documentary, commercial, music video and short film work — customizable before you add them to your kit.
        </p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.06)}
        className="mt-10 grid grid-cols-2 gap-x-2.5 gap-y-3 sm:gap-x-4 sm:gap-y-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {packages.map((pkg) => (
          <FeaturedCard key={pkg.slug} pkg={pkg} />
        ))}
      </motion.div>
    </Section>
  );
}

export { FeaturedEquipment };
