"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { PackageEquipmentGrid } from "@/components/packages/package-equipment-grid";
import { getCategoryIcon, getProductBySlug } from "@/lib/catalogue";
import { themeImages } from "@/lib/editorial-images";
import { formatPrice, formatTotal } from "@/lib/currency";
import { getDefaultTier, getFromPrice, type ProductionPackage } from "@/lib/packages";

// Featured packages use the same green card as the catalogue grid.
function FeaturedCard({ pkg }: { pkg: ProductionPackage }) {
  const href = `/packages/${pkg.slug}`;
  const defaultTier = getDefaultTier(pkg);
  const heroItem = defaultTier.items.find((i) => i.role === "Camera") ?? defaultTier.items[0];
  const heroProduct = heroItem ? getProductBySlug(heroItem.productSlug) : undefined;
  const icon = getCategoryIcon(heroProduct?.categorySlug ?? "cameras");
  const flatPrice = getFromPrice(pkg);
  const dayRates = defaultTier.items.flatMap((item) => {
    const product = getProductBySlug(item.productSlug);
    return product ? [{ amount: product.dayRate * item.quantity, currency: product.currency }] : [];
  });

  return (
    <motion.article
      variants={slideUp()}
      className="group/product relative flex flex-col overflow-hidden rounded-2xl bg-brand"
    >
      <Link href={href} className="flex flex-1 flex-col active:opacity-80">
        <div className="flex items-start justify-between gap-2 p-2.5 pb-1 sm:p-3 sm:pb-1">
          <div className="min-w-0">
            <p className="line-clamp-2 text-xs font-light leading-tight text-brand-foreground">
              {pkg.name}
            </p>
            {flatPrice ? (
              <p className="mt-1 font-mono text-[0.8125rem] leading-none font-bold text-brand-foreground">
                From {formatPrice(flatPrice.amount, flatPrice.currency)}/day
              </p>
            ) : dayRates.length > 0 ? (
              <p className="mt-1 font-mono text-[0.8125rem] leading-none font-bold text-brand-foreground">
                From {formatTotal(dayRates)}/day
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative mt-1 flex-1">
          <div className="aspect-[16/11] w-full" />
          {pkg.slug === "commercial" || pkg.slug === "documentary" ? (
            <PackageEquipmentGrid
              items={defaultTier.items}
              className="absolute inset-0 h-full w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
            />
          ) : (
            <MediaPlaceholder
              src={themeImages[pkg.slug]}
              alt={pkg.name}
              icon={icon}
              className="absolute inset-0 h-full w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
            />
          )}
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
      <div className="flex flex-col items-center gap-4 text-center">
        <Heading level="h2" eyebrow="Package Rentals">
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
        {packages.map((pkg) => (
          <FeaturedCard key={pkg.slug} pkg={pkg} />
        ))}
      </motion.div>
    </Section>
  );
}

export { FeaturedEquipment };
