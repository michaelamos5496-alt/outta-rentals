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
import { formatPrice } from "@/lib/currency";
import type { ProductionPackage } from "@/lib/packages";

// Featured packages use the same clapper-board treatment as the catalogue
// grid, so either path into the kit has a recognisably cinematic object.
function FeaturedCard({ pkg }: { pkg: ProductionPackage }) {
  const href = `/packages/${pkg.slug}`;
  const heroItem = pkg.items.find((i) => i.role === "Camera") ?? pkg.items[0];
  const heroProduct = heroItem ? getProductBySlug(heroItem.productSlug) : undefined;
  const icon = getCategoryIcon(heroProduct?.categorySlug ?? "cameras");

  // Real total day rate for the package's line items — same "price tag"
  // pattern as the equipment cards, computed from real product rates.
  const dayRate = pkg.items.reduce((sum, item) => {
    const product = getProductBySlug(item.productSlug);
    return sum + (product ? product.dayRate * item.quantity : 0);
  }, 0);
  const currency = getProductBySlug(pkg.items[0]?.productSlug ?? "")?.currency ?? "GHS";

  return (
    <motion.article
      variants={slideUp()}
      className="group/product relative isolate pt-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-2 left-[-2%] z-10 h-7 w-[104%] origin-[12%_100%] -rotate-[3deg] overflow-hidden rounded-sm bg-brand shadow-sm transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:-rotate-[10deg] motion-reduce:transition-none"
      >
        <div
          className="absolute inset-0 opacity-95"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, var(--background) 0 16px, transparent 16px 32px)",
          }}
        />
        <span className="absolute bottom-[-5px] left-[12%] size-3 rounded-full border-2 border-brand-foreground bg-brand" />
      </div>

      <div className="relative overflow-hidden rounded-lg bg-brand shadow-sm ring-1 ring-foreground/15">
        <Link href={href} className="block active:opacity-80">
          <div className="flex min-h-[5.5rem] items-start justify-between gap-2 border-b border-brand-foreground/30 px-3 pt-4 pb-3 sm:px-3.5">
            <div className="flex min-w-0 flex-1 flex-col justify-end self-stretch">
              <p className="line-clamp-2 text-sm font-bold leading-tight text-brand-foreground">
                {pkg.name}
              </p>
              <p className="mt-1 text-[0.6875rem] text-brand-foreground/70">
                {pkg.items.length} {pkg.items.length === 1 ? "role" : "roles"} included
              </p>
            </div>
            <p className="hidden max-w-[40%] self-end text-right text-[0.625rem] leading-snug text-brand-foreground/70 sm:line-clamp-2 sm:block">
              {pkg.description}
            </p>
          </div>

          <div className="relative mx-3 mt-3 mb-3 overflow-hidden rounded-sm ring-1 ring-foreground/20 sm:mx-3.5">
            <MediaPlaceholder
              src={themeImages[pkg.slug]}
              alt={pkg.name}
              icon={icon}
              className="aspect-[16/10] w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
            />
            {dayRate > 0 ? (
              <span className="absolute right-2 bottom-2 bg-background px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold">
                From {formatPrice(dayRate, currency)}/day
              </span>
            ) : null}
          </div>
        </Link>

        <Link
          href={href}
          aria-label={`View ${pkg.name} package`}
          className="absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full bg-background text-foreground transition-transform active:scale-90"
        >
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
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
